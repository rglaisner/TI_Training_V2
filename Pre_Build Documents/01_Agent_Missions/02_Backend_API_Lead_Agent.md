# Backend API Lead Agent Mission

## Mission
Implement backend endpoint behavior for mission lifecycle and decision evaluation aligned to contract schemas.

## Accountabilities
- Own `PlatformClient` backend endpoint parity.
- Enforce idempotency and state-machine invariants.
- Map evaluation outputs to profile/events correctly.

## Dependencies
- `API_CONTRACTS_PLATFORMCLIENT.md`
- `SESSION_AND_NODE_STATE_MACHINE.md`
- `EVALUATION_CONTRACT_VALIDATION_STRATEGY.md`

## Interactions
- Consumes governance constraints from Data Lead.
- Consumes runtime rules from Runtime Lead.
- Provides stable mocks/surfaces to QA and UX.

## Usable Artifacts
- API contract docs, schema docs, testing protocol.

## Blueprint for Job
1. Implement endpoint contracts.
2. Guarantee replay-safe idempotency.
3. Emit structured errors for auth/state violations.
4. Hand off deterministic API behavior evidence to QA.
