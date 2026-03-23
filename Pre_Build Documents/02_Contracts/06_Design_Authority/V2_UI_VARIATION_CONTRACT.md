# V2 UI Variation Contract (Skin + Frame)

This contract prevents UI “skins” from breaking mission correctness, evaluation determinism, or voice boundary rules.

It formalizes the design principle: variation is allowed in visuals and presentation, but not in functional semantics.

Non-negotiable companions:
- `V2_DESIGN_PRINCIPLES_AND_CREDIBILITY_CONSTRAINTS.md`
- `SESSION_AND_NODE_STATE_MACHINE.md`
- `API_CONTRACTS_PLATFORMCLIENT.md`
- `VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md`

## Definitions

### Skin
Visual theme changes that do not alter layout function:
- colors, backgrounds, texture/grain style
- typography choices (as long as control/status remains legible)
- motion style, animation speed (within accessibility constraints)

### Frame
Layout container changes that preserve module structure:
- panel boundaries, overlays, chapter separators
- narrative container arrangement (still includes required regions)
- transitional effects between HUD states

### Motifs
Scenario-specific visual cues:
- icons, insignias, “chapter” markers
- ambience visual overlays

## Hard constraints (what skins/frames MUST NOT change)

### 1) Backend call timing and state advancement
- The UI may not call evaluation endpoints outside the required moments.
- It may not decide that scoring has completed.
- It must not advance the mission node graph; node progression only comes from `MissionState.currentNode`.

Concrete must-nots:
- No “auto-submit” behavior changes.
- No changes that cause evaluation to trigger on partial voice transcript state.
- No delayed UI updates that suggest the mission moved when it did not.

### 2) Idempotency/correlation assumptions
- Replays and retries rely on `clientSubmissionId`.
- UI must not introduce new submission “paths” that create a second distinct `clientSubmissionId` for the same user intent.

### 3) Voice boundary correctness
- Confirmed turns only:
  - voice evaluation only once the confirmed boundary is reached
- UI must treat partial transcript as non-scoring state.

Hard rule:
- Any visual that looks like “submitted/evaluated” is forbidden for partial voice turns.

## Soft constraints (allowed, but must be validated)

### Instructional clarity
Skins can make the experience more cinematic, but must keep instructional microcopy readable and consistent with node requirements.

### Social flavor
NPC style can change, but must remain aligned to the node narrative and must not conflict with control/status text.

## Variation types (allowed)

### Variation type A: Narrative framing
- change how `currentNode` narrative is presented
- allowed examples:
  - chapter header style
  - “mission briefing” container
  - emphasis rules for decision-critical phrases

### Variation type B: Social queue animation
- allowed examples:
  - how messages appear in queue
  - how mentor messages visually differentiate from crowd pressure

### Variation type C: Ambience overlay
- allowed examples:
  - subtle background ambience
  - visual representations of time pressure (non-blocking)

## Versioning

Every approved UI variation should reference:
- `variationId`: stable identifier
- `compatibleWithContracts`: list of contract filenames

At minimum:
- `API_CONTRACTS_PLATFORMCLIENT.md`
- `SESSION_AND_NODE_STATE_MACHINE.md`
- `VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md`

## Acceptance tests (designers must verify)

For any skin/frame PR/merge candidate, the designer team must check:
1. Node change correctness:
   - when `currentNode` changes, narrative updates
2. Evaluation progress correctness:
   - during evaluation, input is disabled and status text shows evaluating
3. Voice boundary:
   - partial transcript never triggers evaluation
4. Failure recovery:
   - when evaluation fails, mission does not advance and input remains retryable

## Approval workflow summary
Any UI variant must satisfy the `Credibility gate` from:
`V2_DESIGN_PRINCIPLES_AND_CREDIBILITY_CONSTRAINTS.md`.

