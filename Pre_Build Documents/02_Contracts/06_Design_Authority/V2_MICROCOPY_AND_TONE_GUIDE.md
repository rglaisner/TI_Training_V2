# V2 Microcopy + Tone Guide

Purpose: guarantee that every piece of UI/audio text supports credibility, clarity, and immersion without accidentally undermining “backend-owned truth.”

This doc is a required companion to:
- `V2_DESIGN_PRINCIPLES_AND_CREDIBILITY_CONSTRAINTS.md`
- `V2_UI_VARIATION_CONTRACT.md`
- `V2_VOICE_UI_AND_SOUND_DESIGN_SPEC.md`

## Tone layers (use the right layer for the moment)

Define three layers of user-facing text. Designers must choose intentionally.

### 1) Control/status text (always professional)
Used for: evaluation running, waiting for transcript, retries, terminal summary, errors.
Rules:
- short sentences
- action-oriented
- never ambiguous

Examples:
- “Evaluation running…”
- “Transcript confirmed. Scoring now.”
- “Turn discarded (interruption). Speak again when ready.”
- “Scenario complete. Opening your dossier.”

### 2) Narrative/in-character text (immersive)
Used for: NPC social messages, atmosphere callouts, roleplay flavor, tension release.
Rules:
- must remain aligned with the current node narrative
- must not imply backend scoring decisions were made earlier than they are

Examples:
- “The CFO leans in, waiting for your numbers.”
- “The board’s eyes narrow as your reasoning lands.”

### 3) Instructional microcopy (reduce user confusion)
Used for: how to respond, what to choose, what counts as “done.”
Rules:
- explicitly says what the user should provide next
- avoid hidden UX instructions inside jokes

Examples:
- “Write a BLUF reply (one decision-first paragraph).”
- “Choose the option that matches your integrity stance.”
- “Speak your full turn, then confirm.”

## Microcopy for mission state transitions (canonical wording)

Design agents should reuse these wording patterns:

### Awaiting user input
- control/status: “Waiting for your decision…”
- instructional: depends on node type:
  - branching: “Pick one option. No extra text needed.”
  - open input: “Write your response in your own words.”
  - voice: “Speak your turn. Then confirm.”

### Evaluation in progress
- control/status: “Evaluation running…”
- narrative: NPC may react, but must not claim “scoring completed”

### Evaluation success (terminal vs non-terminal)
- non-terminal:
  - control/status: “Decision accepted.”
  - instructional: “Continue to the next moment.”
- terminal:
  - control/status: “Scenario complete.”
  - instructional: “Review your dossier and evidence.”

### Evaluation failure (contract mismatch / LLM error)
- non-terminal:
  - control/status: “We couldn’t evaluate that turn.”
  - instructional: “Try again. The scene didn’t move.”

## Voice UI text rules (partial vs confirmed)

Design must ensure users always know what is being evaluated.

### Partial transcript state
- render visually as “capturing…”
- do not allow “submitted/evaluated” language

### Confirmed transcript state
- control/status: “Transcript confirmed. Scoring now.”
- bridge contract requires confirmed turns to include `transcriptText`

### Interruption/discard state
- control/status: “Turn discarded (interrupted).”
- prompt: “Speak again when ready.”

## Edge-case wording rules

### Node mismatch
- control/status: “Your mission context changed. Reload the scene.”

### Idempotent replay (client retries)
- do not show duplicate success to the user
- control/status: “Re-syncing your last decision…”

### Empty input / too short
- control/status: “That turn is too brief to evaluate.”
- instructional: “Add a little more detail and try again.”

## Tone matrix (in-character variants)

This is a guideline for NPC voice and narration flavor. It must never override control/status correctness.

Axes:
- professionalism: formal → playful → intense
- empathy: cold realism → supportive coaching
- pressure: low → medium → high (maps to DDA tier)

Recommended mapping (typical):
- Level 0–2: supportive and clear
- Level 3–4: skeptical and precise
- Level 5–6: resistant, baiting, OPSEC-aware

## Validation checklist (must pass)
- Does any text imply a scoring result without the backend-updated `MissionState`?
- Is the next user action obvious?
- Are interruptions and retries clearly explained in control/status text?

