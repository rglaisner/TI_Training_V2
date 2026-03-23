# Tenancy & RBAC Model

This document defines how `tenantId` isolation and role-based access control (RBAC) must work so that:
- user data never leaks across tenants
- admin capabilities are scoped and auditable
- all event lake records remain anonymized and append-only

It aligns with the intent in:
- `README.md` / `FULL_FINAL_BLUEPRINT.md` (tenant partitioning, anonymized event lake)
- `SCHEMA_DESIGN_PROFILE_METRICS.md` (profiles and events separation)
- The “Enterprise choke point” principle (backend as enforcement layer)

## Tenancy model

### Required invariant
- Every persisted record that is user-facing (profiles) or audit-relevant (events) must be deterministically associated with exactly one `tenantId`.

### Recommended Firestore layout (conceptual)
Choose one of these patterns and apply consistently across the codebase:

Option A (nested tenant collections):
- `tenants/{tenantId}/profiles/{profileId}`
- `tenants/{tenantId}/events/{eventId}`
- `tenants/{tenantId}/sessions/{sessionId}`

Option B (top-level collections with `tenantId` field + indexes):
- `profiles/{profileId}` (document contains `tenantId`)
- `events/{eventId}` (document contains `tenantId`)
- `sessions/{sessionId}` (document contains `tenantId`)

Operational note:
- Option A simplifies security-rule scoping.
- Option B can be fine, but requires careful composite indexes and consistent query patterns.

## Identity mapping

### Who provides identity?
- Frontend obtains a Firebase JWT (via Firebase Auth).

### How the backend derives tenant identity
The backend MUST map the authenticated Firebase identity to a `tenantId` using one of:
- A server-side mapping table (preferred for enterprise scenarios)
- A custom JWT claim for `tenantId` (works if you control identity issuance)

All requests must result in:
- resolved `tenantId`
- resolved `userId` (or profile key)
- role (user vs admin)

## RBAC roles

Define roles explicitly as a small set (avoid “role strings” scattered in code):
- `tenant_user`: can play missions and view their own profile/progress
- `tenant_admin`: can view tenant-wide analytics, inspect events (with anonymized constraints), and manage scenario rollout

Future roles:
- `tenant_moderator`: could be added for moderation of shared artifacts

## Authorization enforcement points

### Backend enforcement (primary)
- Every API handler must:
  1. authenticate request
  2. resolve `tenantId` + role
  3. authorize the requested resource access (session/profile/events)

### Firestore security rules (defense-in-depth)
Even though the backend is the “enterprise choke point,” Firestore rules should:
- restrict reads/writes by `tenantId`
- forbid updates for immutable event records

## Data access rules (resource-level intent)

### Profiles
- `tenant_user`:
  - can read/write only their own profile record (within their tenant)
- `tenant_admin`:
  - can read any profile within the tenant
  - can modify only through backend endpoints that create an audit trail (avoid direct client writes)

### Sessions
- `tenant_user`:
  - can read/write only their own sessions within their tenant
- `tenant_admin`:
  - can read sessions (optional), primarily for support/debugging
  - should not mutate session state directly

### Events (audit lake)
Events are append-only and anonymized. Authorization should:
- allow creation from the backend for the resolved tenant
- allow reading for admin analytics/audits within tenant
- optionally allow end-users to read *their own* event subset

## Voice-related shared settings
If you later store voice/persona configuration shared across the tenant:
- treat it like a tenant-scoped config document
- keep any “host admin” actions server-mediated
- never store secrets in client-readable places

## Edge cases to handle
- Missing/invalid `Authorization` token:
  - return `401`
- JWT maps to no tenant:
  - return `403`
- Tenant mismatch:
  - return `403`
- Admin token used to access a different tenant’s session/profile:
  - return `403`

