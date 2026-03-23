# V2 Doc Inventory (Covered vs Missing)

This file inventories what already exists in the repo versus what still needs to be specified before serious implementation. It is aligned with the “V2 Planning Doc Set” plan you attached.

## Already covered (foundation)

### Mission loop, architecture, and contracts
- `README.md`
  - Core “Mission Control” loop (auth → scenario selection → backend evaluation → immutable event logging).
  - Separation of frontend visual console vs backend simulation engine.
  - Evaluation/scoring contract at a high level.
  - Progression/value economy (serious vs fun track) overview.
  - References to the blueprint and supporting docs.
- `FULL_FINAL_BLUEPRINT.md`
  - Concrete decoupled stack: React console + Node/TypeScript backend + Firestore.
  - `PlatformClient` boundary concept (UI never touches Firestore directly).
  - Interaction model: branching vs open input; how evaluation and persistence fit together.
  - “Agentic Social Engine” concept (Mentor, Crowd, Office Roaming) and its soft-guardrail approach.
  - Dual-track economy + “cosmetic injection” concept (cosmetics alter persona prompts).

### Frontend state management boundary
- `REACT_FRONTEND_ARCHITECTURE.md`
  - Zustand “dumb console” rationale (performance isolation for ticking timers, etc.).
  - Mission store responsibilities and UI slice consumption patterns.
- `REACT_State_Mgt_Handling.md`
  - Auth integration notes (Firebase JWT attached via `PlatformClient` interceptors).

### LLM orchestration and JSON evaluation contract
- `LLM_ORCHESTRATOR_PROMPT_ARCHITECTURE.md`
  - Prompt architecture (system prompt + context injection + enforced JSON schema).
  - Execution flow description for `/api/missions/decision` (extract → retrieve → assemble → execute → persist → respond).
- `DYNAMIC_DIFFICULTY_ADJUSTMENT.md`
  - DDA framing: “same chassis, different cognitive load/NPC hostility.”
  - Specialty “passive listening” model (Easter egg/observer badge concept).

### Data modeling (profiles + events)
- `DATABASE_SCHEMAS_DETAILS.md`
  - Profile metrics schema concepts (category scores, competency details, labels).
  - Event log schema concept (scenario/node, anonymized profile hash, awarded score, feedback).
  - How profiles drive DDA routing and how cosmetics affect persona prompt building.
- `SCHEMA_DESIGN_PROFILE_METRICS.md`
  - Expanded competency taxonomy strings used by the orchestrator.
  - Reinforces profile/event schema intent and DDA/cosmetic ties.

### Certification & value economy
- `CERT_AND_REWARD_ARCHITECTURE.md`
  - Certification levels (0–6), medal tiers (Distinction/Merit/Pass).
  - XP track and cosmetics/perks influence on simulation behavior.
  - Specialty/observer badge narrative.

## Missing (needs new planning docs)

### Platform & deployment alignment
- `PLATFORM_ARCHITECTURE_DECISIONS.md` (not currently present)
- `INTEGRATIONS_CONNECTIVITY.md` (not currently present)

### Backend API contract + explicit mission state machine
- `API_CONTRACTS_PLATFORMCLIENT.md` (not currently present)
- `SESSION_AND_NODE_STATE_MACHINE.md` (not currently present)

### Data governance: tenancy, RBAC, and event immutability enforcement
- `TENANCY_AND_RBAC_MODEL.md` (not currently present)
- `EVENTS_AUDIT_AND_IMMUTABILITY_PROTOCOL.md` (not currently present)

### Agent architecture for parallel “dev leads” and runtime behavior
- `AGENT_TEAM_TOPOLOGY_DEV.md` (not currently present)
- `AGENT_WORK_SLICING_GUIDE.md` (not currently present)
- `AGENT_RUNTIME_SPEC.md` (not currently present)
- `INTERLOCUTOR_DEFINITION_AND_PROTOCOLS.md` (not currently present)

### Voice streaming + voice-to-evaluation bridge contract
- `VOICE_STREAMING_ARCHITECTURE.md` (not currently present)
- `VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md` (not currently present)

Implementation note: you provided a reusable live-voice demo, `rglaisner/Talk_to_me_Live`. The planning docs should treat it as a reference implementation for *transport* (two-way audio streaming), not as the source of truth for *certification scoring*.

### Admin capabilities + tracker
- `ADMIN_DOMAIN_SPEC.md` (not currently present)
- `TRACKER_USER_AND_ADMIN_SPEC.md` (not currently present)

### Advanced V2 UX: landing, cinematic entry, dashboard, scenario selection, immersive designs
- `V2_UX_CONTENT_SYSTEM.md` (not currently present)
- `LANDING_AND_DASHBOARD_FLOWS.md` (not currently present)

### Comprehensive testing protocol + evaluation contract validation
- `TESTING_PROTOCOL_END_TO_END.md` (not currently present)
- `EVALUATION_CONTRACT_VALIDATION_STRATEGY.md` (not currently present)

### Observability / reliability / cost guardrails (LLM + streaming)
- `OBSERVABILITY_AND_GUARDRAILS.md` (not currently present)

## Summary

You already have strong narrative and conceptual coverage for mission flow, LLM evaluation contract, and schemas. The missing work is mostly “operationalization”: explicit backend contracts/state machine, governance rules, voice transport bridging, admin/tracker requirements, and an end-to-end test + observability framework that lets multiple agent leads execute in parallel without ambiguity.

