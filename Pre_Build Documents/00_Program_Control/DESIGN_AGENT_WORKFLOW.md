# Design Agent Workflow (Authority + Templates)

This document defines how the **designer team** (agents and sub-agents) should work with the rest of the implementation team.

It is contracts-first: designers must review existing planning docs, then produce UI/UX/ambience/microcopy outputs that comply with the credibility and safety contracts.

Primary non-negotiables:
- `V2_DESIGN_PRINCIPLES_AND_CREDIBILITY_CONSTRAINTS.md`
- `V2_UI_VARIATION_CONTRACT.md`

Secondary guides:
- `V2_MICROCOPY_AND_TONE_GUIDE.md`
- `V2_DESIGN_SYSTEM_TOKENS_AND_LAYOUT_RULES.md`
- `V2_SCENARIO_AMBIENCE_AND_MOOD_SPEC.md`
- `V2_VALUE_MOMENTS_SPEC.md`
- `V2_VALUE_MOMENT_TO_EVENT_MAPPING.md`
- `V2_VOICE_UI_AND_SOUND_DESIGN_SPEC.md`

## Designer agent topology (recommended)

### Designer Supervisor Agent
Owns:
- overall visual/audio coherence across the product
- ensuring every deliverable passes the credibility gate
- dependency coordination with backend/voice/test leads

### UI/HUD Module Designer (component-focused sub-agent)
Owns:
- variations of HUD modules while respecting the module regions and status clarity
- layout rules and token usage

### Microcopy + Tone Designer (copy-focused sub-agent)
Owns:
- control/status text correctness
- NPC tone consistency
- edge-case phrasing and retry/interruption copy rules

### Scenario Ambience Designer (scenario-focused sub-agent)
Owns:
- ambience templates per node + DDA tier + persona + cosmetics
- value moments presentation templates

### Voice UX + Sound Designer (voice-focused sub-agent)
Owns:
- voice UI state visuals and sound design cues
- transcript partial vs confirmed UX and interruption policies

## Review checklist (credibility gate)

For any proposed design change, the supervisor must check:
1. Contract safety:
   - does it preserve functional boundaries from `V2_UI_VARIATION_CONTRACT.md`?
2. Backend truth alignment:
   - does any visual imply scoring/completion without updated `MissionState`?
3. Voice boundary correctness:
   - does partial transcript ever look “confirmed”?
4. Recovery clarity:
   - does an error state provide a user-safe retry path?
5. Accessibility:
   - does reduced motion still keep status and actions understandable?

If any check fails: revert the change and request revision.

## Output templates (what designers deliver)

### Template A: HUD Skin + Frame proposal
Include:
- `variationId`
- impacted HUD regions (narrative/input/social/tools/terminal)
- what changes visually (Skin)
- what changes layout-wise (Frame)
- forbidden changes confirmation:
  - no submission timing changes
  - no voice evaluation boundary changes

### Template B: Scenario ambience pack
Include:
- `scenarioId`
- nodeIds (or node type categories)
- `ddaTier` mapping bucket (use the tier buckets already defined in `DYNAMIC_DIFFICULTY_ADJUSTMENT.md`)
- persona/cosmetics conditions (only what the backend provides)
- mood preset selection
- value moment presentation plan (which moment types, and what emphasis level)

### Template C: Value moment presentation rules
Include:
- momentId(s) from `V2_VALUE_MOMENTS_SPEC.md`
- UI module where it appears (chip, highlight, chapter separator, modal)
- required evidence field expectations (so admin can trace it via event mapping)

### Template D: Voice UI state visuals + sound palette
Include:
- mapping of each voice UI state:
  - Idle, Listening, Speaking, PartialTranscript, ConfirmedTranscript, Evaluating, Discarded, Error
- which sound effects (if any) correspond to each state
- forbidden sound cues:
  - no success stingers without backend mission state updates

## Change request protocol (how designers amend without breaking)

When designers believe an existing planning doc must change to improve UX safely:
1. Propose a “contract patch” with:
   - doc filename(s)
   - the exact section
   - why the change is needed for credibility or clarity
2. Submit it to the Dev Supervisor for dependency review.
3. Do not implement until the owning contract doc is updated.

## Acceptance criteria (designer deliverable done)

A designer workflow item is accepted only if:
- it complies with the credibility gate
- it references the exact contracts it depends on
- it includes at least one “edge case” page worth of copy (retry/interruption/error)

