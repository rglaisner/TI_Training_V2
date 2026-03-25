# V2 Module-to-Contract Checklist (Learner HUD)

This checklist maps the intended V2 UI “content system” modules to what is currently available in `packages/shared/src/contracts.ts`.

It also highlights which parts are fully contract-driven vs which parts require explicit feature gating (or contract extensions) to stay credible and correct.

## Scope

Learner journey (web desktop-first) modules described in `V2_UX_CONTENT_SYSTEM.md`:
- `NarrativeModule`
- `InputModule` (branching + open input)
- `SocialModule`
- `ToolsModule`
- `TerminalModule`
- `TimerModule`
- Voice / transcript UX (partial vs confirmed)

## Module Mapping (What’s already supported)

### 1. NarrativeModule
Supported contract fields:
- `MissionState.currentNode.sceneText`

Notes:
- `sceneText` is always present by `NodeContextSchema`.
- UI can render it without needing any additional state.

### 2. InputModule
Supported contract fields:
- Node type discriminator: `MissionState.currentNode.type` (`'branching' | 'open_input'`)

Branching:
- `MissionState.currentNode.branchingOptions[]`
- Each `BranchingOption` provides:
  - `choiceKey`
  - `label`
  - `nextNodeId`
- UI should avoid “binary false choices” because the contract expects >= 3 branching options (except terminal-1).

Open input:
- `MissionState.currentNode.openInputConfig`:
  - `targetCompetencies[]`
  - `evaluationPrompt`
- Node progression is contract-driven via:
  - `MissionState.currentNode.nextNodeId`

### 3. SocialModule
Supported contract fields:
- `DecisionResponse.feedback?.npcMessage` (optional string)
- `MentorResponse.mentorHint?.message` (optional string)

Notes:
- The UI can implement a queue/sequence feel by appending messages received from:
  - `submitDecision(...)` responses
  - `invokeMentor(...)` responses
- The contract does not provide “who spoke” metadata; the UI should keep messages generic or label them purely as UI styling (not scoring authority).

### 4. TerminalModule (dossier / completion experience)
Supported contract fields:
- `MissionState.isTerminal` (boolean)
- `MissionState.profileMetrics` (derived from the full run)
  - `labelsOfExcellence: string[]`
  - `competencies: Record<TICompetency, { score; evaluations; lastDemonstrated; trend }>`
  - `categoryXP` and `totalXP`

Notes:
- The contract signals “terminal” cleanly, so the UI can reliably render the terminal dossier.
- The contract does *not* include an “evidence highlights” object in `MissionState` today.

### 5. Voice / Transcript UX
Supported contract fields:
- `DecisionRequest.voice?.transcriptText?: string`
- `DecisionRequest.voice?.turnBoundary?: { startedAtMs; endedAtMs }` (optional)

Limitations:
- There is no contract field like `NodeContext.voiceModeEnabled` or a “voice node type”.
- Therefore, voice UX must be treated as an optional input mode inside existing `open_input` nodes.

Contract-safe UI rule:
- Partial transcript must remain “non-scoring state” in the UI.
- Only “confirmed transcript” should be allowed to reach `submitDecision(...)`.

### 6. TimerModule
No timer fields exist today in:
- `NodeContext`
- `MissionState`

Therefore:
- Any timer UX in the frontend must be a local UX placeholder and explicitly feature-gated as “demo timer” unless/ until the contract is extended.

### 7. ToolsModule
No tools fields exist today in:
- `NodeContext`
- `MissionState`

Therefore:
- Tools UI must be either:
  - omitted, or
  - rendered as a “coming soon” placeholder without implying backend functionality.

## Extension Shortlist (What backend/contract needs next)

### A. Timer (contract-driven timer)
If you want node-specific timers to be truly backend-accurate, extend:
- `NodeContext` with something like:
  - `nodeTimerSeconds?: number`
  - (or a richer timer config)

### B. Tools (contract-driven tools)
If nodes can expose tools, extend `NodeContext` with something like:
- `tools?: Array<{ id; label; actionType; ... }>`

### C. Terminal evidence replay / highlights
If the terminal dossier must include evidence highlights / replay links (beyond `profileMetrics`), extend `MissionState` or terminal response data with something like:
- `evidenceHighlights?: Array<{ ... }>`

Without this, the terminal dossier should be derived strictly from `profileMetrics` to remain spec-accurate.

### D. Scenario listing contract (for landing/dashboard)
The “landing dashboard” requires scenario enablement fetching and “scenario being pushed” ordering.

Today, the shared contract only covers mission start/decision/mentor and tracker summary.
So add a scenario listing contract schema + types (or keep it frontend-local if you prefer, but then you still need Zod parsing at the boundary).

