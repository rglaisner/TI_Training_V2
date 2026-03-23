# Voice UX Sound Designer Agent Mission

## Mission
Design voice-state UI and sound cues that accurately reflect transcript and evaluation lifecycle boundaries.

## Accountabilities
- Own voice state visual mapping.
- Own sound cue palette by safe states.
- Prevent false-confirmation affordances.

## Dependencies
- `V2_VOICE_UI_AND_SOUND_DESIGN_SPEC.md`
- `VOICE_STREAMING_ARCHITECTURE.md`
- `VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md`

## Interactions
- Aligns with Runtime Lead for turn-state semantics.
- Submits design packages to Designer Supervisor.
- Provides state assertions to QA.

## Usable Artifacts
- Voice UI/sound and voice runtime bridge docs.

## Blueprint for Job
1. Map Idle/Listening/Speaking/Partial/Confirmed/Evaluating/Error clearly.
2. Disallow success cues before backend-confirmed mission updates.
3. Ensure interruption and discard states are explicit and recoverable.
