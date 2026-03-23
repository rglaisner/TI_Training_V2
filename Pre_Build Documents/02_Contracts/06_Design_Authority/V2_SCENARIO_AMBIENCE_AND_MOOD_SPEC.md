# V2 Scenario Ambience + Mood Spec

This spec defines how to deliver immersive “ambience” (visual/audio/copy mood) for scenarios and nodes while preserving backend correctness and mission evaluation contracts.

Authority:
- Designer authority is constrained by `V2_DESIGN_PRINCIPLES_AND_CREDIBILITY_CONSTRAINTS.md`
- Variation safety is constrained by `V2_UI_VARIATION_CONTRACT.md`
- Value moments are defined in `V2_VALUE_MOMENTS_SPEC.md`

## Definitions

### Ambience
Everything the user perceives that builds immersion but does not change mission logic:
- visuals (lighting, background textures, UI frame tone)
- soundscape (music/rumble/ambient noise; not “audio playback” of the mission truth)
- narration flavor (in-character styling of atmosphere text)
- social mood (crowd/mentor ambience tone cues)

### Mood preset
An ambience configuration chosen from a set of presets:
- maps to DDA tier (challenge intensity)
- maps to scenario/node type (topic/chapter mood)
- maps to persona + active cosmetics (tasteful injection)

## Ambience must be renderer-only
Ambience may:
- change presentation and non-authoritative effects
- increase comprehension and reduce cognitive load

Ambience may not:
- change `MissionState` or `currentNode`
- change evaluation triggering boundaries
- imply “scoring completed” before backend truth arrives

## Ambience assembly inputs

Designers may define ambience rules using:
- `scenarioId`
- `nodeId` (or node type)
- `ddaTier` (derived from profile/routing; see `DYNAMIC_DIFFICULTY_ADJUSTMENT.md`)
  - use buckets like: `level_1_to_3` and `level_4_to_6`
- `persona` (tone, jargon sensitivity, accent flavor where allowed by prompt assembly)
- `activeCosmetics` (cosmetic injection should only change prompt flavor + presentation, not correctness)
- `lastEvaluationOutcome` (success/failure/demonstrated) if you want emergent mood

## Ambience layers (recommended)

### Layer 1: Visual frame + typography mood
- lighting intensity and contrast
- panel density and “chapter” separators
- emphasis highlights for decision-critical phrases

Rules:
- control/status text must remain professionally readable across all moods
- NPC messages can be more theatrical, but status must remain stable

### Layer 2: Soundscape
- low-frequency tension ramps for higher DDA tier
- light “confirmation” stingers when backend sends accepted state
- no “success stinger” on failed evaluation

Rules:
- interruption must stop audio immediately
- if audio is reduced (accessibility), UI must still convey state via text/control surfaces

### Layer 3: Narrative atmosphere copy
- short, atmospheric callouts tied to the node narrative
- optional “micro NPC” side comments (non-essential)

Rules:
- must not contradict control/status text
- keep copy short to avoid hiding the required action

### Layer 4: Social pressure mood
- crowd skepticism visuals (e.g., animation/spacing changes)
- roaming intel tone cues (subtle shifts; never confuse user about evaluation state)

## Mood presets (starter examples)

Designers should define presets as named templates:
- `mood_calm_professional`
  - DDA: low to mid
  - effect: low tension, high clarity

- `mood_under_pressure`
  - DDA: higher
  - effect: tighter spacing, more urgent but still readable status cues

- `mood_opsec_threatened`
  - DDA: highest
  - effect: heightened skepticism tone in NPC social outputs and soundscape (still readable)

- `mood_terminal_victory` / `mood_terminal_reflection`
  - DDA: any, but differs based on terminal outcome

## Emergent ambience on evaluation outcomes
Optionally, you can add emergent ambience based on backend truth:
- if evaluation demonstrated=false, shift mood to “reflection/cognitive reset”
- if evaluation JSON invalid, mood shifts to “system repair” (professional, not dramatic)

This must only be derived from backend response/events, never from guesswork.

## What the backend must expose (suggested)
To let UI render ambience deterministically, backend should supply:
- `ddaTier` (or equivalent resolved routing label)
- `personaContext` identifiers (or enough to select a persona prompt flavor)
- terminal status (`isTerminal`)
- last evaluation outcome classification (success/failure/demonstrated)

UI then maps these inputs to ambience presets.

