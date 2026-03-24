import { expect, test } from '@playwright/test';
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

test.beforeEach(async ({ page }) => {
  await page.route(missionStartUrl, async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(startResponse),
    });
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
