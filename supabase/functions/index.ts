// supabase/functions/notify-request-event/index.ts
//
// Called by the Postgres triggers in 0004_notify_triggers.sql via pg_net.
// Deno has no Twilio SDK story as clean as the Node one, but Twilio is
// just a REST API — calling it with fetch() + Basic Auth is a handful of
// lines and one less dependency to manage.
//
// Required secrets (set with `supabase secrets set NAME=value`):
//   NOTIFY_FUNCTION_SECRET   shared secret the Postgres trigger sends as
//                            "Authorization: Bearer <secret>" — must match
//                            app.settings.notify_function_secret
//   TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically
// by the Supabase platform, no need to set them yourself.

import { createClient } from "npm:@supabase/supabase-js@2";

const TWILIO_SID = Deno.env.get("TWILIO_SID") ?? "";
const TWILIO_TOKEN = Deno.env.get("TWILIO_TOKEN") ?? "";
const TWILIO_FROM = Deno.env.get("TWILIO_FROM") ?? "";
const NOTIFY_SECRET = Deno.env.get("NOTIFY_FUNCTION_SECRET") ?? "";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function sendSms(to: string | null | undefined, body: string) {
  if (!to || !TWILIO_SID || !TWILIO_TOKEN) return;
  const auth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
  try {
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body }),
      },
    );
  } catch (err) {
    // best-effort, same as the .catch(() => {}) in the original Cloud Functions
    console.error("twilio send failed", err);
  }
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (authHeader !== `Bearer ${NOTIFY_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { event, request_id } = await req.json();
  if (!event || !request_id) {
    return new Response("Missing event/request_id", { status: 400 });
  }

  const { data: request, error } = await supabase
    .from("requests")
    .select("*")
    .eq("id", request_id)
    .single();

  if (error || !request) {
    return new Response("Request not found", { status: 404 });
  }

  if (event === "request_created") {
    const { data: volunteers } = await supabase.rpc("find_nearby_volunteers", {
      p_lat: request.lat,
      p_lng: request.lng,
      p_radius_km: 5,
    });

    const msg =
      `NeighborNet: New ${request.type} request near you: "${request.title}". Open the app to claim.`;
    await Promise.all((volunteers ?? []).map((v: { phone: string }) => sendSms(v.phone, msg)));
  }

  if (event === "request_claimed") {
    const [{ data: requester }, { data: volunteer }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", request.requester_id).single(),
      request.volunteer_id
        ? supabase.from("profiles").select("*").eq("id", request.volunteer_id).single()
        : Promise.resolve({ data: null }),
    ]);

    await sendSms(
      requester?.phone,
      `Hi ${requester?.name ?? "neighbor"}! ${volunteer?.name ?? "A volunteer"} accepted: "${request.title}". They'll reach out soon.`,
    );
    await sendSms(
      volunteer?.phone,
      `You claimed: "${request.title}". Requester: ${requester?.name ?? "neighbor"}. Please coordinate and mark complete when done.`,
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});