const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();
const { FieldValue } = admin.firestore;
const twilio = require("twilio");

// Set with: firebase functions:config:set twilio.sid="..." twilio.token="..." twilio.from="+1..."
const twilioSid   = functions.config().twilio?.sid || "";
const twilioToken = functions.config().twilio?.token || "";
const twilioFrom  = functions.config().twilio?.from || "";
const twilioClient = (twilioSid && twilioToken) ? twilio(twilioSid, twilioToken) : null;

// Set with: firebase functions:config:set maps.key="..."
const mapsKey = functions.config().maps?.key || "";

/** Utility: geocode an address to {lat,lng} using Google Maps Geocoding */
async function geocodeAddress(address) {
  if (!mapsKey) throw new functions.https.HttpsError("failed-precondition", "MAPS key not configured");
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", mapsKey);
  const res = await fetch(url, { method: "GET" });
  const data = await res.json();
  if (data.status !== "OK" || !data.results?.length) {
    throw new functions.https.HttpsError("invalid-argument", "Could not geocode address");
  }
  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address };
}

/** Utility: simple bounding-box filter around a point (km) */
function boundingBox(lat, lng, radiusKm) {
  const dLat = radiusKm / 110.574;
  const dLng = radiusKm / (111.320 * Math.cos((lat * Math.PI) / 180));
  return {
    minLat: lat - dLat, maxLat: lat + dLat,
    minLng: lng - dLng, maxLng: lng + dLng,
  };
}

/** Callable: createRequest (validates, geocodes, stores) */
exports.createRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Sign in required");

  const { type, title, description, address, useMyLocation, location, urgency } = data || {};
  if (!title || !type) throw new functions.https.HttpsError("invalid-argument", "Missing fields");

  let loc = null, finalAddress = address || "";
  if (useMyLocation && location && typeof location.lat === "number" && typeof location.lng === "number") {
    loc = { lat: location.lat, lng: location.lng };
  } else if (address) {
    const g = await geocodeAddress(address);
    loc = { lat: g.lat, lng: g.lng };
    finalAddress = g.formatted;
  } else {
    throw new functions.https.HttpsError("invalid-argument", "Provide address or location");
  }

  const reqDoc = {
    requesterId: context.auth.uid,
    type, title, description: description || "",
    urgency: urgency || "normal",
    address: finalAddress,
    location: loc,
    status: "open",
    volunteerId: null,
    createdAt: FieldValue.serverTimestamp(),
    claimedAt: null,
    completedAt: null,
    estimatedMinutes: data.estimatedMinutes || 60,
    actualMinutes: null
  };

  const ref = await db.collection("requests").add(reqDoc);
  return { id: ref.id };
});

/** Callable: claimRequest (atomic, only if open) */
exports.claimRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Sign in required");
  const { requestId } = data || {};
  if (!requestId) throw new functions.https.HttpsError("invalid-argument", "Missing requestId");

  const reqRef = db.collection("requests").doc(requestId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(reqRef);
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Request not found");
    const req = snap.data();
    if (req.status !== "open") throw new functions.https.HttpsError("failed-precondition", "Already claimed");

    tx.update(reqRef, {
      status: "claimed",
      volunteerId: context.auth.uid,
      claimedAt: FieldValue.serverTimestamp(),
    });

    // bump volunteer stats doc (lazy init)
    const volRef = db.collection("users").doc(context.auth.uid);
    tx.set(volRef, { totalHoursServed: FieldValue.increment(0) }, { merge: true });
  });

  return { ok: true };
});

/** Callable: completeRequest (logs minutes, updates metrics) */
exports.completeRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Sign in required");
  const { requestId, actualMinutes } = data || {};
  if (!requestId || typeof actualMinutes !== "number")
    throw new functions.https.HttpsError("invalid-argument", "Missing requestId/actualMinutes");

  const reqRef = db.collection("requests").doc(requestId);
  const metricsRef = db.collection("impactMetrics").doc("global");

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(reqRef);
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Request not found");
    const req = snap.data();

    // Only assigned volunteer or requester can complete; prefer volunteer
    const uid = context.auth.uid;
    if (req.volunteerId !== uid && req.requesterId !== uid) {
      throw new functions.https.HttpsError("permission-denied", "Not authorized");
    }

    tx.update(reqRef, {
      status: "completed",
      completedAt: FieldValue.serverTimestamp(),
      actualMinutes,
    });

    if (req.volunteerId) {
      const volRef = db.collection("users").doc(req.volunteerId);
      tx.set(volRef, { totalHoursServed: FieldValue.increment(actualMinutes / 60) }, { merge: true });
    }

    tx.set(metricsRef, {
      totalRequestsCompleted: FieldValue.increment(1),
      totalVolunteerMinutes: FieldValue.increment(actualMinutes),
    }, { merge: true });
  });

  return { ok: true };
});

/** Trigger: onCreate request → notify nearby volunteers (optional) */
exports.notifyVolunteersOnCreate = functions.firestore
  .document("requests/{id}")
  .onCreate(async (snap) => {
    if (!twilioClient) return;
    const req = snap.data();
    if (!req?.location) return;

    // naive radius match: volunteers with availabilityRadiusKm and a saved location
    const radiusKm = 5;
    const box = boundingBox(req.location.lat, req.location.lng, radiusKm);

    const volunteers = await db.collection("users")
      .where("role", "==", "volunteer")
      .where("location.lat", ">=", box.minLat).where("location.lat", "<=", box.maxLat)
      .get();

    const candidates = volunteers.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(v => v.location && v.location.lng >= box.minLng && v.location.lng <= box.maxLng);

    const msg = `NeighborNet: New ${req.type} request near you: "${req.title}". Open the app to claim.`;
    await Promise.all(candidates.map(v => {
      if (!v.phone) return;
      return twilioClient.messages.create({ to: v.phone, from: twilioFrom, body: msg }).catch(() => {});
    }));
  });

/** Trigger: onUpdate status→claimed → notify requester (and volunteer) */
exports.notifyOnClaim = functions.firestore
  .document("requests/{id}")
  .onUpdate(async (change) => {
    if (!twilioClient) return;

    const before = change.before.data();
    const after = change.after.data();
    if (before.status === "open" && after.status === "claimed" && after.volunteerId) {
      const requester = await db.collection("users").doc(after.requesterId).get();
      const volunteer = await db.collection("users").doc(after.volunteerId).get();
      const r = requester.exists ? requester.data() : {};
      const v = volunteer.exists ? volunteer.data() : {};

      const msgToRequester = `Hi ${r?.name || "neighbor"}! ${v?.name || "A volunteer"} accepted: "${after.title}". They’ll reach out soon.`;
      if (r?.phone) {
        await twilioClient.messages.create({ to: r.phone, from: twilioFrom, body: msgToRequester }).catch(() => {});
      }

      const msgToVolunteer = `You claimed: "${after.title}". Requester: ${r?.name || "neighbor"}. Please coordinate and mark complete when done.`;
      if (v?.phone) {
        await twilioClient.messages.create({ to: v.phone, from: twilioFrom, body: msgToVolunteer }).catch(() => {});
      }
    }
  });