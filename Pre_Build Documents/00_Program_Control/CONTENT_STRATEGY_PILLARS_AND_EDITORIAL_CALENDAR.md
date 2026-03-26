# Content Strategy: Pillars, Topic Cluster, and Editorial Calendar

Purpose: executable **search-first** content plan for TIC Trainer V2 GTM, aligned with [.agents/product-marketing-context.md](../../.agents/product-marketing-context.md) and the ORB framing in `.cursor/skills/launch-strategy/SKILL.md`.

**Searchable vs shareable:** Prioritize **searchable** assets first (existing demand), then **shareable** pieces (narrative spikes). See `.cursor/skills/content-strategy/SKILL.md`.

---

## 1. Content pillars (5)


| Pillar                                | Audience intent                                                                 | Tie to product                                                                                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P1 — Judgment under pressure**      | How TI practitioners make exec-ready calls when data is messy and time is short | Scenarios, BLUF / exec comms, DDA pressure                                                                                                                                                                                                  |
| **P2 — Data integrity & influence**   | Ethical and political realities of people data in the C-suite                   | Board deck / integrity arcs, “near miss” learning                                                                                                                                                                                           |
| **P3 — Evidence-based readiness**     | What defensible skill proof looks like for TI teams                             | Certification bands, tracker, anonymized event evidence story (high-level)                                                                                                                                                                  |
| **P4 — Scenario design & evaluation** | How structured simulation differs from generic AI chat                          | Open-input evaluation, competency catalog (non-spoiler), credibility UX                                                                                                                                                                     |
| **P5 — Team rollout & governance**    | How leaders scale practice without losing auditability                          | Tenant admin, cohort analytics, scenario rollout ([ADMIN_DOMAIN_SPEC.md](../02_Contracts/04_Admin_and_Tracker/ADMIN_DOMAIN_SPEC.md), [TRACKER_USER_AND_ADMIN_SPEC.md](../02_Contracts/04_Admin_and_Tracker/TRACKER_USER_AND_ADMIN_SPEC.md)) |


---

## 2. Topic cluster (hub + spokes)

**Hub (searchable flagship):**  
“Talent Intelligence scenario practice: how teams rehearse high-stakes judgment (without another slide deck)”

**Spokes (examples):**

- P1: “BLUF executive updates for HR intelligence: template + checklist”
- P2: “When the CEO asks to smooth the numbers: a workforce analytics integrity guide”
- P3: “What ‘readiness’ should mean for people analytics (beyond course completion)”
- P4: “Evaluating open-ended TI reasoning: rubric patterns you can explain to Legal”
- P5: “Rolling out TI simulation to a cohort: admin checklist + metrics that matter”

Interlink each spoke to the hub and to **one** appropriate product CTA (trial, pilot, or waitlist).

---

## 3. Editorial calendar (12-week starter)

Adjust dates to your launch; **Week 1 = first publish week post–live-testing kickoff** (or parallel if you publish during beta).


| Week | Publish order | Pillar | Format                                             | Search intent (primary)                                                             | CTA                       |
| ---- | ------------- | ------ | -------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------- |
| 1    | A             | P3     | Long guide (hub draft v1)                          | “talent intelligence training” / “people analytics judgment”                        | Waitlist / apply for beta |
| 2    | B             | P1     | How-to + downloadable checklist                    | “BLUF communication HR” / “executive summary people data”                           | Start trial               |
| 3    | C             | P4     | Explainer (non-spoiler rubric framing)             | “AI assessment open ended responses” / “structured evaluation JSON” (tune keywords) | Book demo                 |
| 4    | D             | P5     | **Team buyer page** (see Section 4 — ship on site) | “workforce analytics team certification” / “cohort training analytics”              | Contact sales             |
| 5    | E             | P2     | Case-style narrative (anonymized)                  | “data integrity board deck HR”                                                      | Pilot                     |
| 6    | F             | P1     | LinkedIn / newsletter derivative of Week 2         | Shareable                                                                           | Owned capture             |
| 7    | G             | P3     | Customer language roundup (from beta)              | Refresh hub with quotes                                                             | Trial                     |
| 8    | H             | P4     | “Myth vs reality: simulation vs chatbot tutor”     | Comparison intent                                                                   | Product                   |
| 9    | I             | P5     | Short admin checklist PDF                          | “roll out training cohort”                                                          | Sales                     |
| 10   | J             | P2     | Invite guest quote or expert comment               | Shareable                                                                           | Newsletter                |
| 11   | K             | P1–P3  | Refresh best performer                             | SEO refresh                                                                         | CTA A/B                   |
| 12   | L             | P5     | Light case: team metrics snapshot (aggregate)      | Proof                                                                               | Expansion revenue         |


**Cadence rule:** Minimum **2 searchable** pieces per month ongoing; **1 shareable** piece per month (Opinion, data teaser, or behind-the-scenes).

---

## 4. Team buyer page — content specification (web)

**Suggested URL slug:** `/for-teams` or `/solutions/talent-intelligence-teams`  
**Primary reader:** Leader buying for a TI / people analytics cohort (CHRO staff, VP People Analytics, Head of Workforce Planning).

### Hero

- **Headline (value):** Evidence-backed judgment practice for your TI bench—without another static course library.
- **Sub:** Tenant-isolated rollout, cohort visibility, audit-friendly evaluation signals—not generic roleplay.

### Sections (map to specs)

1. **What leaders see** — Tie bullets to admin dashboard widgets: scenario completion, evaluation success vs contract failures, certification distribution (**ADMIN_DOMAIN_SPEC** overview widgets).
2. **Cohort readiness** — Competency trends, top competencies by volume, completion (**TRACKER_USER_AND_ADMIN_SPEC** cohort slice).
3. **Audit posture** — Anonymized event inspection, drill-down by scenario/node/time; what admins *don’t* see (raw PII) (**TRACKER** security rules).
4. **Rollout controls** — Enable/disable scenarios, stable vs preview; config changes auditable (**ADMIN_DOMAIN_SPEC** scenario operations).
5. **Security framing** — One paragraph: tenant isolation, backend choke point, link to deeper security FAQ when ready (**TENANCY_AND_RBAC_MODEL**).
6. **CTA** — “Book a team pilot” + “Seat model overview” PDF.

### Proof strip

- Placeholder for logos; beta quotes pulled from [.agents/product-marketing-context.md](../../.agents/product-marketing-context.md) when allowed.

### Objections (on-page FAQ)

- “Is this just ChatGPT?” → structured missions + contracts.
- “LLM grading defensibility?” → evidence + admin inspection narrative.
- “LMS overlap?” → complementary layer.

---

## 5. Measurement (lightweight)

- **Search:** impressions/clicks on hub + top 3 spoke URLs; scroll depth on team page.
- **Conversion:** waitlist/trial/book-demo from each piece (UTM per article).
- **Quality:** sales call themes should echo pillar keywords within 90 days.

---

## Related

- [ROLLING_LAUNCH_CALENDAR.md](ROLLING_LAUNCH_CALENDAR.md)
- [LIVE_TESTING_BETA_PROGRAM.md](LIVE_TESTING_BETA_PROGRAM.md)
- [COMMERCIAL_ENTITLEMENTS_AND_UPGRADE_SURFACES.md](COMMERCIAL_ENTITLEMENTS_AND_UPGRADE_SURFACES.md)

