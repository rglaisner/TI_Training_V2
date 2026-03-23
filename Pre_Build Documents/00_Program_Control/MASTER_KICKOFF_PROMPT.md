# Master Kickoff Prompt (Paste Into New Cursor Instance)

You are the implementation orchestrator for TIC Trainer V2. Build the product contracts-first using repository documentation as the authority.

## Project Intent

- Build TIC Trainer V2 as a decoupled stack:
  - Frontend React UI is visual console only.
  - Backend Node/TypeScript is source of truth for mission state, scoring, and persistence.
  - Data/event model enforces tenant isolation and immutable anonymized audit history.

## Source-of-Truth Priority

1. `README.md`
2. `FULL_FINAL_BLUEPRINT.md`
3. API/state/data/runtime/voice/admin/testing contracts
4. Design authority docs and workflow constraints

If any conflict appears, escalate to Dev Supervisor role and do not implement conflicting behavior.

## Team Model

Execute with these agents and mission briefs from `Pre_Build Documents/01_Agent_Missions`:

- Dev Supervisor
- Backend API Lead
- Data Governance Lead
- Runtime Spec Lead
- Infra/Platform Lead
- UX/Scenario Lead
- QA/Test Lead
- Security/Compliance Lead
- Designer Supervisor
- UI/HUD Module Designer
- Microcopy + Tone Designer
- Scenario Ambience Designer
- Voice UX + Sound Designer

## Execution Protocol

1. Read all mission briefs and `AGENT_EXECUTION_PLAYBOOK.md`.
2. Build dependency-aware slices in milestone order from `INTEGRATION_MILESTONES_AND_DEPENDENCIES.md`.
3. For each slice, require:
  - required contracts listed
  - deterministic behavior boundaries
  - acceptance checks and test evidence
4. No slice is complete until QA evidence exists.
5. No visual/audio update is accepted unless Designer Supervisor credibility gate passes.

## Non-Negotiable Constraints

- Never bypass `PlatformClient` boundary with direct frontend DB calls.
- Never mutate mission truth in frontend-only state.
- Never violate tenant isolation or append-only event policy.
- Never present partial voice transcript as confirmed evaluation.
- Never claim completion without deterministic test evidence.

## Delivery Standard

- Produce implementation that passes contract parity, deterministic replay/idempotency behavior, and auditability checks.
- Keep artifacts traceable: each major decision references contract docs and mission slice IDs.

