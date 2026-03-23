# TIC Trainer V2

## What This Is
TIC Trainer V2 is an immersive, AI-evaluated mission simulation for Talent Intelligence (TI), Workforce Planning, and People Analytics practitioners.

The platform is designed as "Mission Control": users make decisions in branching missions (and free-text reasoning), and the backend evaluates outcomes against a TI Competency Catalog to drive certification-grade progression.

Authoritative architecture and rationale: [FULL_FINAL_BLUEPRINT.md](Pre_Build%20Documents/03_Architecture_and_Product/01_Blueprint_and_Context/FULL_FINAL_BLUEPRINT.md).

## Core Gameplay Loop
At a high level, each mission follows this pattern:

1. User authenticates and selects a scenario.
2. Frontend calls the backend via the `PlatformClient` boundary (frontend is a visual console; backend is the source of truth).
3. The backend returns a `MissionState` (including the current node context).
4. The frontend renders the narrative + tools/inputs for that node.
5. User submits either:
   - A branching choice, or
   - Free-text reasoning for open-input evaluation.
6. The backend evaluates the submission:
   - Branching nodes apply deterministic effects.
   - Open input nodes are scored using the competency contract (Gemini 2.5 + strict JSON output contract), then applied to the user's profile.
7. The backend returns the next `MissionState` (or a terminal state that triggers a summary view).
8. Every evaluation is appended to the immutable event log (for later auditing and analytics).

## Decoupled Architecture (Frontend Console vs Backend Engine)
V2 uses a strict decoupled stack:

- Frontend (React + Tailwind): renders UI and transient UX state, but never owns authoritative simulation truth.
- Backend API (Node.js + TypeScript): owns mission state, LLM orchestration, competency scoring, and persistence.
- Persistence (Firestore or equivalent NoSQL): stores per-tenant profiles plus an anonymized, append-only event lake.

See: [FULL_FINAL_BLUEPRINT.md](Pre_Build%20Documents/03_Architecture_and_Product/01_Blueprint_and_Context/FULL_FINAL_BLUEPRINT.md).

## Documentation Map (contracts-first)
This repo is primarily architecture + planning documentation for **TIC Trainer V2**.

All pre-build assets are now organized under [`Pre_Build Documents`](Pre_Build%20Documents). Start with:
- [`AGENT_EXECUTION_PLAYBOOK.md`](Pre_Build%20Documents/00_Program_Control/AGENT_EXECUTION_PLAYBOOK.md)
- [`MASTER_KICKOFF_PROMPT.md`](Pre_Build%20Documents/00_Program_Control/MASTER_KICKOFF_PROMPT.md)
- [`INTEGRATION_MILESTONES_AND_DEPENDENCIES.md`](Pre_Build%20Documents/00_Program_Control/INTEGRATION_MILESTONES_AND_DEPENDENCIES.md)

### Frontend <-> Backend contracts
- `PlatformClient` request/response + error model: [`API_CONTRACTS_PLATFORMCLIENT.md`](Pre_Build%20Documents/02_Contracts/01_API_and_State/API_CONTRACTS_PLATFORMCLIENT.md)
- Mission session + node transition rules: [`SESSION_AND_NODE_STATE_MACHINE.md`](Pre_Build%20Documents/02_Contracts/01_API_and_State/SESSION_AND_NODE_STATE_MACHINE.md)

### Data governance (multi-tenant + auditability)
- Tenant isolation + RBAC model: [`TENANCY_AND_RBAC_MODEL.md`](Pre_Build%20Documents/02_Contracts/02_Data_Governance/TENANCY_AND_RBAC_MODEL.md)
- Immutable, anonymized event lake: [`EVENTS_AUDIT_AND_IMMUTABILITY_PROTOCOL.md`](Pre_Build%20Documents/02_Contracts/02_Data_Governance/EVENTS_AUDIT_AND_IMMUTABILITY_PROTOCOL.md)

### Runtime agents + voice integration
- In-app agent behavior contracts (Mentor/Crowd/Roaming): [`AGENT_RUNTIME_SPEC.md`](Pre_Build%20Documents/02_Contracts/03_Runtime_and_Voice/AGENT_RUNTIME_SPEC.md)
- Interlocutor definitions + trigger/protocol rules: [`INTERLOCUTOR_DEFINITION_AND_PROTOCOLS.md`](Pre_Build%20Documents/02_Contracts/03_Runtime_and_Voice/INTERLOCUTOR_DEFINITION_AND_PROTOCOLS.md)
- Voice streaming transport architecture: [`VOICE_STREAMING_ARCHITECTURE.md`](Pre_Build%20Documents/02_Contracts/03_Runtime_and_Voice/VOICE_STREAMING_ARCHITECTURE.md)
- Voice transcript/turn bridge into mission evaluation: [`VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md`](Pre_Build%20Documents/02_Contracts/03_Runtime_and_Voice/VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md)

### Admin + tracker
- Admin capabilities + event/audit inspection expectations: [`ADMIN_DOMAIN_SPEC.md`](Pre_Build%20Documents/02_Contracts/04_Admin_and_Tracker/ADMIN_DOMAIN_SPEC.md)
- User tracker + admin tracker requirements: [`TRACKER_USER_AND_ADMIN_SPEC.md`](Pre_Build%20Documents/02_Contracts/04_Admin_and_Tracker/TRACKER_USER_AND_ADMIN_SPEC.md)

### Testing + operational readiness
- End-to-end testing protocol (Playwright + deterministic mocking): [`TESTING_PROTOCOL_END_TO_END.md`](Pre_Build%20Documents/02_Contracts/05_Testing_and_Observability/TESTING_PROTOCOL_END_TO_END.md)
- Strict JSON evaluation contract validation strategy: [`EVALUATION_CONTRACT_VALIDATION_STRATEGY.md`](Pre_Build%20Documents/02_Contracts/05_Testing_and_Observability/EVALUATION_CONTRACT_VALIDATION_STRATEGY.md)
- Observability & reliability guardrails (LLM + streaming): [`OBSERVABILITY_AND_GUARDRAILS.md`](Pre_Build%20Documents/02_Contracts/05_Testing_and_Observability/OBSERVABILITY_AND_GUARDRAILS.md)

### Design authority (UI/UX + RPG immersion)
- Credibility gate for any visual/audio changes: [`V2_DESIGN_PRINCIPLES_AND_CREDIBILITY_CONSTRAINTS.md`](Pre_Build%20Documents/02_Contracts/06_Design_Authority/V2_DESIGN_PRINCIPLES_AND_CREDIBILITY_CONSTRAINTS.md)
- Microcopy + tone rules (status vs in-character): [`V2_MICROCOPY_AND_TONE_GUIDE.md`](Pre_Build%20Documents/02_Contracts/06_Design_Authority/V2_MICROCOPY_AND_TONE_GUIDE.md)
- Design tokens + layout constraints for HUD modules: [`V2_DESIGN_SYSTEM_TOKENS_AND_LAYOUT_RULES.md`](Pre_Build%20Documents/02_Contracts/06_Design_Authority/V2_DESIGN_SYSTEM_TOKENS_AND_LAYOUT_RULES.md)
- Skin + Frame variation safety contract: [`V2_UI_VARIATION_CONTRACT.md`](Pre_Build%20Documents/02_Contracts/06_Design_Authority/V2_UI_VARIATION_CONTRACT.md)
- Value moments (what’s allowed and when): [`V2_VALUE_MOMENTS_SPEC.md`](Pre_Build%20Documents/02_Contracts/06_Design_Authority/V2_VALUE_MOMENTS_SPEC.md)
- Value moments explainability mapping to `/events`: [`V2_VALUE_MOMENT_TO_EVENT_MAPPING.md`](Pre_Build%20Documents/02_Contracts/06_Design_Authority/V2_VALUE_MOMENT_TO_EVENT_MAPPING.md)
- Scenario ambience + mood rules: [`V2_SCENARIO_AMBIENCE_AND_MOOD_SPEC.md`](Pre_Build%20Documents/02_Contracts/06_Design_Authority/V2_SCENARIO_AMBIENCE_AND_MOOD_SPEC.md)
- Voice UI + sound design states: [`V2_VOICE_UI_AND_SOUND_DESIGN_SPEC.md`](Pre_Build%20Documents/02_Contracts/06_Design_Authority/V2_VOICE_UI_AND_SOUND_DESIGN_SPEC.md)
- Designer agent workflow + review checklist: [`DESIGN_AGENT_WORKFLOW.md`](Pre_Build%20Documents/00_Program_Control/DESIGN_AGENT_WORKFLOW.md)

```mermaid
flowchart LR
  UI[React UI (Mission HUD)] -->|PlatformClient| API[Backend API (Simulation Engine)]
  API --> Profiles[Firestore profiles (per tenantId)]
  API --> Events[Firestore events (append-only evaluations)]
```

## Evaluation & Scoring Contract
The evaluation mechanism relies on a strict AI response contract.

For open input nodes, the backend instructs Gemini to return a JSON payload containing:

- `Score` (numeric quality score within the expected scale)
- `Demonstrated` (boolean: did the user meet the minimum threshold for the target competency set?)
- `Feedback` (in-character coaching/critique text)

This contract is the foundation for:

- Deterministic application to user profile metrics
- Immutable event logging
- Dynamic Difficulty Adjustment (DDA) in subsequent nodes

See: [LLM_ORCHESTRATOR_PROMPT_ARCHITECTURE.md](Pre_Build%20Documents/03_Architecture_and_Product/01_Blueprint_and_Context/LLM_ORCHESTRATOR_PROMPT_ARCHITECTURE.md) and [SCHEMA_DESIGN_PROFILE_METRICS.md](Pre_Build%20Documents/03_Architecture_and_Product/04_Data_Modeling/SCHEMA_DESIGN_PROFILE_METRICS.md).

## Progression & Value Economy
V2 uses a dual-track system to avoid "gamification fatigue" while still driving engagement.

### Serious Track (Certification & Labels)
- Core certification levels: `0-6`
- Scenario performance unlocks tiered outcomes (e.g., Distinction / Merit / Pass)
- Labels of excellence and competency mastery build a persistent, evidence-based profile

See: [CERT_AND_REWARD_ARCHITECTURE.md](Pre_Build%20Documents/03_Architecture_and_Product/02_Product_and_Scenarios/CERT_AND_REWARD_ARCHITECTURE.md).

### Fun Track (Engagement & Experience)
- XP accumulation
- Virtual cosmetics/perks (which can influence prompt context and NPC behavior)

### Specialty / Observer Badges
Specialties are treated as an "observer badge" concept: the platform can detect unprompted mastery in user free-text responses and mark passive recognition without turning the product into forced trivia.

Tied into DDA and schema support: [DYNAMIC_DIFFICULTY_ADJUSTMENT.md](Pre_Build%20Documents/03_Architecture_and_Product/02_Product_and_Scenarios/DYNAMIC_DIFFICULTY_ADJUSTMENT.md), [SCHEMA_DESIGN_PROFILE_METRICS.md](Pre_Build%20Documents/03_Architecture_and_Product/04_Data_Modeling/SCHEMA_DESIGN_PROFILE_METRICS.md), [CERT_AND_REWARD_ARCHITECTURE.md](Pre_Build%20Documents/03_Architecture_and_Product/02_Product_and_Scenarios/CERT_AND_REWARD_ARCHITECTURE.md).

## Dynamic Difficulty Adjustment (DDA)
DDA ensures missions remain replayable and meaningful across user levels.

Instead of reskinning (small parameter tweaks), DDA scales cognitive load and NPC hostility by selecting adaptive tiers based on the user's validated profile metrics.

In practice:
- The scenario is a "chassis" (same narrative structure)
- The backend routes and injects different tiered behavior/prompt modifiers based on profile scores
- The same scenario becomes meaningfully harder (or differently framed) for higher levels

See: [DYNAMIC_DIFFICULTY_ADJUSTMENT.md](Pre_Build%20Documents/03_Architecture_and_Product/02_Product_and_Scenarios/DYNAMIC_DIFFICULTY_ADJUSTMENT.md) and [SCHEMA_DESIGN_PROFILE_METRICS.md](Pre_Build%20Documents/03_Architecture_and_Product/04_Data_Modeling/SCHEMA_DESIGN_PROFILE_METRICS.md).

## Data Model (Profiles + Events)
V2 separates persistent user state from immutable evaluation history:

- `profiles` (per-tenant): competency scores, labels of excellence, and engagement totals/cosmetics
- `events` (per-tenant): anonymized, append-only evaluation records (scenarioId/nodeId + AI output + metadata)

This separation enables:
- DDA routing from profile metrics
- Auditable learning history from the event lake

See: [SCHEMA_DESIGN_PROFILE_METRICS.md](Pre_Build%20Documents/03_Architecture_and_Product/04_Data_Modeling/SCHEMA_DESIGN_PROFILE_METRICS.md).

## Frontend State Management (Zustand)
The frontend is a "dumb" visual console:
- It renders the mission and input UX.
- It manages transient UI state (spinners, timers, social dialogue queues) locally.

Zustand is used so only the necessary UI slices re-render when state changes (for example: timers should not force the entire HUD to refresh).

See: [REACT_FRONTEND_ARCHITECTURE.md](Pre_Build%20Documents/03_Architecture_and_Product/03_Frontend_and_UX_Architecture/REACT_FRONTEND_ARCHITECTURE.md) and [REACT_State_Mgt_Handling.md](Pre_Build%20Documents/03_Architecture_and_Product/03_Frontend_and_UX_Architecture/REACT_State_Mgt_Handling.md).

## LLM Orchestrator Prompt Architecture
The backend constructs prompts based on:
- the active persona + guardrails
- scenario context and node requirements
- the user profile (for difficulty routing and pushback behavior)

The system prompt enforces:
- safe conversational guardrails
- strict JSON output formatting
- a predictable schema that the backend can parse reliably

Keep the prompt strategy now (as described in [LLM_ORCHESTRATOR_PROMPT_ARCHITECTURE.md](Pre_Build%20Documents/03_Architecture_and_Product/01_Blueprint_and_Context/LLM_ORCHESTRATOR_PROMPT_ARCHITECTURE.md)).
Later refinement can move deterministic logic into regular functions/libraries and restrict the LLM to the tasks it performs best.

## V2 First Release Scenarios
The initial V2 release is driven by the validated set in:

- [SCENARIOS.md](Pre_Build%20Documents/03_Architecture_and_Product/02_Product_and_Scenarios/SCENARIOS.md)

That document defines adapted V1 scenarios plus new additions, and it is structured so scenario updates remain straightforward:
- prefer changes that can be made by adding/modifying scenario data and node configuration
- avoid bespoke UI tooling per new scenario

## Legacy Prototype (Not Up To Date)
The early, rough prototype narrative lived in the single-file `index.html` experience.

- Old narrative doc (quarantined): [README_legacy_index.html.md](Pre_Build%20Documents/04_Legacy_and_Archive/README_legacy_index.html.md)
- Reference file: `Pre_Build Documents/03_Architecture_and_Product/05_Project_Artifacts/index_archive.html` (keep for reference only; V2 development should be driven by the sources above)
