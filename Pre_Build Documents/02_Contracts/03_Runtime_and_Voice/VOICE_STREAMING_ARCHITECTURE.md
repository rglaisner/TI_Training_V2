# Voice Streaming Architecture (Two-Way Live Dialogue)

This document describes how V2 should implement real-time voice conversations in a way that:
- supports two-way audio (user mic → AI audio output)
- enforces clean turn boundaries for deterministic mission evaluation
- handles interruption safely (stop speaking immediately, discard partial turns)
- keeps mission scoring backend-owned and auditable

UI/audio presentation contract:
- `V2_VOICE_UI_AND_SOUND_DESIGN_SPEC.md` (voice UI states + sound cues)
- `V2_UI_VARIATION_CONTRACT.md` (variation safety: presentation only)

## Reference sub-app (transport implementation)
You provided `rglaisner/Talk_to_me_Live` as the easiest-to-integrate “live voice convo” reference.

What we borrow from it (transport layer only):
- Microphone capture via `navigator.mediaDevices.getUserMedia({ audio: ... })`
- Real-time PCM encoding:
  - downsample/encode to ~`16000Hz` mono
  - float32 PCM → int16 PCM
- Live AI session via `@google/genai`:
  - `ai.live.connect({ model, config: { responseModalities: [AUDIO] ... } })`
- Realtime input dispatch:
  - `session.sendRealtimeInput({ audio: { mimeType: 'audio/pcm;rate=16000', data: base64 } })`
- Realtime audio output playback:
  - output audio arrives as base64 audio chunks
  - decode to `AudioBuffer` and schedule playback using a “next start time” accumulator
- Interruption handling:
  - when a message indicates interruption, stop scheduled sources and reset scheduling state

## Architecture: two planes

### Plane A: Voice transport + live dialogue (frontend)
Responsibilities:
- capture user audio and stream it to the live AI session
- play the AI audio back to the user in near real-time
- maintain a “turn boundary” model (start, in-progress, confirm/end)
- produce transcript text for mission evaluation (transcript is required on confirmed turns; it may come from captions or STT)

Strict non-responsibilities:
- do not mutate `/profiles` or mission progression directly

### Plane B: Mission evaluation (backend)
Responsibilities:
- evaluate the confirmed user turn using the strict open-input JSON contract
- persist audit events immutably
- return validated `MissionState` and next `NodeContext`

## Turn boundaries and interruption policy

### Turn boundary policy (required for reliability)
Define a “turn” as:
- the user’s utterance segment (from `turnStarted` until `turnEnded`)
- confirmed only after the voice UI determines the utterance is complete (silence timeout, user stop, or explicit confirm button)

Rules:
- Partial transcripts do not trigger scoring.
- If an utterance is interrupted, discard the partial turn and do not call evaluation.
- Only confirmed turns trigger a backend `submitDecision` call.

### Interruption handling
When the voice transport indicates interruption:
- stop all currently scheduled audio sources (AI playback)
- reset the playback scheduler accumulator
- keep voice UI in a “waiting for user” state until the user confirms a turn end

## Frontend modules (suggested)

### 1) `VoiceTransportSession`
- owns:
  - live AI connection
  - mic stream capture
  - PCM conversion pipeline
  - audio playback scheduler
  - interruption callback handling
- emits:
  - `onAiAudioChunk` (optional if you handle playback inside)
  - `onInterruption`
  - `onTurnFinalized` (when a turn boundary is confirmed)

### 2) `VoiceTurnController`
- owns:
  - silence detection / confirm button policy
  - transcript lifecycle (partial vs final)
- calls:
  - `VoiceToEvaluationBridge` when `turnFinalized`

### 3) `VoiceToEvaluationBridge`
- converts the finalized voice turn into the existing mission decision request format

## Transcript strategy (because you requested “two-way audio + optional text captions”)
Two implementation options:

Option 1 (best UX when available):
- use the live AI session to produce captions/transcript
- treat transcript as “soft evidence” that becomes “hard input” only on final turn confirmation

Option 2 (provider-agnostic):
- run a separate speech-to-text (STT) pipeline locally or server-side
- transcript is produced independently, still only used on final turn confirmation

In both options:
- if transcript is empty or below a confidence threshold, fall back to manual text entry (UI) and/or prompt the user to repeat.

Versioning note:
- For mission evaluation in this V2 planning set, the bridge contract treats `transcriptText` as required on confirmed turns (see [`VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md`](VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md)).

## Security and key handling
- Do not embed long-lived secrets in the client for production.
- If your chosen live AI SDK requires a client key:
  - prefer an ephemeral token pattern issued by backend
  - or route live audio through a backend relay that uses secrets server-side
- Keep any “voice learning” or persona persistence actions behind authenticated admin/user policies (see your admin specs).

