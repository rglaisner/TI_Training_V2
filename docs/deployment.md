# Production deployment (Vercel + Render)

Use the **Render MCP** (`user-render`) for logs, deploy status, and service details. The **Vercel MCP** (`user-vercel`) covers the Next.js project.

## Live references

| Piece | Value |
| ----- | ----- |
| **API (Render)** | [https://ti-training-api.onrender.com](https://ti-training-api.onrender.com) |
| **Render service ID** | `srv-d70vn13uibrs739kdh10` |
| **Frontend (Vercel)** | [https://ti-training-cert-v2.vercel.app](https://ti-training-cert-v2.vercel.app) |
| **Monorepo config** | Root [`vercel.json`](../vercel.json), [`render.yaml`](../render.yaml) |

## Frontend (Vercel)

- **Environment variables** (Production + Preview if needed):
  - `NEXT_PUBLIC_API_BASE_URL` = `https://ti-training-api.onrender.com` (origin only, no path).
  - All `NEXT_PUBLIC_FIREBASE_*` (see [`apps/frontend/.env.example`](../apps/frontend/.env.example)).
- After changing any `NEXT_PUBLIC_*`, **redeploy** the frontend.
- **Firebase Console** → Authentication → Settings → **Authorized domains**: include `ti-training-cert-v2.vercel.app` and any preview hosts you use.

## API (Render)

- **Build command** (Settings): `npm ci && npm run build --workspace=@ti-training/backend`
- **Start command** (Settings): `node apps/backend/dist/server.js`

  The backend [`package.json`](../apps/backend/package.json) **build** runs `tsc` then **esbuild** bundles the app into `dist/server.js`, so Node can run a single ESM file (plain `tsc` output alone hit `ERR_MODULE_NOT_FOUND` for extensionless relative imports). If your service still uses a different start command, align it with [`render.yaml`](../render.yaml).

- [`render.yaml`](../render.yaml) documents build/start for Blueprint / reference.
- **Secret:** `FIREBASE_SERVICE_ACCOUNT_JSON` (full service account JSON, Zod-validated on boot).
- Optional: `GEMINI_API_KEY`, `GEMINI_MODEL` — [`docs/gemini-and-missions.md`](gemini-and-missions.md).
- **Health:** `GET /health` → `{ "status": "ok" }`.

### Render MCP quick checks

- Service: `get_service` with `serviceId` `srv-d70vn13uibrs739kdh10`.
- Deploy history: `list_deploys` with the same `serviceId`.
- Logs: `list_logs` with `resource: ["srv-d70vn13uibrs739kdh10"]`, `type: ["app"]` or `["build"]`.

## Final checklist

1. Render deploy **live** (not `update_failed`); `/health` returns OK (allow ~30s cold start on free tier).
2. Vercel env vars set; production deployment after the last env change.
3. Firebase authorized domains include the Vercel host.
4. Browser: sign in + start a mission (confirms API + auth).
