import { expect, test } from '@playwright/test';
import type { Page, TestInfo } from '@playwright/test';
import fs from 'node:fs/promises';
import { tiCompetencyValues } from '@ti-training/shared';

const competencies = Object.fromEntries(
  tiCompetencyValues.map((competency) => [
    competency,
    {
      score: 0,
      evaluations: 0,
      lastDemonstrated: new Date(0).toISOString(),
      trend: 'flat',
    },
  ]),
);

/** Playwright matches RegExp against the full request URL (any host/port). */
const missionStartUrl = /\/api\/missions\/start(\?|#|$)/;
const missionDecisionUrl = /\/api\/missions\/decision(\?|#|$)/;
const missionMentorUrl = /\/api\/missions\/mentor(\?|#|$)/;
const scenariosAvailableUrl = /\/api\/scenarios\/available(\?|#|$)/;
const useStaging = process.env.E2E_TARGET === 'staging';

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

const openInputNode2 = {
  nodeId: 'node-open-legal',
  type: 'open_input',
  sceneText: 'Legal replies: tighten your note before the CHRO readout.',
  nextNodeId: 'terminal-1',
  openInputConfig: {
    targetCompetencies: ['ti_data_integrity'],
    evaluationPrompt: 'Evaluate using strict JSON contract.',
  },
};

const startResponse = {
  missionState: {
    sessionId: 'session-1',
    currentNode: {
      nodeId: 'node-1',
      type: 'branching',
      sceneText: 'Northbridge Labs hiring freeze — choose your first move.',
      branchingOptions: [
        {
          choiceKey: 'route_legal_first',
          label: 'Route through Legal first',
          nextNodeId: 'node-open-legal',
        },
        {
          choiceKey: 'route_pragmatic_ship',
          label: 'Ship ranges tonight; align Legal tomorrow',
          nextNodeId: 'node-open-legal',
        },
        {
          choiceKey: 'route_huddle',
          label: 'Force a leadership huddle now',
          nextNodeId: 'node-open-legal',
        },
      ],
    },
    profileMetrics: {
      categoryScores: {
        FOUNDATIONS: 0,
        INFLUENCE: 0,
        STRATEGY: 0,
        CRISIS: 0,
        ETHICS: 0,
        LEADING_AND_MANAGING: 0,
        CREATIVE_AND_CRITICAL_THINKING: 0,
        THOUGHT_LEADERSHIP: 0,
      },
      competencies,
      labelsOfExcellence: [],
      totalXP: 0,
      categoryXP: {
        FOUNDATIONS: 0,
        INFLUENCE: 0,
        STRATEGY: 0,
        CRISIS: 0,
        ETHICS: 0,
        LEADING_AND_MANAGING: 0,
        CREATIVE_AND_CRITICAL_THINKING: 0,
        THOUGHT_LEADERSHIP: 0,
      },
      activeCosmetics: [],
    },
    isTerminal: false,
    runMetadata: { sessionSeed: 42, variantLabel: 'Northbridge • contractor signal +14%' },
  },
};

test.describe('Learner personas (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    if (useStaging) {
      test.skip(true, 'Mocked mode only. Set E2E_TARGET=staging to run staging tests.');
    }
  await page.route(missionStartUrl, async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(startResponse),
    });
  });

  await page.route(scenariosAvailableUrl, async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        scenarios: [
          {
            scenarioId: 'scenario-1',
            label: 'NDA Pressure Readout (CHRO) — Mission 1',
            enabled: true,
            featured: true,
            pushRank: 1,
          },
        ],
      }),
    });
  });
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
  await page.goto('/');
  await page.getByTestId('scenario-card').click();
  await expect(page.getByTestId('scene-text')).toContainText('Northbridge Labs');
  });

  test('branching choice then open-input advances the scene', async ({ page }) => {
  await page.route(missionDecisionUrl, async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        missionState: {
          ...startResponse.missionState,
          currentNode: openInputNode2,
          isTerminal: false,
        },
      }),
    });
  });
  await page.goto('/');
  await page.getByTestId('scenario-card').click();
  await page.getByTestId('choice-route_legal_first').click();
  await expect(page.getByTestId('scene-text')).toHaveText(
    'Legal replies: tighten your note before the CHRO readout.',
  );
  await expect(page.getByTestId('error-banner')).toHaveCount(0);
  });

  test('invalid evaluation contract shows retry-safe error and no advance on open input', async ({ page }) => {
  let decisionCalls = 0;
  await page.route(missionDecisionUrl, async (route) => {
    decisionCalls += 1;
    if (decisionCalls === 1) {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          missionState: {
            ...startResponse.missionState,
            currentNode: openInputNode2,
            isTerminal: false,
          },
        }),
      });
      return;
    }
    await route.fulfill({
      status: 422,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        code: 'EVAL_JSON_INVALID',
        message: 'We could not evaluate that turn',
        requestId: 'r-1',
      }),
    });
  });
  await page.goto('/');
  await page.getByTestId('scenario-card').click();
  await page.getByTestId('choice-route_legal_first').click();
  await page.getByTestId('open-input').fill('My answer');
  await page.getByTestId('submit-button').click();
  await expect(page.getByTestId('error-banner')).toBeVisible();
  await expect(page.getByTestId('scene-text')).toHaveText(
    'Legal replies: tighten your note before the CHRO readout.',
  );
  });

  test('mentor invocation does not advance node', async ({ page }) => {
  await page.route(missionMentorUrl, async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        missionState: startResponse.missionState,
        mentorHint: { message: 'Mentor hint message' },
      }),
    });
  });
  await page.goto('/');
  await page.getByTestId('scenario-card').click();
  await page.getByTestId('mentor-button').click();
  await expect(page.getByTestId('scene-text')).toContainText('Northbridge Labs');
  await expect(page.getByTestId('mentor-hint-region')).toContainText('Mentor hint message');
  });

  test('terminal mission renders dossier section', async ({ page }) => {
  let decisionCalls = 0;
  await page.route(missionDecisionUrl, async (route) => {
    decisionCalls += 1;
    if (decisionCalls === 1) {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          missionState: {
            ...startResponse.missionState,
            currentNode: openInputNode2,
            isTerminal: false,
          },
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        missionState: {
          ...startResponse.missionState,
          currentNode: {
            nodeId: 'terminal-1',
            type: 'branching',
            sceneText: 'Terminal scene',
          },
          isTerminal: true,
        },
      }),
    });
  });
  await page.goto('/');
  await page.getByTestId('scenario-card').click();
  await page.getByTestId('choice-route_legal_first').click();
  await page.getByTestId('open-input').fill('terminal answer');
  await page.getByTestId('submit-button').click();
  await expect(page.getByTestId('terminal-dossier')).toBeVisible();
  });

  test('after branching, open-input step shows textarea not branching buttons', async ({ page }) => {
  await page.route(missionDecisionUrl, async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        missionState: {
          ...startResponse.missionState,
          currentNode: openInputNode2,
          isTerminal: false,
        },
      }),
    });
  });
  await page.goto('/');
  await page.getByTestId('scenario-card').click();
  await page.getByTestId('choice-route_legal_first').click();
  await expect(page.getByTestId('open-input')).toBeVisible();
  await expect(page.getByTestId('choice-route_legal_first')).toHaveCount(0);
  });

  test('voice transcript mode requires confirmation before scoring', async ({ page }) => {
  let decisionCalls = 0;
  const partial = 'draft transcript (partial)';
  const confirmed = 'confirmed transcript (scoring-safe)';

  await page.route(missionDecisionUrl, async (route) => {
    decisionCalls += 1;
    if (decisionCalls === 1) {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          missionState: {
            ...startResponse.missionState,
            currentNode: openInputNode2,
            isTerminal: false,
          },
        }),
      });
      return;
    }

    const body = route.request().postDataJSON() as {
      voice?: { transcriptText?: string };
      openInput?: { inputText?: string };
    };

    expect(body.voice?.transcriptText).toBe(confirmed);
    expect(body.openInput?.inputText).toBe(confirmed);

    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        missionState: {
          ...startResponse.missionState,
          currentNode: {
            nodeId: 'terminal-1',
            type: 'branching',
            sceneText: 'Terminal scene',
          },
          isTerminal: true,
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByTestId('scenario-card').click();
  await page.getByTestId('choice-route_legal_first').click();

  await expect(page.getByTestId('open-input')).toBeVisible();
  await expect(page.getByTestId('mission-timer')).toBeVisible();

  const voiceToggle = page.getByTestId('voice-mode-toggle');
  await voiceToggle.check();
  await expect(page.getByTestId('submit-button')).toBeDisabled();

  await page.getByTestId('voice-transcript-partial').fill(partial);
  await expect(page.getByTestId('submit-button')).toBeDisabled();

  // Confirming transcript should enable scoring and populate the open-input text.
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
    await page.goto('/');
    await page.getByTestId('scenario-card').click();
    await expect(page.getByTestId('scene-text')).toBeVisible({ timeout: 60_000 });
  });

  test('branching -> open input -> terminal dossier via real API', async ({ page }) => {
    const scenarioCard = page.getByTestId('scenario-card');
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
      await page.goto('/');
      await scenarioCard.click();
      await expect(choiceLegalFirst).toBeVisible({ timeout: 60_000 });

      await choiceLegalFirst.click();
      await expect(openInput).toBeVisible({ timeout: 60_000 });
      await expect(missionTimer).toBeVisible({ timeout: 60_000 });

      // Open-input beat 1.
      await openInput.fill('Staging answer 1');
      await submitButton.click();
      await expect(openInput).toBeVisible({ timeout: 60_000 });

      // Open-input beat 2 -> terminal dossier.
      await openInput.fill('Staging answer 2');
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
