# V2 Design Principles + Credibility Constraints

This document is the **non-negotiable design authority** for V2. It exists so that any UI/audio/UX changes made by designer agents cannot damage:
- professional credibility (enterprise-grade “Mission Control” feel)
- instructional clarity (users always know what to do next)
- immersion (RPG flavor without confusing the user about system truth)
- correctness expectations (UI can never override backend state rules)

## Credibility first: what “never happens”

### The UI must never imply false authority
- UI must never claim a decision was evaluated unless the backend returned an updated `MissionState`.
- UI must never display “certification awarded” language based on client-only state.
- Voice UI must never finalize a transcript-driven evaluation without the confirmation boundary defined in `VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md`.

### The UI must never degrade clarity in pursuit of immersion
- No “stylish” copy that obscures actionable next steps.
- No UI states where it’s unclear whether the system is:
  - waiting for user input
  - evaluating
  - advanced/changed nodes
  - failed and needs retry

### Audio must never be confusing or misleading
- Interruptions must be visually communicated so users understand whether the spoken turn was accepted or discarded.
- No ambiguous “thinking/speaking” states during evaluation; evaluation is backend-owned and auditable.

## RPG flavor without breaking credibility

### “In-character” is allowed, but status/control must remain accurate
- NPC social messages may be whimsical, dramatic, or roleplay-oriented.
- Status/control messages must be professional and unambiguous (e.g., “Evaluation running…”, “Transcript confirmed. Scoring now.”).

### Value multiplier rule
Any design change must either:
- increase user sense of being “inside” the scenario, or
- increase comprehension of the mission’s decision moment, or
- reduce cognitive load during high-stakes evaluation

If it does neither, it is not eligible to ship (unless it fixes a UX defect).

## Credibility gate checklist (required for designers)

Before approving any visual/audio variation:
1. Does it preserve the backend contract boundaries (`API_CONTRACTS_PLATFORMCLIENT.md`, `SESSION_AND_NODE_STATE_MACHINE.md`)?
2. Does it preserve idempotency/retry correctness expectations (`clientSubmissionId`)?
3. Can a user still reliably understand what the next action is?
4. Does any audio/animation state correlate to *actual* system state changes?
5. Do we avoid “silent failure” scenarios (every failure must surface a user-safe recovery path)?

## How designer authority interacts with mission evaluation

Design agents are allowed to:
- add or adjust UI modules and micro-interactions within a HUD render cycle
- adjust ambience, formatting, timing of *visual/sound* cues
- refine microcopy and NPC message rendering
- extend the list of interlocutors and scenario ambience definitions, as long as output remains renderer-only

Design agents must not:
- change the truth source (backend-only `MissionState`)
- change the scoring/evaluation contract fields (see `LLM_ORCHESTRATOR_PROMPT_ARCHITECTURE.md` and `EVALUATION_CONTRACT_VALIDATION_STRATEGY.md`)
- change when the backend is called for evaluation (voice or typed input)

## Link to the most relevant design contracts
- Skin + Frame / variation safety: `V2_UI_VARIATION_CONTRACT.md`
- Value moments: `V2_VALUE_MOMENTS_SPEC.md`
- Ambience/mood: `V2_SCENARIO_AMBIENCE_AND_MOOD_SPEC.md`
- Voice UI: `V2_VOICE_UI_AND_SOUND_DESIGN_SPEC.md`

