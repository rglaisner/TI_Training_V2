# Real Firebase auth (production-style)

This app is meant to run with **real Firebase Authentication** and **custom claims** so the backend can resolve `tenantId` and `role`.

## 1. One Firebase project

Use the **same** project for:

- Web app config (`NEXT_PUBLIC_FIREBASE_*` in `apps/frontend/.env.local`)
- Admin SDK / Firestore (`GOOGLE_APPLICATION_CREDENTIALS` or default credentials on `apps/backend`)

## 2. Frontend env (`apps/frontend/.env.local`)

1. Copy `apps/frontend/.env.example` to `.env.local` (if you have not already).
2. In Firebase: open **Project settings** (gear icon next to “Project overview” in the left sidebar), scroll to **Your apps**, choose your **Web** app (`</>`), and copy each value from the config into the matching `NEXT_PUBLIC_FIREBASE_*` line in `.env.local`.

Keep **`NEXT_PUBLIC_API_BASE_URL`** pointing at your backend (for example `http://localhost:4000`).

**Note:** You only need `NEXT_PUBLIC_USE_TEST_AUTH` for automated Playwright tests. If that line is not in your file, you are fine—do not add it for normal sign-in.

## 3. Backend env (`apps/backend/.env.local`)

- `USE_TEST_AUTH=false` (or omit; default is Firebase)
- `USE_IN_MEMORY_PERSISTENCE=false` when using Firestore, or `true` for quick UI-only local runs
- Credentials for Admin SDK (service account JSON path or hosted environment)

## 4. Enable Email/Password in Firebase Console

Authentication → Sign-in method → Email/Password → Enable.

Create a user (Authentication → Users → Add user) or register via your own flow later.

Copy that user’s **UID** from the user row.

## 5. Set custom claims (required)

The API rejects tokens that have no **`tenantId`** claim.

From **`apps/backend`** (with Admin credentials available):

```bash
npm run set-user-claims -- <UID>
```

Optional:

```bash
set TENANT_ID=my-org
set ROLE=tenant_admin
npm run set-user-claims -- <UID>
```

On Unix: `TENANT_ID=my-org ROLE=tenant_admin npm run set-user-claims -- <UID>`

**Important:** the user must **sign out and sign in again** (or wait for token refresh) so the new claims appear on the ID token.

## 6. Run

1. Backend: `npm run dev` in `apps/backend`
2. Frontend: `npm run dev` in `apps/frontend`
3. Open the app, **Sign in**, then **Start Scenario 1**

## Automated E2E only

Playwright starts the dev server with `NEXT_PUBLIC_USE_TEST_AUTH=true` and placeholder Firebase config so tests can mock the API without real sign-in. That is **not** the path for real usage.
