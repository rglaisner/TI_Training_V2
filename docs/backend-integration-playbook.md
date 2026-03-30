# Frontend env setup — what each thing does

**Before debugging “it crashed”:** the backend must be running, and `NEXT_PUBLIC_API_BASE_URL` must use the **same port** as `PORT` in `apps/backend/.env.local` (otherwise the browser talks to nothing).

**Frontend-only `.env` is not enough:** if `NEXT_PUBLIC_USE_PLATFORM_MISSIONS=true`, you must also satisfy **backend** auth: either **`USE_TEST_AUTH=true`** on the backend (matches frontend `NEXT_PUBLIC_USE_TEST_AUTH=true`), **or** `USE_TEST_AUTH=false` on the backend and you **sign in with Firebase** so requests include a **Bearer** token. Changing only the frontend cannot fix a backend port or auth mismatch.

This file is only about **why** the variables in `.env.local` exist. Just: **what it does** and **when you need it**.

---

## Your app talks to two different things

1. **Your TI API** (`NEXT_PUBLIC_API_BASE_URL`) — missions, scores, scenarios. Think: “Node server on port 4000.”
2. **Firebase** (the `NEXT_PUBLIC_FIREBASE_*` keys) — **who is logged in** when you use the real mission screen (`MissionDashboard`). Firebase puts a user session in the browser so the app can send a **Bearer token** to the API.

If the API isn’t running or the URL is wrong, missions won’t start. If Firebase isn’t set up but the UI expects login, you’ll be stuck at sign-in.

---

## Variable cheat sheet

| Variable | What it does |
|----------|----------------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of your backend (e.g. `http://localhost:4000`). All `PlatformClient` calls go here. |
| `NEXT_PUBLIC_FIREBASE_*` (six of them) | Public web app config from Firebase Console → Project settings → Your apps → Web app. Lets the browser show **Sign in with Firebase** and send a real JWT to the API. |
| `NEXT_PUBLIC_USE_TEST_AUTH` | When **`true`**, the browser adds **fake identity headers** (`x-tenant-id`, `x-user-id`, `x-role`) on API requests so the backend can treat you as a test user **without** Firebase. Meant for **Playwright / quick API checks**. Not “more secure”; it’s a dev shortcut. |
| `NEXT_PUBLIC_USE_PLATFORM_MISSIONS` | When **`true`**, `/missions` and office **desk** use **`MissionDashboard`** + **real API** + **Firebase/test auth**. When **`false`** or unset, you get the **prototype** green demo (in-memory missions, no backend). |

---

## Pick **one** way to work locally (avoid confusion)

### A) Prototype only (no backend stress)

- Do **not** set `NEXT_PUBLIC_USE_PLATFORM_MISSIONS`, or set it to `false`.
- You can ignore `API_BASE_URL` for missions; the demo doesn’t use it for that flow.
- `USE_TEST_AUTH` doesn’t matter much for the prototype mission UI.

### B) Real missions **with** Firebase (normal product path)

- Set `NEXT_PUBLIC_USE_PLATFORM_MISSIONS=true`.
- Fill **all** Firebase `NEXT_PUBLIC_*` keys (from Console).
- Set **`NEXT_PUBLIC_API_BASE_URL`** to your running API.
- Set **`NEXT_PUBLIC_USE_TEST_AUTH=false`** or **delete that line** so you’re not mixing “fake headers” with “real user” unless your backend is built for that.

### C) Real missions **without** Firebase UI (API + test identity only)

- Set `NEXT_PUBLIC_USE_PLATFORM_MISSIONS=true`.
- Set `NEXT_PUBLIC_USE_TEST_AUTH=true` (and optionally `NEXT_PUBLIC_TEST_TENANT_ID` / `NEXT_PUBLIC_TEST_USER_ID` if your API expects specific values — see `.env.example`).
- Your backend must **accept** those headers.
- Firebase block can stay empty **only if** you never open Firebase sign-in and your API doesn’t require a Bearer token. (Many stacks still want Firebase or a real token — check your API docs.)

---

## If something fails

- **“Loading scenarios…” forever / error banner** → API not running, wrong URL, or auth rejected.
- **Stuck on sign-in** → Firebase config wrong, or you turned on platform missions but didn’t mean to use Firebase yet (use path A or C).
- **Prototype works, platform doesn’t** → almost always `USE_PLATFORM_MISSIONS` + API + auth mismatch — use the one path above and stick to it.

---

## Later (optional checklist)

When the basics work: extend `MissionState` if the UI needs more fields, wire redo/abandon session on the server, replace mock **Progress** with real tracker API, add E2E against the real API. No need to do that before “I can start and finish one mission locally.”

## Files to know (one line each)

- **Prototype missions:** `PrototypeMissionWorkspace` + `prototypeMissionStore`.
- **Real missions:** `MissionDashboard` + `missionStore` + `PlatformClient`.
- **Switch:** `NEXT_PUBLIC_USE_PLATFORM_MISSIONS` + `MissionsWorkspaceClient` + desk branch in `OfficeLocationClient`.
