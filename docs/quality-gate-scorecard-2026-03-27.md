# Quality Gate Scorecard (2026-03-27)

## Scoring Method

- Scale per gate: `0-5`
- Pass threshold per gate: `>=4`
- Critical gates: `evaluation-credibility`, `stability-trust`
- Overall Go rule: all gates pass and no critical gate below threshold.

## Gate Results

| Gate | Threshold | Score | Result | Evidence |
| --- | --- | --- | --- | --- |
| immersion-clarity | >=4 | 4 | PASS | Mission HUD now displays explicit objective copy and variant context (`objective-text`, `run-variant`), reducing ambiguity in “what to do now.” |
| branch-consequence | >=4 | 4 | PASS | Scenario catalog has three distinct initial routes (`node-open-legal`, `node-open-pragmatic`, `node-open-huddle`) before shared pressure node. |
| mentor-usefulness | >=4 | 4 | PASS | Mentor generator now returns context-aware, actionable bullets tied to scene/challenge/user input and explicit boundary guidance. |
| evaluation-credibility (critical) | >=4 | 4 | PASS | Deterministic fallback replaced with rubric-feature scoring (decision clarity, evidence, boundary/risk, stakeholder action, rubric alignment) and actionable feedback. |
| stability-trust (critical) | >=4 | 4 | PASS | Backend typecheck/tests pass and persona suites pass in mocked + staging (explicit API URL), with flaky staging step stabilized. |

## Outcome

- **Overall status: GO**
- Rationale: all gates meet threshold, including both critical gates.

## Immediate Focus After Gate Closure

1. Continue tracking evaluator and mentor quality on real pilot transcripts.
2. Keep staging command wiring explicit in runbooks (`E2E_API_BASE_URL`) to avoid false negatives.
3. Monitor staging for intermittent state timing issues and keep e2e waits aligned to editable/submit-ready UI state.

