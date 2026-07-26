# NeighborNet

A community mutual-aid platform that connects neighbors who need a hand — groceries, tech help, a dog walked, tutoring — with neighbors nearby who are ready to give one. Post a request, and a volunteer close by can see it on a live map and let you know they're on the way.

## Backstory

NeighborNet started as an 8-hour build at an NSBE club hackathon focused on social good. The brief: build something that helps people get non-specialized assistance from their own community, without needing to involve emergency services for things that don't call for them. The original prototype used React and Firebase, and was scoped around three portals (Volunteer, Requester, and Admin) to cover matching, community engagement, and administrative oversight.

Since the hackathon, the project has kept going as a deeper personal project: the entire backend has been rebuilt from Firebase onto Supabase (Postgres, with PostGIS for real geospatial search, Row Level Security, and Edge Functions), and the frontend has been redesigned from the original hackathon UI into its current form.

## What's built today

- **Requester side** — post a request (type, description, urgency, address), and watch its status update live as it moves from *open* → *claimed* → *completed*, without needing to refresh.
- **Volunteer side** — browse open requests within 5km, or view them on an interactive map. Click a pin for a popup with the request's details and address, and claim a request with one tap.
- **Real request lifecycle** — claiming is atomic (two volunteers can't claim the same request), and completing a request logs actual time spent and rolls up into running impact metrics.
- **SMS notifications** — Twilio texts go out when a request is created (to nearby volunteers) and when one is claimed (to both the requester and volunteer), handled through a Postgres trigger calling a Supabase Edge Function.
- **Real geospatial search** — "nearby" is a real PostGIS radius query, not a bounding-box approximation.

## Not yet built

Carried over honestly from the original hackathon scope, rather than left unmentioned:

- **Admin portal** — the original three-portal concept included an administrative view for service oversight. Not implemented in the current codebase.
- **Dedicated accessibility pass for elderly/disabled users** — the UI follows general good practice (semantic form labels, readable type, color contrast), but hasn't had a targeted accessibility audit against that original goal.

## Tech stack

- **Frontend:** React + Vite (JavaScript/JSX)
- **Backend:** [Supabase](https://supabase.com) — Postgres with PostGIS, Row Level Security, Postgres RPC functions, Realtime, and Edge Functions (TypeScript, Deno runtime)
- **Auth:** Supabase Auth (email/password)
- **Maps:** Google Maps JavaScript API, via `@react-google-maps/api`
- **Notifications:** Twilio SMS

## Architecture notes

- **Every write to `requests` goes through a validated Postgres RPC function** (`create_request`, `claim_request`, `complete_request`) — Row Level Security intentionally leaves no direct write policies on the table, so the RPC layer is the only way in. This mirrors how the original Cloud Functions were the only write path into Firestore, just enforced at the database level now instead of the application level.
- **Geocoding runs through a small Edge Function**, not the browser — Google's Geocoding REST API doesn't send CORS headers, so it can't be called directly from client-side JS.
- **Migrations live in `supabase/migrations/`**, applied in order. `supabase/seed.sql` populates realistic demo data (a spread of open/claimed/completed requests) against an existing account, for screenshots or a live demo.

## Getting started

**Prerequisites:** Node.js, a [Supabase](https://supabase.com) project, a Google Maps API key with the Maps JavaScript API enabled and billing turned on.

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GMAPS_API_KEY=
```

Apply the migrations (via the Supabase CLI or by pasting each file into the SQL Editor, in order), then optionally run `supabase/seed.sql` for sample data.

Deploy the two Edge Functions (`supabase/functions/geocode-address`, `supabase/functions/notify-request-event`) and set their secrets — see the comments at the top of each function's `index.ts` for exactly which ones.

```bash
npm run dev
```

## License

MIT — see [LICENSE](./LICENSE).