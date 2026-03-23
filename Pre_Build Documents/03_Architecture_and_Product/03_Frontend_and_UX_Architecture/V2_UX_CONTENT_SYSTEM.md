# V2 UX Content System (Node-Driven UI)

This doc defines the UI “content system” for V2 so that:
- scenarios (and storylines) can change without forcing UI rewrites
- the mission HUD remains stable and backend-owned
- advanced UX elements (mini opening cinematic, landing/dossier/immersive in-scenario) are data-driven

Aligns with:
- `FULL_FINAL_BLUEPRINT.md` (React console holds zero authoritative state)
- `REACT_FRONTEND_ARCHITECTURE.md` / `REACT_State_Mgt_Handling.md` (Zustand slices, transient UX state)
- `SESSION_AND_NODE_STATE_MACHINE.md` (UI is a renderer of `NodeContext`)
- `V2_DESIGN_PRINCIPLES_AND_CREDIBILITY_CONSTRAINTS.md` (credibility gate for any visual/audio changes)
- `V2_UI_VARIATION_CONTRACT.md` (Skin + Frame: variation allowed, semantics frozen)
- `V2_MICROCOPY_AND_TONE_GUIDE.md` (status/control vs in-character text rules)
- `V2_DESIGN_SYSTEM_TOKENS_AND_LAYOUT_RULES.md` (layout regions + spacing/animation constraints)
- `V2_VALUE_MOMENTS_SPEC.md` + `V2_VALUE_MOMENT_TO_EVENT_MAPPING.md` (what moments may exist and why)

## Design principle

The UI must be a *renderer*:
- it may animate, display, queue NPC social messages, and manage transient timers
- it must not decide mission progression

All mission progression comes from backend `MissionState.currentNode`.

## Node-driven UI mapping

Define UI modules that correspond to a node’s requirements:
- `NarrativeModule`: renders scene/narrative text from `NodeContext`
- `InputModule`: renders either:
  - branching choice UI, or
  - open input editor for free-text reasoning
- `SocialModule`: renders agentic Social Engine messages (Mentor/Crowd/Roaming) as a queue
- `ToolsModule`: renders any node-specified tools (e.g., “request mentor hint”, timed bonus UI)
- `TerminalModule`: renders summary/dossier when `MissionState.isTerminal=true`
- `TimerModule`: transient only, based on UI timing rules for that node

### UI selection logic (contract)
The renderer chooses components based on `currentNode` fields:
- `currentNode.type` (branching vs open_input)
- presence of `openInputConfig` (target competencies, prompts, etc.)
- terminal rendering is controlled by `MissionState.isTerminal` (terminal may not always correspond to a renderable `ScenarioNode`)

Optional NodeContext metadata fields (only if the backend includes them):
- “supportsSocialSequence”
- “supportsMentor”
- “supportsTimedBonus”
- “supportsVoiceMode”

## Design variations without breaking HUD stability

You want V2 to feel more “cinematic” and immersive with multiple design options tied to scenario storyline.
The rule:
- variations may change styling, layout density, transition animations, and narrative framing
- but must not change:
  - the backend call boundaries
  - when submissions are allowed
  - how `MissionState` updates the UI

### Recommended variation strategy: “Skin + Frame”
Implement variations as:
1. `Skin`: theme tokens (colors, typography, background texture, etc.)
2. `Frame`: narrative container (panels, overlays, cinematic separators)
3. `Motifs`: scenario storyline elements (icons, callouts, “chapter” markers)

The mission HUD skeleton stays consistent; the skin/frame swap uses node config.

Variation safety reminder:
- any visual/audio variance must satisfy `V2_UI_VARIATION_CONTRACT.md`
- status/control text must follow `V2_MICROCOPY_AND_TONE_GUIDE.md`

## Mini opening cinematic + Base Landing

Model the experience in phases (front-end only; backend starts when scenario selected):
- `Splash/Cinematic`: purely presentational
- `Auth Gate`: sign-in / sign-on / guest options
- `Landing Dashboard`: scenario selection + “scenario being pushed” content
- `PreMission Setup`: show brief instructions and allow selecting voice mode preference
- `MissionHUD`: after backend `startMission`, render node-driven HUD

Design note:
- do not imply evaluation progress/completion during the cinematic
- status/control text must remain backend-truth synchronized (see `V2_UI_VARIATION_CONTRACT.md`)

## Dossier and completion UX

When `isTerminal=true`, show:
- certification summary (level band, medal tier)
- competency deltas and labels of excellence
- evidence highlights (recent evaluations)
- optional “event replay” link for admins (not for general users)

## Accessibility and reliability constraints
- UI must never depend on audio/cinematic animations to trigger backend calls.
- Voice mode UI:
  - must clearly show when a transcript is partial vs confirmed
  - must prevent double-submission by using `clientSubmissionId` idempotency rules (see the voice bridge contract)

