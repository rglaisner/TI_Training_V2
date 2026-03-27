# QA Persona Matrix (2026-03-27)

## Scope

- Test file: `apps/frontend/e2e/mission.spec.ts`
- Objective: validate persona journey behavior in mocked mode and staging mode.

## Runs Executed

1. Mocked run:
  - Command: `npm --workspace @ti-training/frontend run test:e2e`
  - Result: `7 passed`, `2 skipped`, `0 failed`
2. Staging run (without explicit API base URL):
  - Command: `$env:E2E_TARGET='staging'; npm --workspace @ti-training/frontend run test:e2e`
  - Result: `0 passed`, `7 skipped`, `2 failed`
  - Failure pattern: UI did not reach expected staged selectors (`scene-text`, `choice-route_legal_first`) because backend base URL was not explicitly wired for this run.
3. Staging run (with explicit Render API base URL):
  - Command: `$env:E2E_TARGET='staging'; $env:E2E_API_BASE_URL='https://ti-training-api.onrender.com'; npm --workspace @ti-training/frontend run test:e2e`
  - Result: `2 passed`, `7 skipped`, `0 failed`

## Pass/Skip/Fail Matrix


| Persona test                                                                    | Mocked | Staging (no API URL) | Staging (Render API URL) | Notes                                                               |
| ------------------------------------------------------------------------------- | ------ | -------------------- | ------------------------ | ------------------------------------------------------------------- |
| starts mission from scenario selection                                          | PASS   | SKIP                 | SKIP                     | Mocked-only test by design                                          |
| branching choice then open-input advances the scene                             | PASS   | SKIP                 | SKIP                     | Mocked-only test by design                                          |
| invalid evaluation contract shows retry-safe error and no advance on open input | PASS   | SKIP                 | SKIP                     | Mocked-only negative-path contract test                             |
| mentor invocation does not advance node                                         | PASS   | SKIP                 | SKIP                     | Mocked-only mentor control test                                     |
| terminal mission renders dossier section                                        | PASS   | SKIP                 | SKIP                     | Mocked-only terminal rendering test                                 |
| after branching, open-input step shows textarea not branching buttons           | PASS   | SKIP                 | SKIP                     | Mocked-only node-type gating test                                   |
| voice transcript mode requires confirmation before scoring                      | PASS   | SKIP                 | SKIP                     | Mocked-only voice transcript gating test                            |
| start mission renders first node HUD (staging backend)                          | SKIP   | FAIL                 | PASS                     | Fails without explicit staging API base URL; passes with Render URL |
| branching -> open input -> terminal dossier via real API                        | SKIP   | FAIL                 | PASS                     | Same root cause as above; passes with Render URL                    |


## Artifacts

- Playwright output root: `apps/frontend/test-results`
- Last run status file: `apps/frontend/test-results/.last-run.json`
- Persona snapshots and JSON evidence are generated per test in run-specific folders under `apps/frontend/test-results`.

## Assessment

- Mocked persona coverage is stable and passing.
- Staging validation is passing when executed with explicit `E2E_API_BASE_URL` wiring.
- Reliability caveat: staging command should always include explicit backend URL in CI/manual runbooks to avoid false negatives.

## Post-fix Revalidation (same day)

- Command chain:
  - `$env:E2E_TARGET='mocked'; $env:E2E_API_BASE_URL=''; npm --workspace @ti-training/frontend run test:e2e`
  - `$env:E2E_TARGET='staging'; $env:E2E_API_BASE_URL='https://ti-training-api.onrender.com'; npm --workspace @ti-training/frontend run test:e2e`
- Results:
  - Mocked: `7 passed`, `2 skipped`, `0 failed`
  - Staging: `2 passed`, `7 skipped`, `0 failed`
- Conclusion: UX fix batch did not regress persona flows in either execution mode.

## Extension Sprint Revalidation (Gate Closure)

- Backend quality commands:
  - `npm --workspace @ti-training/backend run typecheck`
  - `npm --workspace @ti-training/backend run test`
- Backend result:
  - `typecheck`: pass
  - `vitest`: `12 passed`, `1 skipped`, `0 failed`
- Persona command chain:
  - `$env:E2E_TARGET='mocked'; $env:E2E_API_BASE_URL=''; npm --workspace @ti-training/frontend run test:e2e`
  - `$env:E2E_TARGET='staging'; $env:E2E_API_BASE_URL='https://ti-training-api.onrender.com'; npm --workspace @ti-training/frontend run test:e2e`
- Persona results:
  - Mocked: `7 passed`, `2 skipped`, `0 failed`
  - Staging: `2 passed`, `7 skipped`, `0 failed`
- Reliability note:
  - One staging flake was observed during sprint execution (disabled second-step submit state); test flow was stabilized by waiting for editable state before second submission.

