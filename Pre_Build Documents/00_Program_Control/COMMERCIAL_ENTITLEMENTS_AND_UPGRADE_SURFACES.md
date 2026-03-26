# Commercial Licensing, Tenant Entitlements, and Upgrade Surfaces

Purpose: define how **paid access** maps to **tenant-scoped capabilities** and RBAC—without violating V2 rules that all mission truth and scoring claims are **backend-owned** ([V2_VALUE_MOMENTS_SPEC.md](../02_Contracts/06_Design_Authority/V2_VALUE_MOMENTS_SPEC.md), [V2_MICROCOPY_AND_TONE_GUIDE.md](../02_Contracts/06_Design_Authority/V2_MICROCOPY_AND_TONE_GUIDE.md)).

Aligned with: [TENANCY_AND_RBAC_MODEL.md](../02_Contracts/02_Data_Governance/TENANCY_AND_RBAC_MODEL.md), [ADMIN_DOMAIN_SPEC.md](../02_Contracts/04_Admin_and_Tracker/ADMIN_DOMAIN_SPEC.md), [TRACKER_USER_AND_ADMIN_SPEC.md](../02_Contracts/04_Admin_and_Tracker/TRACKER_USER_AND_ADMIN_SPEC.md), [LANDING_AND_DASHBOARD_FLOWS.md](../03_Architecture_and_Product/03_Frontend_and_UX_Architecture/LANDING_AND_DASHBOARD_FLOWS.md), [V2_UX_CONTENT_SYSTEM.md](../03_Architecture_and_Product/03_Frontend_and_UX_Architecture/V2_UX_CONTENT_SYSTEM.md).

---

## 1. Principles

1. **Entitlements are server-resolved:** The client may *reflect* locked features; the backend must **enforce** what scenarios, seats, and admin APIs are allowed for `tenantId`.
2. **No “marketing truth” in UI:** Upgrade prompts must not imply evaluation results, certification level, or mission outcomes the backend has not returned.
3. **Individual vs team is a tenant shape:** An individual buyer is a tenant with **seat limit = 1** and optional **tenant_admin = same user**; team buyers expand seats and delegate `tenant_admin`.

---

## 2. Entitlement model (conceptual schema)

Represent as a tenant-scoped document or billing-linked projection (implementation detail—the **invariants** matter):


| Entitlement key      | Description                                                                   | Typical individual          | Typical team                            |
| -------------------- | ----------------------------------------------------------------------------- | --------------------------- | --------------------------------------- |
| `seat_limit`         | Max active users (or concurrent seats)                                        | 1                           | N                                       |
| `scenario_catalog`   | Allow-list of `scenarioId` or tier tags (e.g., `core`, `advanced`, `preview`) | Core + limited advanced     | Full catalog per contract               |
| `featured_push`      | Marketing/campaign slot on dashboard (“scenario being pushed”)                | Same mechanism              | Tenant admin may override within policy |
| `voice_enabled`      | Voice streaming + voice bridge to evaluation                                  | Optional add-on             | Optional add-on                         |
| `admin_tracker`      | Access to admin dashboard + cohort/audit surfaces                             | Optional or self-only       | On                                      |
| `export_share`       | Dossier/share artifact generation (PDF/image/export API)                      | Limited (e.g., watermarked) | Branding / higher limits                |
| `mentor_quota`       | Optional cap on mentor invocations per period                                 | Plan-based                  | Plan-based                              |
| `tenant_admin_seats` | Number of distinct `tenant_admin` roles                                       | 1                           | ≥1                                      |


**RBAC mapping:**

- `tenant_user`: play missions; view own tracker/dossier; use features allowed by tenant entitlements.
- `tenant_admin`: all of the above within policy + admin surfaces per [ADMIN_DOMAIN_SPEC.md](../02_Contracts/04_Admin_and_Tracker/ADMIN_DOMAIN_SPEC.md); must not bypass mission evaluation or cross tenants.

---

## 3. Enforcement points (must-have)

1. **API:** Every `startMission`, `decision`, voice, mentor, tracker, and admin route resolves `tenantId`, then checks entitlements **before** side effects.
2. **Scenario list:** `GET /api/scenarios/available` (or equivalent) returns only entitled scenarios; dashboard renders locks from **server response**, not static config alone.
3. **Billing status:** If subscription lapses, server returns **403 / payment_required** with stable error codes; UI shows control/status copy per microcopy guide—no dramatized narrative about “your career level.”

---

## 4. Upgrade surfaces (UX attachment points)

All copy on these surfaces should use **control/status** or **instructional** layers for commercial text; do not blend pricing with in-character NPC narrative ([V2_MICROCOPY_AND_TONE_GUIDE.md](../02_Contracts/06_Design_Authority/V2_MICROCOPY_AND_TONE_GUIDE.md)).

### A) Landing dashboard ([LANDING_AND_DASHBOARD_FLOWS.md](../03_Architecture_and_Product/03_Frontend_and_UX_Architecture/LANDING_AND_DASHBOARD_FLOWS.md))

- **Locked scenario cards:** Show label from backend, e.g. “Not included in your plan” + single primary CTA (upgrade / contact sales).
- **Featured / pushed scenario:** Entitled tenants see normal campaign; ineligible tenants see **teaser** that does not spoof playable state (no fake `startMission` success).

### B) Pre-mission / mission entry

- If user lacks entitlement mid-flow: block at **startMission** with user-safe error (already specified in landing flows doc); UI returns to dashboard with upgrade path—not a misleading partial HUD.

### C) Terminal dossier ([V2_UX_CONTENT_SYSTEM.md](../03_Architecture_and_Product/03_Frontend_and_UX_Architecture/V2_UX_CONTENT_SYSTEM.md))

- **Share / export:** If `export_share` is limited, gate **only** the artifact action—not the underlying `isTerminal` evidence the user already earned.
- **Professional summary card (future feature):** Must include **only** fields returned by backend dossier payload; optional privacy toggles per user (no scenario spoilers).

### D) Tracker (user and admin)

- **User tracker:** Always reflect profile-derived truth; optionally show “unlock deeper history” for plan upsell **without** inventing fake stats.
- **Admin tracker:** Entitlement-gated; primary **team** upsell lever—tie copy to cohort health and audit from [TRACKER_USER_AND_ADMIN_SPEC.md](../02_Contracts/04_Admin_and_Tracker/TRACKER_USER_AND_ADMIN_SPEC.md).

### E) Value moments

Commercial CTAs may appear **adjacent** to value moments only when the moment’s **trigger** remains backend-derived ([V2_VALUE_MOMENTS_SPEC.md](../02_Contracts/06_Design_Authority/V2_VALUE_MOMENTS_SPEC.md)).  
**Do not** tie payment prompts to fake “achievement” triggers.

---

## 5. Individual vs team packaging (GTM alignment)


| Dimension    | Individual license                    | Team / org license                 |
| ------------ | ------------------------------------- | ---------------------------------- |
| Buyer        | Practitioner or manager personal card | Department / HR tech / procurement |
| Tenancy      | Single-seat tenant                    | Multi-seat tenant                  |
| Admin        | Minimal or self-admin                 | `tenant_admin` for rollout + audit |
| Proof        | Personal dossier + certification      | Same + cohort analytics            |
| Sales motion | Self-serve checkout                   | Often sales-assisted + pilot       |


---

## 6. Error and credibility checklist (pre-ship for paywall)

- No UI string claims a score, medal, or level unless `MissionState` / dossier payload includes it.
- Locked content never resembles a completed evaluation.
- Payment required errors use calm control/status wording.
- Upgrade modals tested with screen readers (instructional layer clear).

---

## 7. Related documents

- [.agents/product-marketing-context.md](../../.agents/product-marketing-context.md)
- [LIVE_TESTING_BETA_PROGRAM.md](LIVE_TESTING_BETA_PROGRAM.md)
- [CONTENT_STRATEGY_PILLARS_AND_EDITORIAL_CALENDAR.md](CONTENT_STRATEGY_PILLARS_AND_EDITORIAL_CALENDAR.md)

