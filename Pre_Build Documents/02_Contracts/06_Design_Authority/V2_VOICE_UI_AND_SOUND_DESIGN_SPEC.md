# V2 Voice UI + Sound Design Spec

This doc is the UI/audio contract for V2 when voice mode is active. It is designed to:
- keep users oriented during two-way voice
- enforce the evaluation bridge boundary from `VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md`
- preserve credibility (no misleading “submitted/evaluated” cues)
- align with scenario ambience sound design from `V2_SCENARIO_AMBIENCE_AND_MOOD_SPEC.md`

Authority references:
- `VOICE_STREAMING_ARCHITECTURE.md` (transport and turn boundary approach)
- `VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md` (confirmed turns -> evaluation)
- `V2_UI_VARIATION_CONTRACT.md` (skins/frames must not break voice correctness)

## Voice UI state machine (frontend-only presentation contract)

The voice UI must be able to represent these states:

### State: Idle
Meaning:
- mic is off or voice mode not started
UI must show:
- “Voice ready” control (if enabled)
- no transcript content marked as confirmed

### State: Listening
Meaning:
- capturing user speech and streaming audio
UI must show:
- clear “Listening…” status
- optional live transcript marked as partial/capturing

Forbidden:
- showing “Transcript confirmed” or “Scoring now” in this state

### State: Speaking (AI output)
Meaning:
- the AI is talking (if two-way streaming is used)
UI must show:
- AI speaking indicator (do not imply evaluation)
- user can interrupt (stop/resume policy depends on transport)

### State: PartialTranscript
Meaning:
- you have partial transcript text but not yet confirmed
UI must show:
- transcript as “capturing…” or “in progress”
- confirm button state: disabled until confirmation policy allows it

Forbidden:
- evaluation triggers on partial transcript

### State: ConfirmedTranscript
Meaning:
- user completed a turn boundary and the transcript is finalized for evaluation
UI must show:
- “Transcript confirmed. Scoring now.”
- disable edits that would desync transcript from what will be evaluated

Bridge contract requirement:
- the evaluation request must include `transcriptText` from the confirmed boundary

### State: Evaluating (backend work)
Meaning:
- mission scoring is running for the confirmed turn
UI must show:
- control/status: “Evaluation running…”
- input disabled (no duplicate submissions)

Forbidden:
- showing terminal/dossier or “decision accepted” before `MissionState` updates arrive

### State: Discarded (interruption)
Meaning:
- the turn was interrupted and must be discarded
UI must show:
- “Turn discarded (interrupted).”
- show what the user should do next: “Speak again when ready.”

Event mapping:
- discard must not trigger `submitDecision`

### State: Error
Meaning:
- voice evaluation failed or transcript invalid
UI must show:
- professional message: “We couldn’t evaluate that turn.”
- recovery: “Try again. The scene didn’t move.”

## Confirm boundary policies (allowed UI logic)

Designers can implement confirmation using one or more policies:
- silence timeout (user stops speaking)
- explicit confirm button
- user stop gesture/button

Rule:
- confirmation is the only transition that allows the bridge to call the backend evaluation path.

## Sound design rules (soundscape without misleading truth)

### Ambient soundscape layers
This spec should not conflict with ambience presets:
- under-pressure rumble can increase intensity with DDA tier
- a “success confirmation” sound must only play when backend returns updated `MissionState` (not merely on local transcript finalize)

### Interruption
- when interruption occurs:
  - stop AI playback immediately
  - stop/duck any “speaking”/“success” sound effects

### Evaluation sounds
- during evaluation:
  - neutral professional “working” tone allowed
- after evaluation:
  - non-terminal success stinger allowed only after `MissionState.currentNode` updates
  - terminal success stinger allowed only after `isTerminal=true`

## Transcript UI content rules
- show partial transcript and confirmed transcript differently
- confirmed transcript must be visible before evaluation starts
- if transcript is short/empty:
  - show control message: “That turn is too brief to evaluate.”
  - allow retry without advancing

## Accessibility requirements
- reduce motion must reduce animations to maintain clarity
- audio cues must have corresponding text cues
- keyboard focus order must land on voice confirm controls first

