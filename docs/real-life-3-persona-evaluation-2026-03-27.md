# 3-Persona Real-Life App Evaluation (2026-03-27)

## Scope and Method

- Simulation-based evaluation using current app behavior and existing QA evidence.
- User journey modeled from app open to mission completion and tracker review.
- Rubric dimensions (1-5): Onboarding Friction, Task Clarity, Perceived Realism, Learning Confidence, UX Delight.
- Persona standard: all three reviewers have high expectations and low tolerance for weak polish or shallow training logic.

## What a New User Sees Right Now (First 10 Minutes)

1. App opens at `/` and immediately redirects to `/office/desk`.
2. User lands directly in an office-themed mission surface (`TIC Trainer V2`), not a classic public onboarding funnel.
3. Authentication panel appears with one of three states:
  - Build misconfigured: strong red Firebase setup blocker panel.
  - Test-bypass mode enabled: amber warning panel.
  - Proper setup: Firebase email/password sign-in form.
4. After auth, scenario list loads from API; if unavailable, user still sees fallback scenario card.
5. User starts scenario and enters mission HUD:
  - branching decision
  - open-input response nodes
  - mentor hint option
  - final terminal dossier with XP/competency output
6. User can then check tracker/experience routes for progress signals.

## Persona 1: Junior TI Pro (Gen Z, high UX expectations)

### Likely Experience Narrative

- First impression is visually coherent and modern enough to feel intentional.
- Immediate redirect into an app shell is fast, but can feel abrupt because orientation is limited.
- If Firebase is not fully wired, frustration spikes quickly (hard blocker before any value moment).
- Once inside mission flow, interaction feels clear: choice -> response -> feedback -> dossier.
- Mentor and score feedback create a sense of momentum, but scenario breadth feels limited after one run.

### Persona Score (1-5)


| Dimension           | Score | Why                                                               |
| ------------------- | ----- | ----------------------------------------------------------------- |
| Onboarding Friction | 2.5   | Setup dependency is unforgiving for true first-time users.        |
| Task Clarity        | 4.2   | Mission path and calls-to-action are straightforward.             |
| Perceived Realism   | 3.8   | Corporate pressure context feels credible.                        |
| Learning Confidence | 3.9   | Feedback loop is visible and actionable.                          |
| UX Delight          | 3.6   | Solid baseline polish, but not yet standout consumer-grade magic. |


### Return Tomorrow?

- **Maybe-yes** if mission content expands and onboarding friction is reduced.

## Persona 2: TI Expert Reviewer (realism and learning rigor)

### Likely Experience Narrative

- Scenario framing (CHRO, Legal, Finance, NDA tension) feels domain-plausible.
- Branching is real at the first decision point, but long-term convergence reduces deep strategic divergence.
- Evaluation is structured and measurable, yet fallback scoring remains heuristic (keyword/rubric-feature driven).
- Mentor guidance is useful and constrained, but effectiveness validation is still mostly internal.
- Net view: credible simulation MVP, not yet a fully adaptive, externally validated training system.

### Persona Score (1-5)


| Dimension           | Score | Why                                                                |
| ------------------- | ----- | ------------------------------------------------------------------ |
| Onboarding Friction | 3.4   | Acceptable for pilot users, not frictionless.                      |
| Task Clarity        | 4.3   | Prompts and expected outputs are clear and role-relevant.          |
| Perceived Realism   | 4.0   | Strong pressure dynamics; limited scenario breadth.                |
| Learning Confidence | 3.7   | Measurable signals exist, but psychometric proof is not yet shown. |
| UX Delight          | 3.3   | Functional and credible, less emphasis on emotional polish.        |


### Return Tomorrow?

- **Yes for pilot feedback**, **not yet as final benchmark product**.

## Persona 3: Non-TI UI/Game Designer (critical UX lens)

### Likely Experience Narrative

- Visual language is consistent and purposeful across major mission surfaces.
- Interaction states (disabled/ready/error) are generally thoughtful.
- Some screens feel information-dense and “system UI” heavy rather than delight-driven.
- Accessibility groundwork exists (focus/skip semantics), but depth is not proven by dedicated a11y tests.
- Overall critique: better than many internal tools, but not yet “spotless UX.”

### Persona Score (1-5)


| Dimension           | Score | Why                                                                           |
| ------------------- | ----- | ----------------------------------------------------------------------------- |
| Onboarding Friction | 2.8   | Auth/setup branch can fail before trust is earned.                            |
| Task Clarity        | 4.1   | Mission progression is legible and stateful.                                  |
| Perceived Realism   | 3.5   | Feels like a simulation tool, not a game-grade immersive product.             |
| Learning Confidence | 3.4   | Outcome surfaces exist, but depth and pacing could improve.                   |
| UX Delight          | 3.2   | Coherent, but lacks premium onboarding choreography and richer micro-moments. |


### Return Tomorrow?

- **Maybe**, mainly to inspect iteration quality rather than for enjoyment.

## Enjoyability Verdict

- **Overall enjoyment: moderate (around 3.5/5).**
- The app is currently more **credible and useful** than it is **delightful and effortless**.
- Users who value practical mission feedback will stay longer than users expecting consumer-level onboarding polish.

## Top Blockers (Severity x Impact)

1. **First-session setup/auth fragility**
  Missing/misaligned Firebase or API wiring can block value before the first mission.
2. **Limited content breadth**
  One primary scenario constrains replay value and perceived learning progression.
3. **Shallow adaptation depth**
  Seed variation and partial branching are helpful but not yet true learner-state adaptation.
4. **Mentor quality proof gap**
  Good behavior constraints exist, but external evidence of mentoring effectiveness is limited.
5. **UX confidence gaps for premium expectations**
  Accessibility/responsive/visual quality are decent, but not comprehensively validated in automated quality gates.

## Fast Wins (1-2 days)

- Add a lightweight first-run orientation panel before mission start (what this is, time needed, success outcome).
- Add a no-dead-end auth fallback message with direct next actions and verification checks.
- Clarify demo/test states in one consistent status chip to avoid confusion about real vs test mode.
- Add one more “featured” scenario variant card to reduce single-content fatigue.

## Strategic Improvements (1-2 sprints)

- Expand scenario catalog to multiple mission families with distinct competency signatures.
- Introduce real adaptive progression (difficulty/branch depth tuned by recent competency trends).
- Add mentor quality instrumentation (helpfulness rating, follow-through, escalation patterns).
- Strengthen UX quality gates with explicit a11y checks, responsive viewport matrix, and visual regression baseline.

## Go / Caution / No-Go Recommendation

- **Recommendation: CAUTION.**
- **Go** for controlled pilot onboarding (guided users, explicit setup checklist).
- **Do not fully open** broad self-serve onboarding yet until setup friction and content breadth are improved.

## Confidence and Unknowns

- **Confidence: medium-high** for behavior and flow accuracy based on code paths and QA evidence.
- **Unknowns:** live production env health, real-user emotional response variance, and long-run learning retention impact.

