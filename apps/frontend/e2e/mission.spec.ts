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

const startResponse = {
  missionState: {
    sessionId: 'session-1',
    currentNode: {
      nodeId: 'node-1',
      type: 'open_input',
      sceneText: 'Initial open-input challenge',
      openInputConfig: {
        targetCompetencies: ['ti_data_integrity'],
        evaluationPrompt: 'Evaluate',
      },
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
  },
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/missions/start', async (route) => {
    await route.fulfill({ status: 200, body: JSON.stringify(startResponse) });
  });
});

test('starts mission from scenario selection', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('scenario-card').click();
  await expect(page.getByTestId('scene-text')).toHaveText('Initial open-input challenge');
});

test('open-input success advances the scene', async ({ page }) => {
  await page.route('**/api/missions/decision', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        missionState: {
          ...startResponse.missionState,
          currentNode: {
            nodeId: 'node-2',
            type: 'branching',
            sceneText: 'Branching challenge',
          },
          isTerminal: false,
        },
      }),
    });
  });
  await page.goto('/');
  await page.getByTestId('scenario-card').click();
  await page.getByTestId('open-input').fill('A clear BLUF answer.');
  await page.getByTestId('submit-button').click();
  await expect(page.getByTestId('scene-text')).toHaveText('Branching challenge');
  await expect(page.getByTestId('error-banner')).toHaveCount(0);
});

test('invalid evaluation contract shows retry-safe error and no advance', async ({ page }) => {
  await page.route('**/api/missions/decision', async (route) => {
    await route.fulfill({
      status: 422,
      body: JSON.stringify({
        code: 'EVAL_JSON_INVALID',
        message: 'We could not evaluate that turn',
        requestId: 'r-1',
      }),
    });
  });
  await page.goto('/');
  await page.getByTestId('scenario-card').click();
  await page.getByTestId('open-input').fill('My answer');
  await page.getByTestId('submit-button').click();
  await expect(page.getByTestId('error-banner')).toBeVisible();
  await expect(page.getByTestId('scene-text')).toHaveText('Initial open-input challenge');
});

test('mentor invocation does not advance node', async ({ page }) => {
  await page.route('**/api/missions/mentor', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        missionState: startResponse.missionState,
        mentorHint: { message: 'Mentor hint message' },
      }),
    });
  });
  await page.goto('/');
  await page.getByTestId('scenario-card').click();
  await page.getByTestId('mentor-button').click();
  await expect(page.getByTestId('scene-text')).toHaveText('Initial open-input challenge');
  await expect(page.getByTestId('mentor-hint-region')).toContainText('Mentor hint message');
});

test('terminal mission renders dossier section', async ({ page }) => {
  await page.route('**/api/missions/decision', async (route) => {
    await route.fulfill({
      status: 200,
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
  await page.getByTestId('open-input').fill('terminal answer');
  await page.getByTestId('submit-button').click();
  await expect(page.getByTestId('terminal-dossier')).toBeVisible();
});

test('idempotent replay keeps consistent state', async ({ page }) => {
  await page.route('**/api/missions/decision', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        missionState: {
          ...startResponse.missionState,
          currentNode: {
            nodeId: 'node-2',
            type: 'branching',
            sceneText: 'Replay-safe scene',
          },
          isTerminal: false,
        },
      }),
    });
  });
  await page.goto('/');
  await page.getByTestId('scenario-card').click();
  await page.getByTestId('open-input').fill('repeat');
  await page.getByTestId('submit-button').click();
  await expect(page.getByTestId('scene-text')).toHaveText('Replay-safe scene');
  await page.getByTestId('choice-option-a').click();
  await expect(page.getByTestId('scene-text')).toHaveText('Replay-safe scene');
});
