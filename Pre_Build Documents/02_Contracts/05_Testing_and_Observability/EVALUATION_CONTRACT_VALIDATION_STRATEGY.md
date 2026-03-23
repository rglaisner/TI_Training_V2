# Evaluation Contract Validation Strategy (Strict JSON)

This document describes how the backend must validate Gemini’s strict JSON output for open-input evaluation and what it should do on failures.

It is aligned with:
- `LLM_ORCHESTRATOR_PROMPT_ARCHITECTURE.md` (JSON contract fields: `Score`, `Demonstrated`, `Feedback`)
- `API_CONTRACTS_PLATFORMCLIENT.md` (error codes + audit event requirements)
- `EVENTS_AUDIT_AND_IMMUTABILITY_PROTOCOL.md` (immutable failure events)

## Contract definition

Gemini must return a JSON payload:
- `Score`: number in the expected scale
- `Demonstrated`: boolean
- `Feedback`: string

## Score scale normalization (critical)
Your current narrative docs mention a `0.0..1.0` float in the prompt architecture, while profile/event docs mention `0..100`.

Contract strategy:
- Define *one canonical internal scale* for the backend (recommended: `0..100`).
- If Gemini returns `0..1`, normalize:
  - `score100 = score * 100`
- If Gemini returns `0..100`, accept as-is.

Validation must record:
- which raw scale was received (for audit)

## Strict validation (no permissive parsing)

Use a schema validator (recommended: `Zod` or equivalent) with:
- exact object shape
- required keys only
- no unknown keys (optional policy, but recommended for strictness)
- type enforcement:
  - `Score` must be a finite number
  - `Demonstrated` must be boolean
  - `Feedback` must be a non-empty string (trimmed)

## Handling invalid JSON

When parsing/validation fails:
1. Write a tenant-scoped immutable event:
   - `EVALUATION_JSON_INVALID`
2. Include safe diagnostic evidence:
   - validation error summary
   - optionally a truncated/redacted snippet of the model output (only if allowed)
3. Do not update `/profiles`.
4. Return an API error to the frontend:
   - `422` and `code: "EVAL_JSON_INVALID"` (or your established equivalent)

## Retry policy (bounded)

Optional retry if and only if it is safe and bounded:
- Retry at most once.
- Retry strategy:
  - send a “repair” prompt to re-output valid JSON
  - require the same schema
- If retry fails:
  - proceed with `EVALUATION_JSON_INVALID` and abort decision

Avoid infinite loops:
- no unbounded retry counters

## Handling “valid JSON but invalid semantics”

Validation success does not automatically mean correctness.
Define semantic invariants:
- `Score` range after normalization is within `0..100`
- `Demonstrated` implies a meaningful score behavior (implementation choice)
- `Feedback` must not be empty or only whitespace

If semantic invariants fail:
- treat as contract failure and emit `EVALUATION_JSON_INVALID` (or a dedicated `EVALUATION_SEMANTICS_INVALID` event type if you prefer).

## Audit fields to record for traceability
Every evaluation event should record:
- `promptVersion` / `scoringVersion`
- `modelId` (if available)
- normalized score + raw score
- whether a retry occurred
- correlation id / request id (sanitized)

## Determinism for tests
To keep E2E deterministic:
- tests must not rely on live Gemini responses
- tests mock `/api/missions/decision` outcomes and separately unit-test contract validation using fixed fixtures.

## Security posture
- Never log raw user PII in server logs or in events.
- Sanitize feedback and user-provided text before persistence as needed.

