# Live Testing / Structured Beta Program

Purpose: run the good-faith external review window as a **repeatable beta** with clear inclusion criteria, success metrics, and feedback loops—aligned with [INTEGRATION_MILESTONES_AND_DEPENDENCIES.md](INTEGRATION_MILESTONES_AND_DEPENDENCIES.md) (especially Milestone 4 for scale) and [OBSERVABILITY_AND_GUARDRAILS.md](../02_Contracts/05_Testing_and_Observability/OBSERVABILITY_AND_GUARDRAILS.md) (correlation IDs, structured logs, no PII in logs).

Product marketing context: [.agents/product-marketing-context.md](../../.agents/product-marketing-context.md)

---

## 1. Cohort criteria

### Include

- TI, people analytics, workforce planning, or closely adjacent roles (HRBP + analytics hybrid, internal intelligence roles).
- Able to complete at least **one full mission** inside **14 days** of invite (or agreed window).
- Willing to join a **30-minute** debrief or async written feedback.
- English proficient for current scenario set (adjust if localized later).

### Exclude (for this phase)

- Anyone requiring production SSO / legal DPAs you cannot yet sign (route to pilot queue).
- Competitors evaluating feature parity unless you explicitly want that intelligence.
- Participants who cannot use supported browsers/devices for voice if voice is in scope for their cohort.

### Target size

- **Wave 1:** 5–15 individuals (high trust, diverse seniority).
- **Wave 2:** optional second wave after fixes; same criteria.

---

## 2. Beta agreement (lightweight)

Cover in email or DocuSign one-pager:

- **Confidentiality:** product scenarios and prompts are proprietary; no public screenshots of unreleased narrative without approval.
- **Feedback license:** permission to use **anonymized** quotes and aggregate insights for positioning.
- **No SLA:** best-effort support; known issues may exist.
- **Data:** how accounts, tenants, and events are handled per [TENANCY_AND_RBAC_MODEL.md](../02_Contracts/02_Data_Governance/TENANCY_AND_RBAC_MODEL.md).

---

## 3. Success criteria (exit definition for “live testing succeeded”)

Use jointly with QA milestone evidence:

| Signal | Target (tune per wave) |
|--------|------------------------|
| Invite → **authenticated session** | ≥ 90% within 7 days |
| Auth → **first `startMission`** | ≥ 85% of those who authenticate |
| First mission → **first successful open-input evaluation** (or branching completion if no OI yet) | ≥ 80% |
| Started mission → **terminal dossier** (`isTerminal=true`) | ≥ 60% within cohort window (adjust for length) |
| **Critical defects** blocking progression | zero unresolved P0 at wave end |
| Qualitative: “would recommend” or PMF | see Section 6 |

---

## 4. Instrumentation and funnel metrics (no PII)

Map product funnel to observability fields. All dashboards and alerts must use **sanitized** identifiers only ([OBSERVABILITY_AND_GUARDRAILS.md](../02_Contracts/05_Testing_and_Observability/OBSERVABILITY_AND_GUARDRAILS.md): `tenantId`, `sessionId`, `nodeId`, `correlationId`, never raw transcript in logs).

### Funnel stages

1. **Auth_success** — user obtains valid session / JWT.
2. **Dashboard_view** — scenario list loaded.
3. **Mission_start** — `PlatformClient.startMission` success.
4. **First_turn_submitted** — first decision submitted.
5. **First_evaluation_success** — evaluation contract validated and state advanced (or terminal).
6. **Mission_terminal** — `isTerminal=true` reached.

### Operational metrics to watch during beta

- API error rates and latency for `start`, `decision`, `mentor`.
- `EVAL_JSON_INVALID` / LLM error rates (per tenant aggregate).
- Voice: transcript finalization and discard rates if voice cohort.

### Weekly beta review checklist

- [ ] Funnel conversion by stage (counts only).
- [ ] Top 3 error codes / failure reasons.
- [ ] Qualitative themes from interviews (tagged).

---

## 5. Session notes template (internal)

Use for every debrief or support touch.

```text
Date:
Participant code (no PII):
Role / seniority band:
Wave:

Journey
- Time to first mission start: 
- Scenario(s) played: 
- Terminal reached: Y/N
- Blockers (exact symptom): 

Credibility / trust
- Moments they trusted feedback: 
- Moments they doubted: 

Jobs-to-be-done fit
- Primary job they “hired” the product for: 
- Surprises (positive/negative): 

Sales signals
- Would pay: Y/M/N
- Must-have for team: 
- Objection themes: 

Follow-ups
- Bugs filed: 
- Copy/content tweaks: 
```

---

## 6. Product / market fit touchpoints

Run a **short survey** at two moments (peak-end friendly: after first intense session, after dossier).

### Survey A — After first mission start + meaningful progress (e.g., first evaluation or 15+ min in)

1. What were you trying to accomplish in today’s session? (open)
2. How close did the experience feel to real TI work? (1–5)
3. What felt unfair or “black box” about feedback? (open)

### Survey B — After first **terminal** dossier (or end of window if no terminal)

1. How disappointed would you be if you could no longer use this? (multiple choice: very / somewhat / not disappointed) — PMF-style.
2. What would you tell a colleague? (open)
3. For a **team**, what would you need from an admin view? (open — seeds [TRACKER_USER_AND_ADMIN_SPEC.md](../02_Contracts/04_Admin_and_Tracker/TRACKER_USER_AND_ADMIN_SPEC.md) messaging)

Store responses in a tool you control; do not paste raw responses into tickets with PII.

---

## 7. Interview script (30 minutes)

**Opening (2 min)**  
Thanks; today is about your workflow truth, not flattery. We’ll use a participant code in notes.

**Walkthrough (10 min)**  
“Walk me through what happened from login → scenario pick → first decision → feedback.”

**Depth (12 min)**  
- Where did time pressure feel real vs artificial?  
- When did feedback match how your boss or stakeholders react?  
- Where would this fit: weekly practice, pre-board prep, onboarding?  
- What would block your company from paying?

**Close (6 min)**  
Pricing hypothesis reaction (range only); who else should we invite; optional testimonial ask if delighted.

---

## 8. Handoff to early access / paywall

When Wave 1 meets success criteria:

1. Patch top issues; snapshot **release notes** for Wave 2 or early access list.
2. Update [.agents/product-marketing-context.md](../../.agents/product-marketing-context.md) with verbatim quotes and objections.
3. Align messaging with [COMMERCIAL_ENTITLEMENTS_AND_UPGRADE_SURFACES.md](COMMERCIAL_ENTITLEMENTS_AND_UPGRADE_SURFACES.md) before turning on paid pilots.

---

## References

- [TESTING_PROTOCOL_END_TO_END.md](../02_Contracts/05_Testing_and_Observability/TESTING_PROTOCOL_END_TO_END.md)
- [LANDING_AND_DASHBOARD_FLOWS.md](../03_Architecture_and_Product/03_Frontend_and_UX_Architecture/LANDING_AND_DASHBOARD_FLOWS.md)
- [V2_UX_CONTENT_SYSTEM.md](../03_Architecture_and_Product/03_Frontend_and_UX_Architecture/V2_UX_CONTENT_SYSTEM.md)
