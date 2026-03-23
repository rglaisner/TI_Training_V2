# Agent Sub-Mission Template

## 1) Mission Identity
- `agentId`:
- `agentRole`:
- `missionTitle`:

## 2) Problem Statement
Explain the business/experience risk this mission resolves and the user-facing outcome expected.

## 3) Scope and Accountabilities
- In scope:
- Out of scope:
- Decision rights:

## 4) Dependencies
- Upstream artifact dependencies:
- Team dependencies:

## 5) Required Contracts (Must Match Exactly)
- Contract docs:
- Required payload/schema surfaces:
- Invariants that cannot be broken:

## 6) Interaction Model
- Inputs received:
- Outputs produced:
- Handoff recipients:
- Conflict escalation path (always via Dev Supervisor):

## 7) Implementation Blueprint
- Deterministic logic boundaries:
- LLM-permitted boundaries:
- Data and state mutation rules:

## 8) Acceptance Checks (Definition of Done)
- Contract-level:
- Integration-level:
- Auditability-level:

## 9) Test Evidence Required
- Unit:
- Integration:
- E2E (`page.route` mocking boundaries):

## 10) Explicit Edge Cases
- Invalid input/auth
- Replay/idempotency
- Terminal session behavior
- Timeout/fallback behavior

## 11) Deliverables
- Primary artifacts:
- Update log:
- Residual risks:
