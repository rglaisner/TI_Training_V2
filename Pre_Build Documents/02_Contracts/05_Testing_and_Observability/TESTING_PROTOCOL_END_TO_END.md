# Testing Protocol (E2E + Integration + Contract Checks)

This document defines the QA/testing approach for V2 so we can:
- validate mission flows end-to-end
- guarantee determinism using mocks
- enforce the strict evaluation JSON contract
- prevent regressions when multiple agent leads work in parallel

It is aligned with:
- `API_CONTRACTS_PLATFORMCLIENT.md`
- `SESSION_AND_NODE_STATE_MACHINE.md`
- `EVALUATION_CONTRACT_VALIDATION_STRATEGY.md`
- `VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md` (voice turns become open-input turns)

## Test layers

### 1) Unit tests (fast, deterministic)
Focus:
- JSON schema validation logic
- profile metrics update math (deterministic application rules)
- state machine invariants helpers

Examples:
- “valid contract parses successfully”
- “score outside expected range rejects”
- “idempotent decision replay does not double-apply metrics”

### 2) API integration tests (server-side, mocked dependencies)
Focus:
- `/api/missions/start`
- `/api/missions/decision`
- `/api/missions/mentor`

Mock:
- Firestore persistence layer using in-memory stubs (or test emulator)
- Gemini calls:
  - return deterministic “successful evaluation” payloads
  - return deterministic “invalid JSON” payloads

Assertions:
- correct HTTP status codes and error codes
- correct `/events` append behavior (including failure events)
- correct `MissionState` returned

### 3) End-to-end UI tests (Playwright)
Focus (critical user journeys):
1. Landing → scenario selection → mission start
2. Open-input evaluation success path
3. Open-input evaluation failure path (invalid contract)
4. Mentor invocation doesn’t advance node graph
5. Terminal dossier rendering when `isTerminal=true`
6. Voice mode (optional early):
   - mock transcript finalization and verify same evaluation flow is triggered

## Playwright determinism strategy

### Mocking approach (recommended)
Because backend calls are where the LLM + persistence happen, the most deterministic E2E strategy is:
- mock backend API responses with `page.route` for:
  - `POST /api/missions/start`
  - `POST /api/missions/decision`
  - `POST /api/missions/mentor`

Why:
- reduces flakiness
- avoids real LLM/network variability in UI tests

### Selector policy
Frontend must expose stable selectors:
- `data-testid` attributes for:
  - username/email fields (auth gate)
  - scenario cards
  - submit button
  - textarea/editor for open input
  - NPC feedback area
  - error banner
  - terminal dossier summary sections
  - mentor hint region
  - voice transcript UI elements (partial vs final indicators)

Avoid:
- CSS selector brittleness
- XPath

## E2E acceptance criteria (example mapping)

### Flow A: Open-input success
Given:
- backend `/api/missions/decision` is mocked to return:
  - `missionState.currentNode.nodeId` advanced to expected next node
  - `profileMetrics` updated
  - `feedback.evaluation` exists and matches expected payload
Then assert:
- UI updates narrative and input module for new node
- feedback region shows NPC message
- no error banner is visible
- terminal dossier is NOT shown unless `isTerminal=true`

### Flow B: JSON contract invalid
Given:
- backend responds with a failure:
  - HTTP `422` (or defined error code)
  - includes `code: "EVAL_JSON_INVALID"` in `ApiError`
And (optional but recommended):
- `/events` append is mocked/verified in a lower-level API test
Then assert:
- UI shows a user-safe retry message
- mission state does not advance
- input remains editable for retry

### Flow C: Idempotent replay
Given:
- the UI retries submitting with the same `clientSubmissionId`
- backend mock returns identical missionState as first call
Then assert:
- UI does not double-render success state
- UI remains consistent across retries

## Voice E2E (minimal viable early coverage)
In UI tests:
- stub the voice UI so it emits a “turnFinalized” with a transcript
- verify that:
  - the bridge calls the existing `/api/missions/decision` endpoint
  - success and failure flows are identical to typed open input

## CI gating criteria
For merges:
- unit tests must pass
- API tests must pass
- Playwright must pass for at least the critical flows above

