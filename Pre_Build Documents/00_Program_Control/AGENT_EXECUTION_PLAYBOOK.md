# Agent Execution Playbook

## Purpose

This playbook operationalizes the V2 blueprint into parallel agent execution lanes while preserving contracts-first delivery.

## Inventory Matrix (Root Markdown Classification)


| File                                                  | Domain                                | Primary Owner              | Key Dependents          |
| ----------------------------------------------------- | ------------------------------------- | -------------------------- | ----------------------- |
| `README.md`                                           | Program entrypoint                    | Dev Supervisor             | All agents              |
| `FULL_FINAL_BLUEPRINT.md`                             | Architecture/product                  | Dev Supervisor             | All agents              |
| `API_CONTRACTS_PLATFORMCLIENT.md`                     | Contracts/API                         | Backend API Lead           | UX, QA, Runtime         |
| `SESSION_AND_NODE_STATE_MACHINE.md`                   | Contracts/state machine               | Backend API Lead           | Runtime, QA             |
| `TENANCY_AND_RBAC_MODEL.md`                           | Contracts/governance                  | Data Governance Lead       | Security, QA            |
| `EVENTS_AUDIT_AND_IMMUTABILITY_PROTOCOL.md`           | Contracts/governance                  | Data Governance Lead       | QA, Admin               |
| `AGENT_RUNTIME_SPEC.md`                               | Contracts/runtime                     | Runtime Spec Lead          | UX, QA                  |
| `INTERLOCUTOR_DEFINITION_AND_PROTOCOLS.md`            | Contracts/runtime                     | Runtime Spec Lead          | UX, QA                  |
| `VOICE_STREAMING_ARCHITECTURE.md`                     | Contracts/voice                       | Runtime Spec Lead          | Voice UX, QA            |
| `VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md`              | Contracts/voice                       | Runtime Spec Lead          | Backend, QA             |
| `ADMIN_DOMAIN_SPEC.md`                                | Contracts/admin                       | Backend API Lead           | QA, UX                  |
| `TRACKER_USER_AND_ADMIN_SPEC.md`                      | Contracts/admin                       | Backend API Lead           | QA, UX                  |
| `TESTING_PROTOCOL_END_TO_END.md`                      | Contracts/testing                     | QA Lead                    | All implementing leads  |
| `EVALUATION_CONTRACT_VALIDATION_STRATEGY.md`          | Contracts/testing                     | QA Lead                    | Backend, Runtime        |
| `OBSERVABILITY_AND_GUARDRAILS.md`                     | Contracts/reliability                 | Infra Lead                 | Backend, QA, Security   |
| `DESIGN_AGENT_WORKFLOW.md`                            | Design authority                      | Designer Supervisor        | All design sub-agents   |
| `V2_DESIGN_PRINCIPLES_AND_CREDIBILITY_CONSTRAINTS.md` | Design authority                      | Designer Supervisor        | UX, Voice UX            |
| `V2_UI_VARIATION_CONTRACT.md`                         | Design authority                      | UI/HUD Designer            | UX, QA                  |
| `V2_MICROCOPY_AND_TONE_GUIDE.md`                      | Design authority                      | Microcopy Designer         | UX, Runtime             |
| `V2_DESIGN_SYSTEM_TOKENS_AND_LAYOUT_RULES.md`         | Design authority                      | UI/HUD Designer            | UX                      |
| `V2_SCENARIO_AMBIENCE_AND_MOOD_SPEC.md`               | Design authority                      | Scenario Ambience Designer | UX, Runtime             |
| `V2_VALUE_MOMENTS_SPEC.md`                            | Design authority                      | Scenario Ambience Designer | UX, QA                  |
| `V2_VALUE_MOMENT_TO_EVENT_MAPPING.md`                 | Design authority + event traceability | Scenario Ambience Designer | Data, QA, Admin         |
| `V2_VOICE_UI_AND_SOUND_DESIGN_SPEC.md`                | Design authority                      | Voice UX/Sound Designer    | Runtime, QA             |
| `LANDING_AND_DASHBOARD_FLOWS.md`                      | Architecture/product                  | UX/Scenario Lead           | UI/HUD Designer         |
| `V2_UX_CONTENT_SYSTEM.md`                             | Architecture/product                  | UX/Scenario Lead           | Microcopy Designer      |
| `SCENARIOS.md`                                        | Product/scenario corpus               | UX/Scenario Lead           | Backend, Runtime, QA    |
| `DYNAMIC_DIFFICULTY_ADJUSTMENT.md`                    | Product/game logic                    | Runtime Spec Lead          | Backend, UX             |
| `LLM_ORCHESTRATOR_PROMPT_ARCHITECTURE.md`             | Architecture/LLM orchestration        | Runtime Spec Lead          | Backend, QA             |
| `SCHEMA_DESIGN_PROFILE_METRICS.md`                    | Data model                            | Data Governance Lead       | Backend, QA             |
| `DATABASE_SCHEMAS_DETAILS.md`                         | Data model                            | Data Governance Lead       | Backend, Security       |
| `DATABASE_ENTITY_RELATIONSHIP.md`                     | Data model                            | Data Governance Lead       | Backend                 |
| `REACT_FRONTEND_ARCHITECTURE.md`                      | Frontend architecture                 | UX/Scenario Lead           | UI/HUD Designer, QA     |
| `REACT_State_Mgt_Handling.md`                         | Frontend architecture                 | UX/Scenario Lead           | UI/HUD Designer         |
| `CERT_AND_REWARD_ARCHITECTURE.md`                     | Product/economy                       | UX/Scenario Lead           | Backend, Runtime        |
| `PROMPT_STRATEGY_ASSESSMENT.md`                       | Product/LLM review                    | Runtime Spec Lead          | Dev Supervisor          |
| `AGENT_TEAM_TOPOLOGY_DEV.md`                          | Program control                       | Dev Supervisor             | All agents              |
| `AGENT_WORK_SLICING_GUIDE.md`                         | Program control                       | Dev Supervisor             | All agents              |
| `V2_DOC_INVENTORY.md`                                 | Program control index                 | Dev Supervisor             | All agents              |
| `README_legacy_index.html.md`                         | Archive                               | Dev Supervisor             | Optional reference only |


## Team Interaction Rules

- Dev Supervisor is final tie-breaker for contract conflicts.
- Contract updates must be applied to owning docs before implementation changes.
- QA blocks merges when contract parity or deterministic replay expectations fail.
- Designer Supervisor blocks visual/audio changes that violate credibility gate constraints.

## Handoff Artifact Contract

Every handoff includes:

1. Source docs used.
2. Slice IDs delivered.
3. Acceptance checks passed.
4. Test evidence attached (unit/integration/E2E).
5. Known risks and edge-case residuals.

