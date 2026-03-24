# Production deployment (Vercel + Render)

There is **no Render MCP** in this Cursor workspace (only Vercel, Supabase, etc.). Use the [Render dashboard](https://dashboard.render.com) to create the API service; use [Vercel](https://vercel.com) for the Next.js app.

## Frontend (Vercel)

- **Project:** linked from the monorepo root; config lives in [`vercel.json`](../vercel.json) (`npm ci`, workspace build, `outputDirectory`: `apps/frontend/.next`).
- **Production URL:** `https://ti-training-cert-v2.vercel.app` (or your team’s alias).
- **Required environment variables** (Project → Settings → Environment Variables), for Production (and Preview if you use PR previews):

  - `NEXT_PUBLIC_API_BASE_URL` — your Render API **origin** only, e.g. `https://ti-training-api.onrender.com` (no path).
  - All `NEXT_PUBLIC_FIREBASE_*` values from Firebase (same as [`apps/frontend/.env.example`](../apps/frontend/.env.example)).

- After adding or changing `NEXT_PUBLIC_*`, **redeploy** so they are baked into the client bundle.
- In **Firebase Console** → Authentication → Settings → **Authorized domains**, add your Vercel host (e.g. `ti-training-cert-v2.vercel.app` and `*.vercel.app` as needed).

## API (Render)

- **Blueprint:** [`render.yaml`](../render.yaml) defines a **Web Service** (`ti-training-api`) with `npm ci`, workspace backend build, and `node apps/backend/dist/server.js`. Connect the GitHub repo and apply the blueprint, or create a Web Service manually with the same commands.
- **Secrets (dashboard):**
  - **`FIREBASE_SERVICE_ACCOUNT_JSON`** — paste the **full** JSON from Firebase → Project settings → Service accounts → *Generate new private key* (one line is fine). The server validates it with Zod on startup.
  - Optional: `GEMINI_API_KEY`, `GEMINI_MODEL` ([`docs/gemini-and-missions.md`](gemini-and-missions.md)).
- **Health check:** `GET /health` should return `{ "status": "ok" }`.
- Copy the public **https** service URL into Vercel as `NEXT_PUBLIC_API_BASE_URL`.

## Order of operations

1. Deploy the API on Render; confirm `/health`.
2. Set Vercel env vars (Firebase web + `NEXT_PUBLIC_API_BASE_URL`); redeploy frontend.
3. Add Vercel domain to Firebase authorized domains.
4. Smoke-test sign-in and a mission flow against the live API.
