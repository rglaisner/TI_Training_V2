import { expect, test } from '@playwright/test';
import type { Page, TestInfo } from '@playwright/test';
import fs from 'node:fs/promises';

const useStaging = process.env.E2E_TARGET === 'staging';

/** Phase 2 UI runs mock missions on /office/desk and /missions — staging backend tests disabled until integration. */
const STAGING_E2E_DISABLED_FOR_UI_PROTOTYPE = true;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type PersonaArtifact = {
  persona: string;
  expectedUXChecks: string[];
  selectorsToInspect: string[];
  suggestedUiChanges: string[];
};

function artifactForTestTitle(testTitle: string): PersonaArtifact {
  if (testTitle.includes('starts mission')) {
    return {
      persona: 'Learner - First entry',
      expectedUXChecks: ['Scenario cards visible', 'Click starts mission without refresh'],
      selectorsToInspect: ['[data-testid="scenario-card"]', '[data-testid="scene-text"]'],
      suggestedUiChanges: [
        'If scenario cards feel unclear: improve microcopy + grouping (story arc/level band).',
        'If start button is ambiguous: add “featured” label and explicit outcome text.',
      ],
    };
  }
  if (testTitle.includes('branching choice then open-input')) {
    return {
      persona: 'Learner - Legal-first flow',
      expectedUXChecks: [
        'Branching choices visible',
        'Open-input appears for the next node type',
        'No error banner on a valid turn',
      ],
      selectorsToInspect: ['[data-testid^="choice-"]', '[data-testid="open-input"]', '[data-testid="error-banner"]'],
      suggestedUiChanges: [
        'If node transitions feel laggy: show stronger “processing” status and keep HUD stable.',
        'If choice labels feel too similar: increase spacing/contrast and add subtle category tags.',
      ],
    };
  }
  if (testTitle.includes('invalid evaluation contract')) {
    return {
      persona: 'Learner - Retry after scoring failure',
      expectedUXChecks: ['Error banner appears', 'Scene does not advance until success'],
      selectorsToInspect: ['[data-testid="error-banner"]', '[data-testid="scene-text"]'],
      suggestedUiChanges: [
        'If recovery feels harsh: soften error copy while staying precise about “scene did not move”.',
        'If user retries blindly: add “Try again” guidance near submit-button.',
      ],
    };
  }
  if (testTitle.includes('mentor invocation')) {
    return {
      persona: 'Learner - Mentor assist',
      expectedUXChecks: ['Mentor hint appears', 'Scene does not advance'],
      selectorsToInspect: ['[data-testid="mentor-button"]', '[data-testid="mentor-hint-region"]', '[data-testid="scene-text"]'],
      suggestedUiChanges: [
        'If mentor feels too “long”: constrain answer length + tone in microcopy.',
        'If mentor interrupts clarity: show a short “node unchanged” status line.',
      ],
    };
  }
  if (testTitle.includes('terminal mission renders')) {
    return {
      persona: 'Learner - Completion review',
      expectedUXChecks: ['Terminal dossier visible', 'XP/competency summaries readable'],
      selectorsToInspect: ['[data-testid="terminal-dossier"]', '[data-testid="terminal-competencies"]', '[data-testid="terminal-labels"]'],
      suggestedUiChanges: [
        'If dossier feels overwhelming: limit to top competencies + progressive disclosure.',
        'If trust is low: add “derived from profile signals” microcopy to avoid implying evidence replay.',
      ],
    };
  }
  if (testTitle.includes('after branching, open-input step')) {
    return {
      persona: 'Learner - UI gating by node type',
      expectedUXChecks: ['Branching buttons disappear on open-input nodes'],
      selectorsToInspect: ['[data-testid="open-input"]', '[data-testid^="choice-"]'],
      suggestedUiChanges: ['If gating is unclear: add short helper text “Input is now the next required step”.'],
    };
  }
  if (testTitle.includes('voice transcript mode')) {
    return {
      persona: 'Learner - Voice transcript gating',
      expectedUXChecks: [
        'Submit disabled until transcript is confirmed',
        'Confirmed transcript populates open-input',
        'Terminal dossier renders after submission',
      ],
      selectorsToInspect: [
        '[data-testid="voice-mode-toggle"]',
        '[data-testid="voice-transcript-partial"]',
        '[data-testid="voice-confirm-transcript"]',
        '[data-testid="submit-button"]',
        '[data-testid="terminal-dossier"]',
      ],
      suggestedUiChanges: [
        'If learners miss the confirm step: use louder copy + inline state badge.',
        'If transcript confirmation is confusing: show “confirmed version used for scoring” label.',
      ],
    };
  }

  return {
    persona: 'Learner - Unknown persona',
    expectedUXChecks: [],
    selectorsToInspect: [],
    suggestedUiChanges: [],
  };
}

async function writePersonaRunArtifacts(params: {
  testInfo: TestInfo;
  page: Page;
  artifactName: string;
  artifact: PersonaArtifact;
}) {
  const { testInfo, page, artifactName, artifact } = params;

  const jsonPath = testInfo.outputPath(`${artifactName}.json`);
  const pngPath = testInfo.outputPath(`${artifactName}.png`);

  await fs.writeFile(
    jsonPath,
    JSON.stringify(
      {
        persona: artifact.persona,
        testTitle: testInfo.title,
        status: testInfo.status ?? 'unknown',
        generatedAt: new Date().toISOString(),
        expectedUXChecks: artifact.expectedUXChecks,
        selectorsToInspect: artifact.selectorsToInspect,
        suggestedUiChanges: artifact.suggestedUiChanges,
      },
      null,
      2,
    ),
    'utf-8',
  );

  await page.screenshot({ path: pngPath, fullPage: true });
}

async function signInDemoLearner(page: Page): Promise<void> {
  await page.getByTestId('prototype-signin-learner').click();
}

test.describe('Learner personas (mocked API)', () => {
  test.beforeEach(() => {
    if (useStaging) {
      test.skip(true, 'Mocked mode only. Set E2E_TARGET=staging to run staging tests.');
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    const artifact = artifactForTestTitle(testInfo.title);
    const artifactName = `${useStaging ? 'staging' : 'mocked'}-${slugify(testInfo.title)}`;
    await writePersonaRunArtifacts({
      testInfo,
      page,
      artifactName,
      artifact,
    });
  });

  test('starts mission from scenario selection', async ({ page }) => {
    await page.goto('/office/desk');
    await signInDemoLearner(page);
    await expect(page.getByTestId('environment-status-chip')).toBeVisible();
    await page.getByTestId('scenario-card').first().click();
    await expect(page.getByTestId('scene-text')).toContainText('Northbridge Labs');
  });

  test('first-run orientation can be dismissed and session outcome lines are visible', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('ti.prototype.orientation.dismissed');
    });
    await page.goto('/office/desk');
    await signInDemoLearner(page);
    await expect(page.getByTestId('first-run-orientation')).toBeVisible();
    await expect(page.getByTestId('first-session-outcome-line')).toHaveCount(3);
    await page.getByTestId('orientation-continue').click();
    await expect(page.getByTestId('first-run-orientation')).toHaveCount(0);
  });

  test('scenario list includes a second featured variant card', async ({ page }) => {
    await page.goto('/office/desk');
    await signInDemoLearner(page);
    await expect(page.getByTestId('scenario-card')).toHaveCount(2);
  });

  test('in-mission locks consumer shell nav and offers cancel', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('ti.prototype.orientation.dismissed', 'true');
    });
    await page.goto('/missions');
    await signInDemoLearner(page);
    await page.getByTestId('scenario-card').first().click();
    await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Mission in progress' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Progress' })).toHaveCount(0);
    await expect(page.getByTestId('mission-cancel-open')).toHaveCount(1);
  });

  test('in-mission on desk hides progress link and shows cancel strip', async ({ page }) => {
    await page.goto('/office/desk');
    await signInDemoLearner(page);
    await page.getByTestId('scenario-card').first().click();
    await expect(page.getByTestId('mission-in-progress-strip')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Progress' })).toHaveCount(0);
    await expect(page.getByTestId('mission-cancel-open')).toHaveCount(1);
  });

  test('cancel mission confirm returns to scenario list', async ({ page }) => {
    await page.goto('/office/desk');
    await signInDemoLearner(page);
    await page.getByTestId('scenario-card').first().click();
    await page.getByTestId('mission-cancel-open').click();
    await page.getByTestId('mission-cancel-confirm').click();
    await expect(page.getByTestId('scenario-card-list')).toBeVisible();
    await expect(page.getByTestId('scene-text')).toHaveCount(0);
  });

  test('branching choice then open-input advances the scene', async ({ page }) => {
    await page.goto('/office/desk');
    await signInDemoLearner(page);
    await page.getByTestId('scenario-card').first().click();
    await page.getByTestId('choice-route_legal_first').click();
    await expect(page.getByTestId('scene-text')).toHaveText(
      'Legal replies: tighten your note before the CHRO readout.',
    );
    await expect(page.getByTestId('error-banner')).toHaveCount(0);
  });

  test('invalid evaluation contract shows retry-safe error and no advance on open input', async ({ page }) => {
    await page.goto('/office/desk');
    await signInDemoLearner(page);
    await page.getByTestId('scenario-card').first().click();
    await page.getByTestId('choice-route_legal_first').click();
    await page.getByTestId('open-input').fill('My answer');
    await page.evaluate(() => {
      document.body.dataset.tiPrototypeSimulateOpenInput422 = '1';
    });
    await page.getByTestId('submit-button').click();
    await expect(page.getByTestId('error-banner')).toBeVisible();
    await expect(page.getByTestId('scene-text')).toHaveText(
      'Legal replies: tighten your note before the CHRO readout.',
    );
  });

  test('mentor invocation does not advance node', async ({ page }) => {
    await page.goto('/office/desk');
    await signInDemoLearner(page);
    await page.getByTestId('scenario-card').first().click();
    await page.getByTestId('mentor-button').click();
    await expect(page.getByTestId('scene-text')).toContainText('Northbridge Labs');
    await expect(page.getByTestId('mentor-hint-region')).toContainText('Mentor hint message');
  });

  test('terminal mission renders dossier section', async ({ page }) => {
    await page.goto('/office/desk');
    await signInDemoLearner(page);
    await page.getByTestId('scenario-card').first().click();
    await page.getByTestId('choice-route_legal_first').click();
    await page.getByTestId('open-input').fill('terminal answer');
    await page.getByTestId('submit-button').click();
    await expect(page.getByTestId('terminal-dossier')).toBeVisible();
    await expect(page.getByTestId('last-evaluation')).toContainText(/Score/i);
    await expect(page.getByTestId('social-region')).toHaveCount(0);
    await expect(page.getByTestId('coworker-informal-exchange')).toHaveCount(0);
  });

  test('after branching, open-input step shows textarea not branching buttons', async ({ page }) => {
    await page.goto('/office/desk');
    await signInDemoLearner(page);
    await page.getByTestId('scenario-card').first().click();
    await page.getByTestId('choice-route_legal_first').click();
    await expect(page.getByTestId('open-input')).toBeVisible();
    await expect(page.getByTestId('choice-route_legal_first')).toHaveCount(0);
  });

  test('voice transcript mode requires confirmation before scoring', async ({ page }) => {
    const partial = 'draft transcript (partial)';
    const confirmed = 'confirmed transcript (scoring-safe)';

    await page.goto('/office/desk');
    await signInDemoLearner(page);
    await page.getByTestId('scenario-card').first().click();
    await page.getByTestId('choice-route_legal_first').click();

    await expect(page.getByTestId('open-input')).toBeVisible();
    await expect(page.getByTestId('mission-timer')).toBeVisible();

    const voiceToggle = page.getByTestId('voice-mode-toggle');
    await voiceToggle.check();
    await expect(page.getByTestId('submit-button')).toBeDisabled();

    await page.getByTestId('voice-transcript-partial').fill(partial);
    await expect(page.getByTestId('submit-button')).toBeDisabled();

    await page.getByTestId('voice-transcript-partial').fill(confirmed);
    await page.getByTestId('voice-confirm-transcript').click();
    await expect(page.getByTestId('submit-button')).toBeEnabled();
    await expect(page.getByTestId('open-input')).toHaveValue(confirmed);

    await page.getByTestId('submit-button').click();
    await expect(page.getByTestId('terminal-dossier')).toBeVisible();
  });
});

test.describe('Learner personas (staging backend)', () => {
  test.describe.configure({ timeout: 120_000 });

  let stagingPreflightResolved = false;
  let stagingPreflightSkipReason: string | null = null;

  test.beforeEach(async ({ page }) => {
    if (!useStaging) {
      test.skip(true, 'Staging mode only. Set E2E_TARGET=staging to run.');
    }

    if (STAGING_E2E_DISABLED_FOR_UI_PROTOTYPE) {
      test.skip(
        true,
        'Phase 2 UI prototype: desk uses mock mission store. Re-enable when PlatformClient is wired post chunk approval.',
      );
    }

    const apiBaseUrlRaw = process.env.E2E_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
    const apiBaseUrl =
      typeof apiBaseUrlRaw === 'string' && apiBaseUrlRaw.trim().length > 0 ? apiBaseUrlRaw : '';

    // Preflight: if the staging backend requires Firebase auth (no test-auth escape hatch),
    // we skip instead of timing out on UI selectors.
    if (stagingPreflightResolved) {
      if (stagingPreflightSkipReason) {
        test.skip(true, stagingPreflightSkipReason);
      }
      return;
    }

    if (!apiBaseUrl) {
      stagingPreflightResolved = true;
      return;
    }

    {
      const tenantId = process.env.NEXT_PUBLIC_TEST_TENANT_ID ?? 'e2e-tenant';
      const userId = process.env.NEXT_PUBLIC_TEST_USER_ID ?? 'e2e-user';
      const role =
        process.env.NEXT_PUBLIC_TEST_ROLE === 'tenant_admin' ? 'tenant_admin' : 'tenant_user';

      try {
        const resp = await page.request.post(`${apiBaseUrl}/api/missions/start`, {
          data: { scenarioId: 'scenario-1' },
          headers: {
            'content-type': 'application/json',
            'x-tenant-id': tenantId,
            'x-user-id': userId,
            'x-role': role,
          },
          // If the backend is down/sluggish, skip rather than failing the entire suite.
          timeout: 60_000,
        });

        if (resp.status() === 401) {
          const payload = (await resp.json().catch(() => undefined)) as
            | { code?: string; message?: string }
            | undefined;
          if (
            payload?.code === 'UNAUTHORIZED' ||
            payload?.message === 'Authorization token is required'
          ) {
            stagingPreflightSkipReason =
              'Staging backend requires Firebase Authorization; test auth headers are not accepted.';
          }
        }
      } catch (error: unknown) {
        // Network/timeouts: still run the UI tests. The UI assertions will determine
        // whether the backend is reachable and whether we get the expected nodes.
      } finally {
        stagingPreflightResolved = true;
        if (stagingPreflightSkipReason) {
          test.skip(true, stagingPreflightSkipReason);
        }
      }
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    const artifact = artifactForTestTitle(testInfo.title);
    const artifactName = `staging-${slugify(testInfo.title)}`;
    await writePersonaRunArtifacts({
      testInfo,
      page,
      artifactName,
      artifact,
    });
  });

  test('start mission renders first node HUD', async ({ page }) => {
    await page.goto('/office/desk');
    await page.getByTestId('scenario-card').first().click();
    await expect(page.getByTestId('scene-text')).toBeVisible({ timeout: 60_000 });
  });

  test('branching -> open input -> terminal dossier via real API', async ({ page }) => {
    const scenarioCard = page.getByTestId('scenario-card').first();
    const choiceLegalFirst = page.getByTestId('choice-route_legal_first');
    const openInput = page.getByTestId('open-input');
    const submitButton = page.getByTestId('submit-button');
    const terminalDossier = page.getByTestId('terminal-dossier');
    const missionTimer = page.getByTestId('mission-timer');

    // If the backend advanced the session without the UI updating, repeating clicks within the same
    // session can produce stale `nodeId` errors. For staging reliability, restart the mission
    // session (full reload) and try again.
    let lastError: unknown = null;
    for (let missionAttempt = 1; missionAttempt <= 2; missionAttempt += 1) {
      await page.goto('/office/desk');
      await scenarioCard.click();
      await expect(choiceLegalFirst).toBeVisible({ timeout: 60_000 });

      await choiceLegalFirst.click();
      await expect(openInput).toBeVisible({ timeout: 60_000 });
      await expect(missionTimer).toBeVisible({ timeout: 60_000 });

      // Open-input beat 1.
      await openInput.fill('Staging answer 1');
      await submitButton.click();
      await expect(openInput).toBeVisible({ timeout: 60_000 });
      await expect(openInput).toBeEditable({ timeout: 60_000 });

      // Open-input beat 2 -> terminal dossier.
      await openInput.fill('Staging answer 2');
      await expect(submitButton).toBeEnabled({ timeout: 60_000 });
      await submitButton.click();

      try {
        await expect(terminalDossier).toBeVisible({ timeout: 90_000 });
        return;
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError ?? new Error('Failed to complete mission via real API after session restarts.');
  });
});
