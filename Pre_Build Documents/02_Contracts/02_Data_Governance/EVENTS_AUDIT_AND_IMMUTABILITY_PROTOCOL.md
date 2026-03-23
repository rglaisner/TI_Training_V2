# Events Audit & Immutability Protocol

This doc defines how the backend must create and protect the tenant-scoped, anonymized `/events` “event lake” so that:
- every evaluation is auditable after the fact
- profile metrics remain defensible (“why did the system award/deny?”)
- events are immutable after append
- schema/contract failures are captured without corrupting the lake

Aligns with:
- `README.md` (immutable event log for later auditing/analytics)
- `SCHEMA_DESIGN_PROFILE_METRICS.md` (evaluation event schema intent)
- `LLM_ORCHESTRATOR_PROMPT_ARCHITECTURE.md` (strict JSON contract requirement)

## Event identity
Each event record MUST have:
- `eventId`: globally unique (UUID or ULID) and generated server-side
- `tenantId`: resolved from auth
- `timestamp`: ISO 8601 timestamp of creation

Avoid storing direct user identity:
- Store `profileHash` (or equivalent anonymized identifier) instead of user PII.

## Required event types
Use explicit event typing so admin dashboards can filter reliably:
- `EVALUATION_COMPLETED`: a successful scoring run and application of updates
- `EVALUATION_JSON_INVALID`: the LLM returned invalid JSON (schema mismatch)
- `EVALUATION_LLM_ERROR`: model call failure/timeout
- `DECISION_REJECTED`: request rejected due to state machine rules (node mismatch, terminal, etc.)
- Optional:
  - `MENTOR_INVOKED`
  - `VOICE_TURN_EVALUATED` (if voice uses transcript-to-decision turns)

## Immutability enforcement

### Server-side immutability (primary)
- Events are written exactly once using server admin credentials.
- Updates to event documents should be forbidden in code (no update/patch patterns in event writers).

### Firestore immutability (defense-in-depth)
Implement with security rules and data model choices:
- Enable rules so `/events/{eventId}` documents cannot be updated after creation.
- Reject any request that attempts to modify existing event docs.

Common approach:
- Allow `create` only.
- Deny `update` and `delete` for event documents.

## PII stripping and safety
Before writing to `/events`:
- Do not store:
  - raw user identity
  - raw PII extracted from input
  - secrets
- Store only:
  - scenario/node identifiers
  - evaluation results (scores, demonstrated flag, feedback)
  - required metadata (timing, tool usage flags)
  - anonymized identifiers (`profileHash`)

For free-text inputs:
- Prefer storing only derived/neutralized representations if possible.
- If you must store input for audit, sanitize and truncate consistently, and keep it access-restricted to admins.

## Handling failures without breaking the event lake

### JSON contract mismatch (LLM output invalid)
When the AI JSON contract fails validation:
1. Write an event of type `EVALUATION_JSON_INVALID`.
2. Include safe evidence for debugging:
   - validation error summary (no raw sensitive text)
   - truncated model output (only if safe policy allows)
3. Do NOT apply updates to `/profiles`.
4. Return a safe error to the UI (or retry policy if you have deterministic retry rules).

### LLM call failure
When Gemini call fails/timeouts:
1. Write `EVALUATION_LLM_ERROR`.
2. Do not update profiles.
3. Return `502`/`503`-style API error to frontend (mapped to your API error model).

## Reprocessing rules (future-proofing)
Later you may want to “re-run evaluation” when prompts or scoring logic changes.
To keep the event lake defensible:
- do not overwrite past events
- write a new event with:
  - `reprocessingOfEventId` (optional)
  - `promptVersion` / `scoringVersion`

## Operational retention & archival
Define retention policies early:
- keep raw events for a configured window
- archive older events to cheaper storage if needed
- ensure admin replay can reconstruct the profile state at time `T` (if required)

