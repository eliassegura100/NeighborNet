// src/firebase/requestApi.js
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase"; // export app from config.js (see note below)

// If you haven't exported `app` yet, in config.js do:
// export const app = initializeApp(firebaseConfig);

const functions = getFunctions(app);

// Callable function wrappers
const createRequestFn = httpsCallable(functions, "createRequest");
const claimRequestFn = httpsCallable(functions, "claimRequest");
const completeRequestFn = httpsCallable(functions, "completeRequest");
const findNearbyOpenRequestsFn = httpsCallable(functions, "findNearbyOpenRequests");
const updateVolunteerProfileFn = httpsCallable(functions, "updateVolunteerProfile");

// Create a new request
export async function createRequest(data) {
  const res = await createRequestFn(data);
  return res.data; // { id: "..." }
}

// Claim a request
export async function claimRequest(requestId) {
  const res = await claimRequestFn({ requestId });
  return res.data; // { ok: true }
}

// Complete a request
export async function completeRequest(requestId, actualMinutes) {
  const res = await completeRequestFn({ requestId, actualMinutes });
  return res.data; // { ok: true }
}

// Find nearby open requests
export async function findNearbyOpenRequests({ lat, lng, radiusKm = 5 }) {
  const res = await findNearbyOpenRequestsFn({ lat, lng, radiusKm });
  return res.data.items; // [{ id, title, description, location, ... }]
}

// Update volunteer profile
export async function updateVolunteerProfile(data) {
  const res = await updateVolunteerProfileFn(data);
  return res.data; // { ok: true }
}
