# Voice-to-Evaluation Bridge Contract

This doc defines how a confirmed voice turn becomes an existing backend mission “decision submit” so certification scoring stays consistent and auditable.

The backend contract is defined in:
- `API_CONTRACTS_PLATFORMCLIENT.md`

## Bridge responsibilities
- Accept finalized voice input:
  - transcript text (required for mission evaluation in this version)
  - optional timing metadata (helpful for audit)
  - optional confidence signals (for UI decisions)
- Map it to a `DecisionRequest` using the existing open-input evaluation pathway.
- Enforce idempotency:
  - each confirmed voice turn produces exactly one `clientSubmissionId`
  - partial turns never call the backend

## Mapping: voice turn → `POST /api/missions/decision`

### Required inputs
```ts
interface VoiceTurnFinalization {
  sessionId: string;
  nodeId: string;
  transcriptText: string; // must be finalized/confirmed
  turnBoundary: {
    startedAtMs: number;
    endedAtMs: number;
  };
  // Stable across retries for the same turn:
  clientSubmissionId: string;
  // Optional:
  transcriptConfidence?: number; // 0..1
  languageCode?: string;
}
```

### DecisionRequest produced by the bridge
```ts
const decisionRequest: DecisionRequest = {
  sessionId,
  nodeId,
  clientSubmissionId,
  openInput: {
    inputText: transcriptText,
  },
  voice: {
    transcriptText,
    turnBoundary: {
      startedAtMs: voiceTurn.turnBoundary.startedAtMs,
      endedAtMs: voiceTurn.turnBoundary.endedAtMs,
    },
  },
};
```

## Validation rules (must be enforced before calling backend)
- `transcriptText`:
  - must be non-empty after trimming
  - must meet a minimal length threshold (implementation choice; e.g., >= N characters)
- Node correctness:
  - the provided `nodeId` must match the current session node in UI state
  - if mismatch: prompt user to reload mission state (or discard voice turn)
- Idempotency:
  - do not reuse `clientSubmissionId` across distinct turn boundaries

## Partial transcript handling
- Partial transcripts update UI captions but do not trigger evaluation.
- When the user interrupts the AI:
  - stop AI playback
  - discard the in-progress transcript buffer
  - wait for the next confirmed turn boundary

## Branching nodes: spoken choice policy
Because the mission evaluation contract already supports deterministic branching keys, keep it simple:
- For branching nodes:
  - voice can capture user intent, but evaluation should use an explicit `choiceKey`
  - the bridge should only call `submitDecision.branchingChoice` when it can map the speech to a known choice key deterministically (e.g., using a controlled vocabulary or explicit UI selection confirmation)

Implementation recommendation:
- Prefer restricting voice-powered evaluation to `open_input` nodes in early V2.

## Failure handling contract
If the backend rejects the evaluation:
- backend error codes should be surfaced in UI with an actionable message:
  - “Your session advanced; please try again”
  - “We couldn’t read the transcript clearly; please repeat”
- the bridge should keep the user-friendly turn available for retry without losing mission state.

