# Admin Domain Spec

This document specifies the backend/admin capabilities and UI responsibilities for V2’s admin functions.

It is aligned with:
- `TENANCY_AND_RBAC_MODEL.md` (tenant isolation + RBAC)
- `EVENTS_AUDIT_AND_IMMUTABILITY_PROTOCOL.md` (append-only event lake)
- `CERT_AND_REWARD_ARCHITECTURE.md` (certification progression is evidence-based)

## Admin RBAC

### Roles
- `tenant_admin`
  - can access tenant-wide tracker, cohorts, and audit inspection
  - can manage scenario rollout configuration
  - can review failure events (contract mismatches, LLM errors)

### Enforcement
- Admin endpoints must be scoped to the resolved `tenantId`.
- Admin must never gain cross-tenant visibility.

## Admin UI: core screens (minimum)

### 1) Admin Dashboard
Purpose:
- show “tenant health” and high-level certification/evaluation activity.
Suggested widgets:
- scenario completion counts by scenarioId
- evaluation completion rates vs failures (JSON invalid, LLM errors)
- distribution of certification levels (0–6)
- “top competencies” by evaluation volume

Data sources:
- mostly derived aggregates from `/events` (preferred) and/or cached aggregates in `/analytics`.

### 2) Scenario Operations
Purpose:
- enable/disable scenarios for the tenant
- manage rollout state:
  - stable (production) vs preview (internal testing)
- optionally manage DDA/prompt-version selection per scenario/chassis

Persistence:
- store scenario rollout config in a tenant-scoped configuration doc (not in client bundle).

### 3) Audit / Event Inspection
Purpose:
- allow admins to inspect evaluation evidence for:
  - a profileHash
  - a specific scenarioId/nodeId
  - a date range

Must show:
- evaluation type and timestamp
- awardedScore / demonstrated (or error reason)
- promptVersion/scoringVersion (if applicable)
- anonymized identity only (profileHash)

Never show:
- raw PII identity
- secrets

## Admin actions (state changes)
Admin actions must be server-mediated and should create auditable events when they impact scoring/persistence:

- Scenario rollout changes:
  - create an `ADMIN_CONFIG_CHANGED` event (optional but recommended)
- Persona/voice learning settings (if you add them to V2):
  - must be tenant-scoped and access-controlled

## Acceptance criteria (admin capabilities)
- Any admin request that references another tenant must fail with `403`.
- Audit inspection must be reproducible:
  - admin should be able to verify “why scoring happened” based on event lake entries.
- Contract failures should be visible:
  - admins must see counts and reasons for `EVALUATION_JSON_INVALID` / `EVALUATION_LLM_ERROR`.

