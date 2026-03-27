---
name: first-session-persona-delight
overview: Design a focused, cross-functional plan to make first-time user sessions compelling enough that all three target personas are likely to say “Can’t wait to use again.” The plan prioritizes removing early friction, increasing perceived realism and learning value, and adding delight signals in the first 10 minutes.
todos:
  - id: baseline-persona-goals
    content: Define per-persona target sentiment and numeric rubric thresholds for first-session success
    status: completed
  - id: fix-entry-friction
    content: Ship first-run orientation, resilient auth fallback messaging, and unified environment status indicator
    status: completed
  - id: boost-first-mission-impact
    content: Tighten mission pacing and upgrade post-mission recap with actionable next-step CTA
    status: completed
  - id: increase-replay-value
    content: Add a clearly differentiated second featured scenario and visible progression framing
    status: completed
  - id: instrument-trust-and-delight
    content: Track time-to-value, fail points, mentor usefulness, and second-run starts to validate impact
    status: completed
  - id: phase-gated-revalidation
    content: Re-run persona matrix scoring and e2e evidence at each phase gate before wider rollout
    status: completed
isProject: false
---

# First-Session Persona Delight Plan

## Goal

Shift first-use sentiment from "Maybe/Only for pilot" to "Can’t wait to use again" across the three personas documented in [c:\Users\remyg\Projects\TI Traning\TI_Training_and_Cert_V2\docs\real-life-3-persona-evaluation-2026-03-27.md](c:\Users\remyg\Projects\TI Traning\TI_Training_and_Cert_V2\docs\real-life-3-persona-evaluation-2026-03-27.md), while preserving current mission-flow clarity already validated in [c:\Users\remyg\Projects\TI Traning\TI_Training_and_Cert_V2\docs\qa-persona-matrix-2026-03-27.md](c:\Users\remyg\Projects\TI Traning\TI_Training_and_Cert_V2\docs\qa-persona-matrix-2026-03-27.md).

## Outcome Targets (First 10 Minutes)

- **Friction:** reduce onboarding/auth blocker rate to near-zero for first-time users.
- **Momentum:** ensure users complete one mission arc with visible progress and reward.
- **Replay pull:** expose at least one clearly different next mission path before session end.
- **Confidence:** show why feedback is trustworthy and what to improve next.
- **Delight:** add polished micro-moments that make the app feel intentional, not purely utilitarian.

## Workstream 1: Zero-Blocker Entry Experience (Highest Priority)

- Add a pre-mission orientation step on first run: what this is, time required, and what success looks like.
- Implement resilient auth fallback UX with explicit next actions (retry, status check, alternate path) instead of dead-end blocking.
- Unify environment state communication into one clear status indicator (live/test/setup) to reduce trust confusion.
- Add “time-to-first-interaction” instrumentation from app open to first meaningful mission action.

## Workstream 2: Strong First Mission Arc

- Keep the current clear mission progression (choice → response → feedback → dossier), but tighten pacing with explicit step framing.
- Ensure every key interaction gives immediate, understandable feedback (especially on mentor/help usage and open-input scoring).
- Upgrade end-of-mission dossier into a motivational recap: what you did well, what to improve, and what unlocks next.
- Add a short post-mission “next best step” CTA to move users directly into their second experience.

## Workstream 3: Replay Value and Scenario Breadth

- Add at least one additional featured scenario variant with visibly different stakes/personas.
- Differentiate scenario cards by expected skills, difficulty, and estimated time so users can self-select confidently.
- Introduce light progression framing (e.g., competency track progress) to make a second run feel immediately valuable.
- Ensure first-session users can see future breadth even if they only complete one mission.

## Workstream 4: Trust, Realism, and Learning Rigor

- Improve branch depth where possible so expert users perceive meaningful strategic divergence.
- Surface concise rationale for evaluation outputs so scoring feels explainable, not opaque.
- Instrument mentor effectiveness signals (helpful/not helpful, follow-through) to build quality evidence.
- Define a small external reviewer loop for realism and coaching quality validation before broad rollout.

## Workstream 5: Premium UX Confidence

- Add explicit first-session quality gates for accessibility, responsive breakpoints, and critical interaction states.
- Polish high-visibility micro-interactions (loading, transitions, confirmation states) in onboarding and mission start/end moments.
- Reduce dense “system UI” feel in first-run screens with clearer hierarchy and progressive disclosure.
- Keep design consistency while adding one memorable “wow” moment in the first mission completion path.

## Measurement and Gates

- **Primary KPI:** First-session “Can’t wait to use again” response rate by persona.
- **Supporting KPIs:** first mission completion rate, time-to-value, auth/setup fail rate, second-mission start rate, mentor usefulness rating.
- Run pre/post comparison using the same 3-persona evaluation rubric (Onboarding Friction, Task Clarity, Perceived Realism, Learning Confidence, UX Delight).
- Promote from pilot to broader self-serve only when all personas cross agreed sentiment and score thresholds.

## Delivery Sequence

- **Phase 1 (Fast wins, 1-2 days):** orientation layer, auth fallback, unified status messaging, second featured scenario card.
- **Phase 2 (1 sprint):** mission recap upgrade, replay hooks, progression framing, UX polish pass.
- **Phase 3 (1-2 sprints):** deeper adaptation, mentor quality instrumentation, stronger realism validation, expanded quality gates.

## Risks to Manage

- Over-polishing visuals without fixing setup friction will not move sentiment enough.
- Adding scenario quantity without quality divergence may not improve expert persona return intent.
- Faster iteration can regress stable persona flows unless current e2e mocked/staging checks remain mandatory.

## Execution Checkpoints

- End of each phase: rerun persona rubric scoring and capture evidence in updated evaluation docs.
- If any persona remains below target sentiment, prioritize that persona’s blockers in the next cycle rather than broad feature spread.
- Keep one owner accountable for first-session experience coherence across UX, content, and technical reliability.

