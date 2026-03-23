# Interlocutor Definitions & Protocols

This doc defines the *types of “people”* (interlocutors) that appear during missions and how they behave, including voice-enabled variants.

Interlocutor is a runtime concept used by both:
- the social engine (text/UX mode)
- the voice mode (audio conversation mode)

## Shared interlocutor protocol rules

### 1) Inputs each interlocutor may receive
- `missionContext`:
  - current node narrative/challenge text
  - DDA tier routing instructions
  - persona state / cosmetics (as allowed by prompt assembly rules)
- `userLatestAttempt`:
  - last submitted text OR transcriptText (voice)
- `recentSocialContext` (optional):
  - last 1–3 NPC messages for continuity

### 2) Output contract
- Returns one or more `SocialAgentMessage` objects (see `AGENT_RUNTIME_SPEC.md`).
- If the interlocutor provides “guidance” (mentor-like behavior), it returns `hint` metadata.
- Interlocutors do not directly mutate mission progression.

### 3) Guardrail handling
Use a consistent “soft guardrails” behavior:
- stay in character
- if user strays off brief or provides no actionable content:
  - end the interlocutor dialogue segment abruptly but professionally
  - return to “work mode”

## Interlocutor catalog (v2)

### Mentor
- Purpose: on-demand Socratic guidance.
- Trigger:
  - user taps Mentor button
  - optionally node config schedules a mentor moment
- Protocol:
  - ask clarifying questions
  - give minimal directional hints, not full answers
  - adapt mentorship style to DDA tier:
    - lower tier: more scaffolding
    - higher tier: more resistance and skepticism
- Scoring tie-in:
  - mentor output may be included in the next evaluation prompt context

### The Crowd (events / stakeholder pressure)
- Purpose: pressure, skepticism, adversarial questioning.
- Trigger:
  - node config sets “meeting” behavior
  - usually precedes the user’s open-input submission
- Protocol:
  - generate a sequential dialogue plan
  - crowd questions should:
    - challenge assumptions
    - demand better evidence or clearer reasoning
    - bait ethical or OPSEC-leaning mistakes for higher tiers (if applicable to node)
- Scoring tie-in:
  - crowd dialogue becomes part of the prompt context for evaluation

### Office Roaming (ambient coworker / informal intel)
- Purpose: ambient intel, nudges, and tone setting.
- Trigger:
  - timed or event-based triggers from node config
  - e.g., after a choice or after a period of silence
- Protocol:
  - if user goes off-brief: excuse themselves and end segment
  - if on-brief: provide informal intel that can be referenced by the user
- Scoring tie-in:
  - roaming intel is included in evaluation context

### IndividualCoworker (direct 1:1 teammate / peer)
- Purpose: direct, conversational alignment with a single colleague/teammate; provides practical feedback, clarifications, and human pressure that feels like real collaboration.
- Trigger:
  - node config indicates a peer check-in (instead of a crowd/meeting)
  - typically follows a branching choice or appears when the user needs a “grounded” next step
- Protocol:
  - tone adapts to DDA tier (more supportive on low tier; more skeptical/pressuring on high tier)
  - asks concise, role-appropriate questions the user can answer in their next submission
  - stays in character and does not claim to have scored the user (scoring is backend-owned)
- Scoring tie-in:
  - does not award competency points directly
  - the coworker’s dialogue is included in the backend prompt context for the next user evaluation (consistent with the “interlocutors do not directly mutate mission progression” rule)
- Voice mode behavior:
  - if voice mode is active, the “voice runner” policy applies:
    - produce a decision turn for backend evaluation only when the transcript boundary is confirmed
    - if the user interrupts the coworker, stop NPC output and wait for the user to finish the utterance

### Ambience presets per interlocutor (renderer-only mapping)
This section tells designers which ambience mood preset to select when rendering a given interlocutor.

Important:
- renderer-only: selecting a mood preset must not change mission logic, evaluation timing, or the state machine
- terminals override: if `MissionState.isTerminal=true`, use the terminal mood preset regardless of interlocutor (see below)

Mood preset names (must reuse exactly):
- `mood_calm_professional`
- `mood_under_pressure`
- `mood_opsec_threatened`
- `mood_terminal_victory` / `mood_terminal_reflection`

Mapping rules (starter):
- Default:
  - use `mood_calm_professional` for low-to-mid DDA tier moments
  - use `mood_under_pressure` for high DDA tier moments
- OPSEC / highest-pressure nodes:
  - use `mood_opsec_threatened` when the node’s challenge includes OPSEC or the resolved DDA bucket indicates maximum pressure
- Terminal outcome:
  - use `mood_terminal_victory` when the backend indicates strong completion (distinction/merit threshold)
  - use `mood_terminal_reflection` when the backend indicates failure/cognitive reset style outcomes

Interlocutor-to-mood intent (non-terminal):
- Mentor -> `mood_calm_professional` (or `mood_under_pressure` for higher tiers)
- The Crowd -> `mood_under_pressure` (escalate to `mood_opsec_threatened` when the node is OPSEC-heavy)
- Office Roaming -> `mood_calm_professional` (light tension only; never imply evaluation completion)
- IndividualCoworker -> `mood_calm_professional` on low tier; `mood_under_pressure` on higher tier when peer pressure should increase
- BoardReview -> `mood_under_pressure` (structured pressure; upgrade to OPSEC mood if the node requires it)
- TeamMeeting -> `mood_calm_professional` (constraint-driven calm; pressure follows DDA)
- Boss -> `mood_under_pressure` (upgrade to `mood_opsec_threatened` for highest-pressure leadership expectation nodes)

### BoardReview
- Purpose: high-level critique during strategy framing.
- Trigger:
  - node indicates governance/board-level stakeholders
- Protocol:
  - terse, structured questioning
  - prioritize strategy, ethics, and risk framing
- Scoring tie-in:
  - targeted toward competencies in node config (via evaluation prompt assembly)

### TeamMeeting
- Purpose: internal alignment and operational constraint discussion.
- Trigger:
  - node config requests internal sync tone
- Protocol:
  - collaborative but constraint-driven
  - emphasizes feasibility, resource tradeoffs, and execution clarity

### Boss
- Purpose: leadership expectation setting and motivational pressure.
- Trigger:
  - node config includes leadership-level interlocutor
  - or voice mode triggers a “command voice” moment
- Protocol:
  - DDA-tier-based tone:
    - lower tier: supportive but direct
    - higher tier: impatient, skeptical, and opportunistic about mistakes

### Voice-specific “Interlocutor Runner” behavior
- Purpose: ensure voice conversation remains coherent with mission evaluation.
- Trigger:
  - voice session is active and a node config says an interlocutor should be present
- Protocol:
  - voice runner must maintain an “end-of-turn boundary” policy:
    - only when the transcript boundary is confirmed should it produce a “decision turn” for backend evaluation
  - interruptions:
    - if the user interrupts the NPC, the voice runner stops the NPC output and waits for user to finish the utterance

## Interlocutor-to-competency mapping (how it affects scoring)
Interlocutors do not directly award competency points.
Instead:
- their dialogue and tone are included in the backend prompt context
- the eventual user submission is evaluated against node-configured target competencies using the strict JSON contract

This keeps the scoring system consistent and auditable.

