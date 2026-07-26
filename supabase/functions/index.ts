// supabase/functions/index.ts
//
// Google's Geocoding REST API doesn't send Access-Control-Allow-Origin,
// so a browser calling it directly with fetch() fails with a CORS error
// — this is exactly why your original functions/index.js did geocoding
// server-side in the first place, and it's why create_request (0003)
// requires already-resolved lat/lng rather than an address. This
// function is that same server-side hop, just as an Edge Function
// instead of a Cloud Function.
//
// Uses its own key (GMAPS_SERVER_KEY), NOT the frontend's
// VITE_GMAPS_API_KEY. That one is restricted by HTTP referrer for
// browser use, and a server-to-server call from Deno has no Referer
// header to match — restrict this one by API (Geocoding API) instead,
// the same split your original functions/index.js already had between
// its `maps.key` config and the frontend's separate browser key.
//
// Required secret: GMAPS_SERVER_KEY (`supabase secrets set GMAPS_SERVER_KEY=...`)
// SUPABASE_URL / SUPABASE_ANON_KEY are injected automatically.

import { createClient } from "npm:@supabase/supabase-js@2";

const GMAPS_SERVER_KEY = Deno.env.get("GMAPS_SERVER_KEY") ?? "";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Require a genuinely signed-in caller, not just anon access —
  // geocoding calls cost money, same reason the original Cloud Function
  // required context.auth before calling this.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Sign in required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!GMAPS_SERVER_KEY) {
    return new Response(JSON.stringify({ error: "GMAPS_SERVER_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { address } = await req.json();
  if (!address || typeof address !== "string") {
    return new Response(JSON.stringify({ error: "address is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", GMAPS_SERVER_KEY);

  const geoRes = await fetch(url);
  const data = await geoRes.json();

  if (data.status !== "OK" || !data.results?.length) {
    return new Response(JSON.stringify({ error: "Could not find that address" }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { lat, lng } = data.results[0].geometry.location;
  return new Response(
    JSON.stringify({ lat, lng, formatted: data.results[0].formatted_address }),
    { headers: { "Content-Type": "application/json" } },
  );
});