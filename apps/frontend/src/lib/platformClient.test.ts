import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tiCompetencyValues } from '@ti-training/shared';

vi.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: null,
  }),
}));

import { PlatformClient, PlatformClientError } from './platformClient';

describe('PlatformClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('parses start mission response with shared schema', async () => {
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

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        text: async () =>
          JSON.stringify({
            missionState: {
              sessionId: 's1',
              currentNode: {
                nodeId: 'node-1',
                type: 'open_input',
                sceneText: 'Scene',
                openInputConfig: {
                  targetCompetencies: ['ti_data_integrity'],
                  evaluationPrompt: 'Prompt',
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
                competencies: {
                  ...competencies,
                },
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
          }),
      })) as unknown as typeof fetch,
    );

    await expect(
      PlatformClient.startMission({ scenarioId: 'scenario-1' }),
    ).resolves.toMatchObject({
      sessionId: 's1',
    });
  });

  it('sends test auth headers when NEXT_PUBLIC_USE_TEST_AUTH is true', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_TEST_AUTH', 'true');
    vi.stubEnv('NEXT_PUBLIC_TEST_TENANT_ID', 'acme');
    vi.stubEnv('NEXT_PUBLIC_TEST_USER_ID', 'alice');

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

    const fetchMock = vi.fn(async () => ({
      ok: true,
      text: async () =>
        JSON.stringify({
          missionState: {
            sessionId: 's1',
            currentNode: {
              nodeId: 'node-1',
              type: 'open_input',
              sceneText: 'Scene',
              openInputConfig: {
                targetCompetencies: ['ti_data_integrity'],
                evaluationPrompt: 'Prompt',
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
              competencies: { ...competencies },
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
        }),
    }));

    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    await PlatformClient.startMission({ scenarioId: 'scenario-1' });

    expect(fetchMock).toHaveBeenCalled();
    const firstCall = vi.mocked(fetchMock).mock.calls[0] as unknown as
      | [RequestInfo | URL, RequestInit | undefined]
      | undefined;
    const init = firstCall?.[1];
    const h = init?.headers as Record<string, string> | undefined;
    expect(h).toBeDefined();
    expect(h?.['x-tenant-id']).toBe('acme');
    expect(h?.['x-user-id']).toBe('alice');
    expect(h?.['x-role']).toBe('tenant_user');
  });

  it('maps api errors into PlatformClientError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        text: async () =>
          JSON.stringify({
            code: 'INVALID_NODE',
            message: 'node mismatch',
            requestId: 'r1',
          }),
      })) as unknown as typeof fetch,
    );

    await expect(
      PlatformClient.submitDecision({
        sessionId: 's1',
        nodeId: 'n1',
        clientSubmissionId: 'c1',
        openInput: { inputText: 'test' },
      }),
    ).rejects.toBeInstanceOf(PlatformClientError);
  });
});
