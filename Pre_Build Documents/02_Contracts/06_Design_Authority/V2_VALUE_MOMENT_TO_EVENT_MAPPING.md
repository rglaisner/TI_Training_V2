# Value Moment to Immutable Event Mapping

This document defines the “explainability contract” between:
- UI value moments (from `V2_VALUE_MOMENTS_SPEC.md`)
- the immutable tenant event lake (from `EVENTS_AUDIT_AND_IMMUTABILITY_PROTOCOL.md`)

Design goal:
- Admin/tracker must be able to answer: “Why did this moment show up?”

## Event lake types (starter set)

Use the event types from `EVENTS_AUDIT_AND_IMMUTABILITY_PROTOCOL.md`:
- `EVALUATION_COMPLETED`
- `EVALUATION_JSON_INVALID`
- `EVALUATION_LLM_ERROR`
- `DECISION_REJECTED`

Optional/extension points:
- `MENTOR_INVOKED`
- `VOICE_TURN_EVALUATED`

## Mapping rules (required)

### 1) Never invent evidence
If a value moment is shown, the backend must produce (at least) one corresponding event record that supports it.

### 2) Prefer success/failure events over UI heuristics
Even if a moment “feels” like tension/achievement, the backend evidence must come from evaluation outcomes and/or state transitions.

### 3) MomentId traceability
Each value moment should carry:
- `momentId`
- `sourceEventId` (or `sourceEventType + identifiers` if you do not store event IDs directly)

This lets admin drill-down without guessing.

## Concrete starter mappings (momentId -> event evidence)

### Achievement
- `moment_achievement_distinction`
  - evidence: `EVALUATION_COMPLETED` with awarded score meeting the “distinction” threshold
  - optional supporting: `isTerminal=true` (terminal/dossier transition)

- `moment_achievement_merit`
  - evidence: `EVALUATION_COMPLETED` with awarded score meeting the “merit” threshold
  - optional supporting: `isTerminal=true`

### Mentor Pop
- `moment_mentor_hint`
  - evidence (recommended): `MENTOR_INVOKED`
  - fallback: `EVALUATION_COMPLETED` only if the mentor moment is coupled to an evaluation turn (usually it is not)

### Evidence Snap
- `moment_evidence_snap_upward_competency`
  - evidence: `EVALUATION_COMPLETED` where profile delta indicates a meaningful upward change

### OPSEC Near-Miss
- `moment_opsec_near_miss`
  - evidence: `EVALUATION_COMPLETED` with demonstrated=false or a backend-defined near-miss interpretation
  - recommended additional evidence: `DECISION_REJECTED` if the state machine rejects the decision

### Cognitive Reset
- `moment_cognitive_reset_eval_failed`
  - evidence:
    - `EVALUATION_JSON_INVALID` (strict contract failure), OR
    - `EVALUATION_LLM_ERROR` (provider failure/timeout), OR
    - `DECISION_REJECTED` (state machine rejection)

## Field requirements for audit drill-down

When the backend returns mission state and value moments:
- it must include enough identifiers for the UI and admin to locate evidence

Minimum recommended fields (implementation choice):
- `momentId`
- `sourceEventType`
- `sourceEventId` (preferred) or `(scenarioId, nodeId, timestamp)` composite identifiers
- `scenarioId` and `nodeId` (so admins can filter)
- `tenantId` (implicit via auth)

## Implementation constraint (credibility + reliability)
Because events are immutable, do not “patch” evidence after the fact.
If a moment is shown incorrectly due to a transient logic bug, emit a new corrective event and render the corrected moment list from backend truth.

