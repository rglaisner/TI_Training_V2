# V2 Value Moments Spec

This document defines “value moments” for V2: intentional and emergent UX beats that maximize learning, engagement, and immersion.

Core rules:
- Value moments must be triggered from backend-owned truth (node transitions, evaluation outcomes, derived profile metrics).
- UI can render the moment, but cannot invent it.
- Moments must never conflict with the credibility constraints in:
  - `V2_DESIGN_PRINCIPLES_AND_CREDIBILITY_CONSTRAINTS.md`

## Two categories

### A) Intentional value moments (scripted)
These moments are planned by scenario authors/node config and occur at known backend milestones.

### B) Emergent value moments (naturally occurring)
These moments happen when the user’s performance produces notable evaluation outcomes, patterns, or evidence.

## Trigger sources (must be backend-derived)

Designers may only define moments using these signals:
- `MissionState.currentNode` changed to a different nodeId
- `MissionState.isTerminal` toggled to `true`
- Evaluation outcome returned via the decision pipeline:
  - open-input evaluation succeeded (valid JSON, parsed, applied)
  - awarded score above/below defined thresholds (as backend decides)
  - demonstrated boolean (true/false)
- Derived profile deltas:
  - competency score trend changed (up/down/flat)
  - label of excellence unlocked (from backend rules)
- Optional: specific event types created in the immutable `/events` lake (admin explains it later)

## Moment schema (recommended)

Every value moment should be represented to the renderer as:
```ts
interface ValueMoment {
  momentId: string;
  kind: 'intentional' | 'emergent';
  source: 'node_transition' | 'evaluation_outcome' | 'profile_delta' | 'terminal';
  createdAt: string; // ISO timestamp (from backend or request time)
  severity?: 'low' | 'medium' | 'high'; // affects UI emphasis only
  textPayload?: {
    title: string; // short
    body: string;   // short or in-character depending on the UI module
  };
  uiHints?: {
    // For the UI to animate, not to decide logic
    accent?: 'mentor' | 'success' | 'tension' | 'insight' | 'warning';
  };
}
```

## Moment types (starter taxonomy)

### 1) Achievement (intentional or emergent)
When:
- `MissionState.isTerminal=true` AND evaluation indicates strong completion (backend threshold)
What it feels like:
- dignified, professional victory (not gimmicky)

Moment examples:
- `moment_achievement_distinction`
- `moment_achievement_merit`

### 2) Tension Release (intentional)
When:
- a node arrives after a high-pressure decision, and the backend says the user survived the constraint (via demonstrated or node meta)
UI requirements:
- reduce cognitive load
- make the next action obvious

### 3) Mentor Pop (intentional/emergent)
When:
- UI requests mentor OR node config schedules a mentor moment
Backend requirement:
- mentor output must be generated within the backend’s social engine boundary

Moment examples:
- `moment_mentor_hint`

### 4) Evidence Snap (emergent)
When:
- awarded score crosses a “meaningful evidence” threshold OR demonstrated=true
What it feels like:
- “the system noticed a defensible reasoning pattern”
Admin trace:
- should map cleanly to the evaluation evidence in `/events`

Examples:
- `moment_evidence_snap_upward_competency`

### 5) OPSEC Near-Miss (emergent)
When:
- evaluation flags a risky attempt but still marked demonstrated=false (or a backend-defined “near miss” category)
UI requirements:
- emphasize learning without claiming success
- provide a clear retry path

Examples:
- `moment_opsec_near_miss`

### 6) Cognitive Reset (intentional)
When:
- evaluation failure occurs (contract invalid or LLM error) and the mission does not advance
UI requirements:
- show “scene didn’t move” explicitly
- keep input editable and guide retry wording

Examples:
- `moment_cognitive_reset_eval_failed`

## Moment content rules (credibility)
- Any claim about certification/progression must come from terminal/dossier facts returned by backend.
- In-character flavor must never contradict control/status text.
- Moments should not require users to interpret system mechanics.

## Designer responsibility boundaries
Designers can:
- shape how moments look/sound (timing, layout, ambience, microcopy flavor)
- choose whether the moment is shown as:
  - subtle chip
  - side panel highlight
  - chapter separator
- tune the moment’s emphasis according to `severity`

Designers cannot:
- invent triggers not defined by backend state changes
- create separate logic that decides when to show a moment

