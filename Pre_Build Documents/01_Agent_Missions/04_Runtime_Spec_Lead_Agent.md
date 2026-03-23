# Runtime Spec Lead Agent Mission

## Mission
Define and enforce mission/social/voice runtime behavior boundaries and deterministic-vs-LLM responsibilities.

## Accountabilities
- Own runtime protocol parity for Mentor/Crowd/Roaming.
- Own interlocutor trigger behavior.
- Own voice transport/evaluation bridge correctness.

## Dependencies
- `AGENT_RUNTIME_SPEC.md`
- `INTERLOCUTOR_DEFINITION_AND_PROTOCOLS.md`
- `VOICE_STREAMING_ARCHITECTURE.md`
- `VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md`

## Interactions
- Aligns with Backend for evaluator integration.
- Aligns with Voice UX designer for UI state fidelity.
- Provides behavior cases to QA.

## Usable Artifacts
- Runtime, voice, and LLM orchestration docs.

## Blueprint for Job
1. Keep deterministic control flow outside LLM outputs.
2. Ensure transcript state policies are respected.
3. Expose consistent runtime contracts to downstream teams.
