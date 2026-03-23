# Real Firebase auth (production-style)

This app is meant to run with **real Firebase Authentication** and **custom claims** so the backend can resolve `tenantId` and `role`.

## 1. One Firebase project

Use the **same** project for:

- Web app config (`NEXT_PUBLIC_FIREBASE_*` in `apps/frontend/.env.local`)
- Admin SDK / Firestore (`GOOGLE_APPLICATION_CREDENTIALS` or default credentials on `apps/backend`)

## 2. Frontend env (`apps/frontend/.env.local`)

Set all `NEXT_PUBLIC_FIREBASE_*` fields from Firebase Console → Project settings → Your apps → Web app config.

**Turn off** local test bypass for real auth:

- Do **not** set `NEXT_PUBLIC_USE_TEST_AUTH` (or set it to `false`).

Set API URL to your backend:

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` (or your port)

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
