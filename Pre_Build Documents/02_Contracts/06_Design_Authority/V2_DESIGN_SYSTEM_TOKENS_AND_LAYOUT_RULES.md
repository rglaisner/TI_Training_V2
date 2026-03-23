# V2 Design System Tokens + Layout Rules

This doc defines UI layout constraints and design tokens that keep V2:
- credible as a professional “Mission Control” tool
- immersive as an RPG-like simulation
- consistent across scenario variants and HUD skins

This is a doc-only contract. It does not define backend behavior.

Authoritative UI modules (renderer mapping):
- `V2_UX_CONTENT_SYSTEM.md` (HUD modules and renderer responsibilities)

## Non-negotiable layout rules (HUD skeleton stability)

### 1) HUD regions are fixed
Every mission screen must include:
- Narrative region (primary scene text)
- Input region (branch/open/voice entry)
- Social region (Mentor/Crowd/Roaming messages queue)
- Tools/status region (evaluation state, mentor controls, voice controls)
- Terminal/dossier region (only when `MissionState.isTerminal=true`)

Design may change internal padding, ordering, and visuals, but it cannot remove any region.

### 2) Single source of “what just happened”
Only the backend-updated state should drive the authoritative moment changes.
The UI must use these signals:
- `MissionState.currentNode` changed => show new narrative context
- `MissionState.isTerminal=true` => show dossier summary

## Token groups (reference-only)

### Typography (credibility)
- Titles: high-contrast, condensed or mono-friendly display font (choose in implementation)
- Body: highly legible sans font
- Microcopy (instructions/status): monospace or tabular style for precision feel

Rules:
- do not use decorative fonts for control/status text
- keep all status/instruction text >= readable size for 1080p

### Color semantics
Define semantic intent, not aesthetic colors.

- `Color.Status.Waiting`: user is expected to act
- `Color.Status.Evaluating`: backend work is in progress
- `Color.Status.Success`: decision accepted (non-terminal)
- `Color.Status.Terminal`: scenario complete
- `Color.Status.Error`: evaluation failed; retry possible
- `Color.Social.NPC`: in-character content
- `Color.Social.System`: professional system/status style

Rules:
- Status colors must remain consistent across skins.
- NPC flavor must never reuse error colors.

### Spacing scale (layout rhythm)
Use a consistent spacing unit (1x) and derive:
- `spacing-1x` small gaps for lines and pills
- `spacing-2x` panel padding
- `spacing-3x` section separation
- `spacing-4x+` cinematic separators/chapter breaks

## Layout constraints per HUD module

### Narrative region
- must always be visible without scrolling in the default desktop layout
- must support emphasis for decisions and key details

### Input region
- must visually signal the “current required input type”:
  - branching: buttons/options
  - open input: editor/textarea + submit
  - voice: transcript panel + confirm control

When evaluation is running:
- disable submission controls
- show a single clear status state (“Evaluation running…”)

### Social region
- must render as a queue with preserved ordering
- must differentiate:
  - mentor/guidance messages
  - crowd pressure messages
  - roaming intel messages

### Tools/status region
Minimum elements:
- evaluation status indicator
- mentor action entry (if supported by node)
- voice controls (if voice mode is active for the session)

## Animation rules (immersion without confusion)

### Allowed animations
- subtle transitions for node changes
- emphasis/glow for NPC messages appearing
- “pulse” or “spinner” indicators that correlate to evaluation running

### Forbidden animations
- animations that suggest scoring completed when it has not
- delayed state changes (UI must show backend truth as soon as it arrives)

## Accessibility rules (must pass)
- contrast for control/status text
- keyboard focus order is predictable for the input region
- reduce motion option should be respected (no essential info conveyed only by motion)

