# API Contracts: `PlatformClient` (Frontend <-> Backend)

This document defines the *explicit* backend API contract that the React frontend must use. It operationalizes the `PlatformClient` boundary described in `FULL_FINAL_BLUEPRINT.md`.

Guiding rules:
- The frontend never reads/writes Firestore directly.
- The backend is the single source of truth for mission state and persistence.
- All state transitions are validated on the backend (no client-side authority).
- Open-input evaluation is backed by the strict AI JSON contract.

## Terminology
- `tenantId`: enterprise tenant identifier used for data partitioning and authorization.
- `sessionId`: unique mission session identifier created at `startMission`.
- `NodeContext`: the “what the UI should render next” payload returned by the backend.
- `nodeId`: the current scenario node identifier inside the scenario “graph”.
- `turnId`: a monotonically increasing identifier per session/node turn used for idempotency.

## Authentication and tenant resolution
- Auth mechanism: Firebase JWT via `Authorization: Bearer <idToken>`.
- The backend resolves `tenantId` from a server-side mapping of:
  - Firebase user identity (uid/email/claims) → `tenantId`
  - or from a custom claim that includes `tenantId`.
- All API calls are evaluated inside the resolved `tenantId` boundary.

## Shared response shape
Most endpoints return a “next mission state” shape so the frontend can update `MissionStore` in one step.

### `MissionState` (canonical)
```ts
interface MissionState {
  sessionId: string;
  currentNode: NodeContext;
  profileMetrics: ProfileMetrics; // derived/updated by backend
  isTerminal: boolean;
}
```

Notes:
- `profileMetrics` should reflect post-evaluation changes (serious track metrics, fun track XP deltas, and any label unlocks).
- `currentNode` must always match the backend’s validated state for the session.

## Endpoint list

### 1) Start a mission
`POST /api/missions/start`

Request:
```ts
interface StartMissionRequest {
  scenarioId: string;
  clientRequestId?: string; // for client-side correlation and retry debugging
}
```

Response:
```ts
interface StartMissionResponse {
  missionState: MissionState;
  // Optional: initial NPC/UX metadata to render immediately
  meta?: {
    startedAt: string; // ISO timestamp
  };
}
```

Server responsibilities:
- Validate scenario existence and that it is enabled for the tenant.
- Create a new `sessionId`.
- Initialize turn counters for the session.
- Load the user’s current `profileMetrics` from `/profiles` (tenant partition).
- Compute the initial `currentNode` context (including DDA tier routing if applicable).

### 2) Submit a decision (branching + open input)
`POST /api/missions/decision`

Request:
```ts
interface DecisionRequest {
  sessionId: string;
  nodeId: string; // must match the session’s current node
  // Idempotency: if the client retries, it should reuse the same id.
  clientSubmissionId: string;

  // Provide exactly one of:
  branchingChoice?: {
    choiceKey: string; // deterministic lookup key
  };
  openInput?: {
    inputText: string; // or sanitized text the UI collected
  };

  // Optional, but recommended for voice-enabled mode:
  voice?: {
    transcriptText?: string;
    turnBoundary?: {
      startedAtMs: number;
      endedAtMs: number;
    };
  };
}
```

Response:
```ts
interface DecisionResponse {
  missionState: MissionState;
  feedback?: {
    npcMessage?: string; // in-character feedback
    // For auditability and UI rendering
    evaluation?: {
      targetCompetency: string; // TICompetency
      awardedScore: number; // 0-100 scale (per node target)
      demonstrated: boolean;
      // Prefer backend-provided feedback (LLM output)
      feedbackText: string;
    };
  };
  // Correlation-friendly info:
  meta?: {
    turnId: number;
    evaluatedAt: string; // ISO timestamp
  };
}
```

Server responsibilities (critical):
1. Idempotency:
   - If `clientSubmissionId` has already been processed for `(sessionId, nodeId)`:
     - return the previously computed `DecisionResponse` (or enough info to reconstruct `MissionState` deterministically).
2. Consistency:
   - Reject the request if `nodeId` does not match the session’s current node.
3. Branching nodes:
   - Apply deterministic effects (`choiceKey` → effects like XP and node transitions).
4. Open-input nodes:
   - Run LLM orchestration using the strict JSON contract.
   - Validate the JSON payload (schema match) before applying updates.
   - Append an immutable evaluation record to the tenant’s `/events` collection.
5. Update `profileMetrics` using the deterministic application rules derived from the AI evaluation output.
6. Return the validated `next currentNode` (or terminal state).

### 3) Invoke Mentor (social engine hinting)
`POST /api/missions/mentor`

Use case:
- The UI triggers Mentor assistance without advancing the mission node graph.

Request:
```ts
interface MentorRequest {
  sessionId: string;
  nodeId: string; // must match current node
  clientSubmissionId: string;
  challengeText?: string; // what the user is struggling with
}
```

Response:
```ts
interface MentorResponse {
  missionState: MissionState; // typically unchanged node, but may update transient profile/help flags
  mentorHint?: {
    message: string; // in-character guidance
  };
  meta?: {
    turnId: number;
    evaluatedAt: string;
  };
}
```

Server responsibilities:
- Maintain soft-guardrail behavior described in `FULL_FINAL_BLUEPRINT.md`.
- Mentor responses should be logged to the event lake if you want full auditing (optional, but recommended for “admin replay” later).

## Idempotency and concurrency rules
- A single `(sessionId, nodeId, clientSubmissionId)` must be processed at most once.
- The backend should serialize evaluation for a given session to avoid race conditions:
  - If a decision is “in flight” for the current node, return `409 Conflict` or a structured “pending” response (implementation choice, but it must be consistent).
- Retry behavior:
  - Network failures are handled by the frontend reusing `clientSubmissionId`.
  - Backend must return the same `missionState` for a given idempotent submission.

## Error model (structured)
All non-2xx responses should return JSON:
```ts
interface ApiError {
  code: string;          // e.g. "INVALID_NODE", "IDEMPOTENT_REPLAY", "EVAL_JSON_INVALID"
  message: string;       // short human-safe error
  requestId: string;     // correlation id
  details?: unknown;     // server-only; safe to log but avoid PII
}
```

Recommended HTTP codes:
- `401` / `403`: auth/tenant mismatch
- `400`: malformed request
- `409`: concurrent node submission detected
- `422`: schema validation failures or invalid payload semantics
- `500`: unexpected server errors

## Mapping to the strict AI JSON contract
- Open-input nodes must use the JSON contract described in `LLM_ORCHESTRATOR_PROMPT_ARCHITECTURE.md`:
  - `Score` (numeric), `Demonstrated` (boolean), `Feedback` (string).
- Backend MUST validate the LLM output before applying it to `/profiles` and before appending to `/events`.

Score scale note (critical):
- Gemini may produce `Score` on a `0.0..1.0` scale; the backend MUST normalize into the canonical internal scale returned here (`awardedScore` in `0..100`).

