# Rolling Launch Calendar (ORB + Phased Cadence)

Purpose: sustain momentum after live testing with **repeated launch moments**—not a single spike—using **Owned / Rented / Borrowed** channels (see `.cursor/skills/launch-strategy/SKILL.md`).

Anchor docs: [.agents/product-marketing-context.md](../../.agents/product-marketing-context.md), [CONTENT_STRATEGY_PILLARS_AND_EDITORIAL_CALENDAR.md](CONTENT_STRATEGY_PILLARS_AND_EDITORIAL_CALENDAR.md), [COMMERCIAL_ENTITLEMENTS_AND_UPGRADE_SURFACES.md](COMMERCIAL_ENTITLEMENTS_AND_UPGRADE_SURFACES.md).

---

## 1. Channel choices (defaults — adjust to ICP research)

| Type | Primary (default) | Role |
|------|-------------------|------|
| **Owned** | Email list + in-product announcements (dashboard “scenario push” slot per [LANDING_AND_DASHBOARD_FLOWS.md](../03_Architecture_and_Product/03_Frontend_and_UX_Architecture/LANDING_AND_DASHBOARD_FLOWS.md)) | Conversion, retention, proof |
| **Rented** | LinkedIn (B2B TI / people analytics); optional second channel only if resourced | Awareness → owned capture |
| **Borrowed** | 1–2 podcasts or newsletters per quarter; partner webinars sparingly | Credibility bursts |

**Rule:** Every rented/post borrowed asset ends with one **owned** ask: subscribe, book pilot, or start in-product path.

---

## 2. Cadence

| Beat | Frequency | Examples |
|------|-----------|----------|
| **Mini-launch (medium)** | Monthly | New scenario arc, competency pack refresh, tracker widget improvement, voice beta toggle |
| **Major launch** | Quarterly | Paywall on, new team SKU, certification milestone redesign, integration beta |
| **Always-on** | Weekly | Changelog / “what we shipped”; react to beta feedback in public-safe terms |

---

## 3. 90-day rolling calendar template

Copy one row per month and fill dates.

### Month M1 (post live-testing → early access)

| Week | Owned | Rented | Borrowed | Notes |
|------|-------|--------|----------|-------|
| 1 | Email: welcome beta cohort + success checklist | — | — | Link [LIVE_TESTING_BETA_PROGRAM.md](LIVE_TESTING_BETA_PROGRAM.md) internally |
| 2 | In-product: featured scenario + PMF survey nudge | 3 LinkedIn posts (P1, P3, teaser) | — | Drive to hub article |
| 3 | Email: “what good looks like” + dossier screenshot policy | 2 posts | Pitch 1 newsletter | |
| 4 | Email: pricing preview / early access offer | Post + thread on team rollout | — | Align entitlements doc |

### Month M2 (early access scale)

| Week | Owned | Rented | Borrowed | Notes |
|------|-------|--------|----------|-------|
| 1 | Shipped changelog + medium in-app banner | — | — | |
| 2 | Email: team buyer page live | LinkedIn PDF carousel from checklist | — | [CONTENT_STRATEGY](CONTENT_STRATEGY_PILLARS_AND_EDITORIAL_CALENDAR.md) Week 4 |
| 3 | Invite batch 2 to beta OR paid pilot | 2 posts | Podcast prep | |
| 4 | Case study draft (anon) | Thread: myth vs reality | Guest reply | |

### Month M3 (paywall or paid pilot hardening)

| Week | Owned | Rented | Borrowed | Notes |
|------|-------|--------|----------|-------|
| 1 | Launch email: plans + entitlements FAQ | Launch posts | — | No scoring hyperbole |
| 2 | Onboarding sequence kick (see Section 4) | Founder voice post | Webinar optional | |
| 3 | Retention: “second mission” nudge | — | — | Funnel fix from beta |
| 4 | Roundup email + next quarter teaser | — | Commit borrowed slot Q+1 | |

---

## 4. Post-signup / post-launch email sequences (outline)

**Sequence A — Individual self-serve (5 emails over 14 days)**

1. **Day 0:** Access + what to do in 10 minutes (pick scenario, finish one node).
2. **Day 1:** How feedback works (competency link, no spoilers).
3. **Day 3:** Voice/off; dossier explainer; tracker link.
4. **Day 7:** Social proof / beta quote; invite referral.
5. **Day 14:** Upgrade or annual nudge (only if product has tier); survey.

**Sequence B — Team pilot (sales-assisted)**

1. **Kickoff:** Admin checklist + scenario rollout plan.
2. **Day 3:** Cohort metrics walkthrough (what admin dashboard shows).
3. **Day 7:** Security/tenancy one-pager link.
4. **Day 14:** Executive summary template for internal sponsor.
5. **Day 28:** Renewal / expand seats (if pilot ends).

Tone: match [V2_MICROCOPY_AND_TONE_GUIDE.md](../02_Contracts/06_Design_Authority/V2_MICROCOPY_AND_TONE_GUIDE.md) for product emails that mirror in-app status language (short, credible).

---

## 5. Launch day checklist (reuse per mini-launch)

**Day before**

- [ ] Changelog / release notes drafted  
- [ ] In-app copy reviewed for backend-truth  
- [ ] Support macros updated (payment, entitlements)  
- [ ] Analytics/UTM for campaign  

**Launch day**

- [ ] Owned: email + in-product  
- [ ] Rented: 1–2 posts scheduled  
- [ ] Team on call for questions  

**Day after**

- [ ] Follow up engaged commenters → owned capture  
- [ ] Log learnings in beta notes template  

---

## 6. What not to do

- Don’t promise roadmap as shipped; separate **preview** scenarios per admin spec.
- Don’t tie LLM costs or internal incidents to public drama; use ops metrics internally ([OBSERVABILITY_AND_GUARDRAILS.md](../02_Contracts/05_Testing_and_Observability/OBSERVABILITY_AND_GUARDRAILS.md)).

---

## Related

- [INTEGRATION_MILESTONES_AND_DEPENDENCIES.md](INTEGRATION_MILESTONES_AND_DEPENDENCIES.md) — technical gates vs GTM beats  
- [V2_DOC_INVENTORY.md](V2_DOC_INVENTORY.md) — add new docs if you maintain inventory manually
