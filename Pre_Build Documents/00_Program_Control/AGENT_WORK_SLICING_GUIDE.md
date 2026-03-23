# Agent Work Slicing Guide

This doc standardizes how to break the V2 planning + implementation into “slices” so that parallel agent leads can execute safely.

It also provides a consistent “definition of done” so QA/test leads can validate each slice deterministically.

## Work unit format (template)

Each work unit should be described as:

### 1) Slice title
- Short, behavior-oriented name (e.g., “Idempotent open-input evaluation turn”)

### 2) Owner
- Which agent lead role is responsible

### 3) Problem statement (why this slice exists)
- 2–5 sentences describing the user-facing outcome or contract gap it closes

### 4) Dependencies (what must already be true)
- list doc links required before implementation

### 5) Required contracts (what must match)
- link to the exact contract docs
- list which schema/types must match exactly (no guessing)

### 6) Implementation notes (non-authoritative)
- expected algorithmic approach
- where to put code boundaries
- what must stay deterministic vs what may be LLM-driven

### 7) Acceptance checks (definition of done)
Provide 3 layers:
- Contract-level checks (schema validation, status codes, invariants)
- Integration checks (backend-to-UI mapping)
- Auditability checks (event lake records exist and are correct)

### 8) Test evidence required
- list unit/integration/e2e tests expected for this slice
- for E2E: identify which `page.route` mocks are required and which endpoints are safe to stub

### 9) Edge cases to explicitly consider
- invalid input, replay/idempotency, terminal sessions, missing auth, timeouts

## Slice examples (how “good slices” look)

### Example A: API + idempotency slice
Goal:
- “Submitting the same decision twice returns identical missionState and does not double-apply profile metrics.”
Dependencies:
- `API_CONTRACTS_PLATFORMCLIENT.md`
- `SESSION_AND_NODE_STATE_MACHINE.md`
Acceptance checks:
- repeated requests with same `clientSubmissionId` produce identical outcome
- `/events` has exactly one `EVALUATION_COMPLETED` (or correct failure event)

### Example B: Voice bridge slice
Goal:
- “Voice transcript turns are evaluated through the same mission state machine rules.”
Dependencies:
- `VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md`
- `SESSION_AND_NODE_STATE_MACHINE.md`
Acceptance checks:
- partial transcripts do not advance node graph
- final transcript triggers exactly one evaluation turn

## Preventing drift between docs and code
- Every contract doc should include:
  - endpoint names (or at minimum stable logical names)
  - request/response payload shapes
  - invariants and error codes
- QA should treat the docs as “source-of-truth” for deterministic E2E mocking.

