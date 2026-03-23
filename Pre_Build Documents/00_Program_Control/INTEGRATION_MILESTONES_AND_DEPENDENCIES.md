# Integration Milestones and Dependencies

## Milestone 0: Contract Lock
- Lock API, state machine, tenancy, and event immutability contracts.
- Exit criteria: contract owners sign off with no unresolved schema conflicts.

## Milestone 1: Core Runtime Foundations
- Backend API Lead implements mission start/decision contracts and idempotency behavior.
- Data Governance Lead enforces tenant partitioning and append-only events.
- Runtime Spec Lead validates mission/social/voice boundary behavior contracts.
- Exit criteria: deterministic backend integration tests pass.

## Milestone 2: UX and Design Integration
- UX/Scenario Lead maps UI flows to `MissionState`-only rendering rules.
- Designer team provides HUD, microcopy, ambience, and voice UI state artifacts.
- Exit criteria: credibility gate passes and no UI implies backend outcomes prematurely.

## Milestone 3: Admin/Tracker and Observability
- Backend + Data leads finalize admin/tracker data surfaces.
- Infra Lead wires observability, error budgets, and timeout/cost guardrails.
- Security Lead validates no cross-tenant leakage and no secrets on client.
- Exit criteria: traceable event-to-admin mapping and log/alert baselines complete.

## Milestone 4: QA Certification
- QA Lead runs deterministic E2E suite with approved `page.route` mocks.
- Evaluate replay/idempotency, terminal states, auth errors, timeouts, and voice turn boundaries.
- Exit criteria: all critical flows pass with evidence artifacts attached.

## Dependency Graph (High-Level)
1. API + state machine contracts
2. Data governance contracts
3. Runtime + voice contracts
4. UX/design integration
5. Testing/observability hardening
6. Final integration signoff
