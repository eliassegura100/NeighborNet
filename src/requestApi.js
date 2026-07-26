// src/requestApi.js
//
// Same public shape as the old Firebase version — createRequest(data),
// claimRequest(id), completeRequest(id, actualMinutes), etc. — so pages that already call these don't need
// to change how they call them, even though everything underneath is
// now Postgres RPCs instead of Cloud Functions callables.
import { supabase } from "./supabase";

// Google's Geocoding REST API doesn't send CORS headers, so this can't
// be a direct fetch() from the browser — it goes through the
// geocode-address Edge Function instead, which does that call server-side.
async function geocodeAddress(address) {
  const { data, error } = await supabase.functions.invoke("geocode-address", {
    body: { address },
  });
  if (error) throw new Error(error.message || "Could not geocode that address");
  return data; // { lat, lng, formatted }
}

// Create a new request
export async function createRequest({
  type,
  title,
  description,
  address,
  useMyLocation,
  location,
  urgency,
  estimatedMinutes,
}) {
  let lat, lng, finalAddress;

  if (useMyLocation && location?.lat != null && location?.lng != null) {
    lat = location.lat;
    lng = location.lng;
    finalAddress = address || "";
  } else if (address) {
    const geocoded = await geocodeAddress(address);
    lat = geocoded.lat;
    lng = geocoded.lng;
    finalAddress = geocoded.formatted;
  } else {
    throw new Error("Provide an address or your current location");
  }

  const { data, error } = await supabase.rpc("create_request", {
    p_type: type,
    p_title: title,
    p_description: description,
    p_urgency: urgency,
    p_address: finalAddress,
    p_lat: lat,
    p_lng: lng,
    p_estimated_minutes: estimatedMinutes,
  });
  if (error) throw new Error(error.message);
  return data; // the created request row, including its id
}

// Claim a request
export async function claimRequest(requestId) {
  const { data, error } = await supabase.rpc("claim_request", {
    p_request_id: requestId,
  });
  if (error) throw new Error(error.message);
  return data; // the updated request row
}

// Complete a request
export async function completeRequest(requestId, actualMinutes) {
  const { data, error } = await supabase.rpc("complete_request", {
    p_request_id: requestId,
    p_actual_minutes: actualMinutes,
  });
  if (error) throw new Error(error.message);
  return data; // the updated request row
}

// Find nearby open requests
export async function findNearbyOpenRequests({ lat, lng, radiusKm = 5 }) {
  const { data, error } = await supabase.rpc("find_nearby_open_requests", {
    p_lat: lat,
    p_lng: lng,
    p_radius_km: radiusKm,
  });
  if (error) throw new Error(error.message);
  return data; // [{ id, title, description, lat, lng, ... }]
}

// Update the signed-in user's own profile
export async function updateVolunteerProfile({ name, phone, availabilityRadiusKm, location, role }) {
  const { data, error } = await supabase.rpc("update_my_profile", {
    p_name: name,
    p_phone: phone,
    p_availability_radius_km: availabilityRadiusKm,
    p_lat: location?.lat,
    p_lng: location?.lng,
    p_role: role,
  });
  if (error) throw new Error(error.message);
  return data; // the updated profile row
}