# Product Marketing Context

*Last updated: 2026-03-25*

Source material: internal blueprint ([FULL_FINAL_BLUEPRINT.md](../Pre_Build%20Documents/03_Architecture_and_Product/01_Blueprint_and_Context/FULL_FINAL_BLUEPRINT.md)), certification model ([CERT_AND_REWARD_ARCHITECTURE.md](../Pre_Build%20Documents/03_Architecture_and_Product/02_Product_and_Scenarios/CERT_AND_REWARD_ARCHITECTURE.md)), scenarios ([SCENARIOS.md](../Pre_Build%20Documents/03_Architecture_and_Product/02_Product_and_Scenarios/SCENARIOS.md)). Replace bracketed verbatim placeholders with exact phrases from prospect and beta conversations.

---

## Product Overview

**One-liner:** Immersive, AI-driven scenario simulation for Talent Intelligence, workforce planning, and people analytics professionals—with evidence-backed calibration, not passive courses.

**What it does:** Learners run RPG-style missions where decisions (branching and free-text) are evaluated against a TI competency catalog. Progression, certification bands, and audit evidence come from backend-owned evaluation and an append-only event stream—not from the UI guessing outcomes.

**Product category:** Professional simulation / judgment calibration for HR intelligence and people analytics; adjacent to skills assessment, executive rehearsal, and serious games for enterprise L&D.

**Product type:** B2B2U SaaS (individual licenses and team/tenant licenses).

**Business model:** Paid access (individual subscription or license; team/tenant seats with admin and scenario rollout). Exact price points and packaging live outside this document.

---

## Target Audience

**Target companies:** Organizations with mature or growing TI / people analytics / workforce planning functions; consultancies training TI practitioners; enterprises needing defensible readiness signals for sensitive decision roles.

**Decision-makers:** Head of People Analytics, Director of Talent Intelligence, Chief People Officer or CHRO (for team rollout), L&D leaders who own capability frameworks, IT/security for tenant onboarding where required.

**Primary use case:** Rehearse high-stakes TI situations (data integrity, stakeholder pressure, OPSEC, executive communication) and build a persistent, credible record of demonstrated judgment.

**Jobs to be done:**
- “I need to practice delivering BLUF-style exec comms under pressure without wrecking my credibility.”
- “I need our TI team to show evidence of judgment, not just completion certificates.”
- “I need scenario practice that adapts to skill level so experts don’t get bored and juniors don’t drown.”

**Use cases:**
- Individual certification and portfolio evidence.
- Cohort rollout with admin visibility into completion, competency trends, and audit trail.
- Scenario libraries themed around foundations, influence, data integrity, and executive presence (see scenario catalog doc).

---

## Personas

| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Practitioner (tenant_user) | Credible skill proof, realistic pressure, feedback that maps to competencies | Generic courses don’t reflect real tradeoffs; fear of “gameified” fluff | Evidence-aligned missions, dossier and tracker grounded in evaluation outcomes |
| Champion (e.g., senior analyst → TI lead) | Team uplift, repeatable practice, low embarrassment risk for busy ICs | Hard to justify new tools; needs quick wins | Clear progression (levels 0–6), medals, labels of excellence, specialty recognition |
| Decision maker (CHRO / VP) | Readiness, risk reduction, auditability | Vendors overclaim AI; needs trust | Tenant isolation, anonymized events, admin tracker for cohort health—not vibe-based scoring |
| Financial buyer | ROI, seat model, contract simplicity | Overlap with LMS spend | Position as judgment layer; optional future LMS hooks (see blueprint phased rollout) |
| Technical influencer | Security, tenancy, no client-side mission truth | Fear of PII in logs | Decoupled stack, backend choke point, contracts for immutability |

---

## Problems & Pain Points

**Core challenge:** TI work blends ambiguous data, political stakes, and time pressure; traditional training rarely rehearses *judgment* with feedback that matches how work actually fails.

**Why alternatives fall short:**
- Video and slide modules don’t evaluate open-ended reasoning against a competency model.
- Generic AI chat lacks scenario structure, progression, enterprise tenancy, and audit posture.
- One-off workshops don’t produce durable, comparable evidence across people and time.

**What it costs them:** Bad calls in exec comms, data integrity, or stakeholder management show up as attrition surprises, compliance exposure, and lost trust—not as a line item.

**Emotional tension:** Fear of being exposed in front of leadership; impostor feelings when data is messy; frustration when “correct” analysis is politically unusable.

---

## Competitive Landscape

**Direct:** Other structured simulation or AI roleplay platforms aimed at enterprise skills (evaluate per vendor when selling).

**Secondary:** LMS course libraries, generic leadership simulations, assessment vendors focused on multiple-choice or 360 only.

**Indirect:** Hiring strong consultants for one-off war games; internal tabletop exercises with no persistent scoring model.

---

## Differentiation

**Key differentiators:** Hybrid branching + open-input evaluation; dual-track serious (competency/cert) vs fun (XP/perks); dynamic difficulty framed per scenario engine; tenant-scoped admin tracker and event-backed audit story; voice-capable mission flow with backend gating (see contracts).

**How we do it differently:** Mission state and evaluation outcomes are backend-owned; UI is a renderer—matches buyer need for “not another black-box AI coach.”

**Why that’s better:** Leaders get organizational readiness signals; practitioners get feedback tied to a competency catalog, not vibes.

**Why customers choose us:** Credible practice under pressure + evidence-shaped outputs + enterprise-friendly tenancy and RBAC story.

---

## Objections & Anti-Personas

| Objection | Response |
|-----------|----------|
| “Is this just ChatGPT with a skin?” | Structured missions, deterministic state machine, competency-linked evaluation contract, append-only events—compare to unconstrained chat. |
| “Will AI grading be fair/defensible?” | Feedback maps to catalog + events; admins can audit failure modes and evidence patterns (within tenant); microcopy never invents scores the backend didn’t return. |
| “We already have an LMS.” | Complement: judgment rehearsal layer; roadmap mentions integrations as future phase, not replacement. |
| “Security / data residency?” | Point to tenancy model, PII segregation, and admin audit without raw PII in event inspection. |

**Anti-persona:** Buyers who need fully bespoke psychometric legal defensibility Day 1 with no iteration; teams unwilling to accept LLM-assisted scoring with human-readable rubric framing.

---

## Switching Dynamics

**Push:** Bad experiences in real meetings; “we train people but they still freeze under exec pressure.”

**Pull:** Realistic missions, medals/levels, admin visibility for teams.

**Habit:** Defaulting to slide decks, lunch-and-learns, or ad-hoc peer rehearsal.

**Anxiety:** Vendor trust, HR/legal reaction to AI scoring, “will this embarrass my team in front of the machine?”

---

## Customer Language

**How they describe the problem (verbatim — fill from interviews):**
- “[Verbatim: e.g., our analysts can crunch data but melt in the CHRO ping thread]”
- “[Verbatim: e.g., we need proof they can handle integrity tradeoffs, not certificates]”

**How they describe the solution (verbatim):**
- “[Verbatim from prospects who saw V2]”

**Words to use:** Judgment, calibration, scenario, evidence, competency, dossier, tenant, audit trail, BLUF, data integrity, readiness.

**Words to avoid:** Guaranteed outcomes, “AI decides your career,” any copy that implies UI knows scores before backend updates (violates credibility contracts).

**Glossary:**

| Term | Meaning |
|------|---------|
| Mission | A running scenario session; state owned by backend. |
| Dossier | Terminal summary UX: cert summary, competency deltas, evidence highlights. |
| Tenant | Organization boundary for data and licensing; maps to team licenses. |
| Value moment | Backend-triggered UX beat tied to real transitions or evaluation outcomes. |

---

## Brand Voice

**Tone:** Professional, mission-control crisp; immersive flavor belongs in narrative layer, not status lines.

**Style:** Direct, actionable control/status text; instructional microcopy that says what to do next.

**Personality:** Credible, high-stakes, respectful of practitioner expertise—not cartoonish, not academic hand-holding.

---

## Proof Points

**Metrics:** [Add: beta NPS, completion rates, time-to-first-terminal, # scenarios completed—when available.]

**Customers:** [Logos when public.]

**Testimonials:**
> “[Quote]” — [Role, org]

**Value themes:**

| Theme | Proof |
|-------|--------|
| Evidence-backed progression | Tracker + event lake design; medal/level architecture |
| Enterprise posture | Tenancy + RBAC + admin audit specs |
| Engagement without losing seriousness | Dual-track economy; DDA per scenario doc |

---

## Goals

**Business goal:** Convert live-testing interest into paid individual and team licenses with low churn and strong cohort expansion.

**Conversion actions:** Start trial or pilot; book team rollout; complete checkout; invite additional seats within tenant.

**Current metrics:** [Fill: waitlist size, active beta users, MRR target if set.]

---

## Related internal docs

- Live testing program: [LIVE_TESTING_BETA_PROGRAM.md](../Pre_Build%20Documents/00_Program_Control/LIVE_TESTING_BETA_PROGRAM.md)
- Licensing and entitlements: [COMMERCIAL_ENTITLEMENTS_AND_UPGRADE_SURFACES.md](../Pre_Build%20Documents/00_Program_Control/COMMERCIAL_ENTITLEMENTS_AND_UPGRADE_SURFACES.md)
- Content strategy: [CONTENT_STRATEGY_PILLARS_AND_EDITORIAL_CALENDAR.md](../Pre_Build%20Documents/00_Program_Control/CONTENT_STRATEGY_PILLARS_AND_EDITORIAL_CALENDAR.md)
- Launch rhythm: [ROLLING_LAUNCH_CALENDAR.md](../Pre_Build%20Documents/00_Program_Control/ROLLING_LAUNCH_CALENDAR.md)
