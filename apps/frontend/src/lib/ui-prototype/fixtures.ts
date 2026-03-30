import type { AvailableScenariosResponse, ScenarioCard, TrackerSummaryResponse } from '@ti-training/shared';
import { TrackerSummaryResponseSchema } from '@ti-training/shared';
import { createMockProfileMetrics } from '@/lib/ui-prototype/mockProfileMetrics';
import { z } from 'zod';

export function getMockTrackerSummary(): TrackerSummaryResponse {
  const parsed = TrackerSummaryResponseSchema.safeParse({
    levelBand: 2,
    profileMetrics: createMockProfileMetrics({
      totalXP: 1240,
      labels: ['Executive clarity', 'Data discipline'],
    }),
    recentEvidence: [
      {
        eventId: 'ev-1',
        tenantId: 'tenant-demo',
        timestamp: '2026-03-27T14:02:00.000Z',
        profileHash: 'profile-hash-demo',
        sessionId: 'sess-demo-1',
        nodeId: 'node-open-1',
        turnId: 2,
        correlationId: 'corr-1',
        eventType: 'EVALUATION_COMPLETED',
        scenarioId: 'scenario-1',
        awardedScore: 82,
        rawScore: 0.82,
        rawScale: 'zero_to_one',
        demonstrated: true,
        feedbackText: 'Strong BLUF; clarify comp band source attribution.',
        promptVersion: 'pv-1',
        scoringVersion: 'sv-1',
        scoringRationaleVersion: 'srv-1',
        retryAttempted: false,
      },
      {
        eventId: 'ev-2',
        tenantId: 'tenant-demo',
        timestamp: '2026-03-26T09:15:00.000Z',
        profileHash: 'profile-hash-demo',
        sessionId: 'sess-demo-0',
        nodeId: 'n1',
        turnId: 0,
        correlationId: 'corr-0',
        eventType: 'MISSION_COMPLETED',
        scenarioId: 'scenario-1',
        xpDelta: 150,
      },
    ],
  });
  if (!parsed.success) {
    throw new Error(`MOCK_TRACKER_FIXTURE_INVALID: ${JSON.stringify(parsed.error.flatten())}`);
  }
  return parsed.data;
}

export const MOCK_SCENARIO_CARDS: readonly ScenarioCard[] = [
  {
    scenarioId: 'scenario-1',
    label: 'NDA Pressure Readout (CHRO) — Mission 1',
    enabled: true,
    featured: true,
    pushRank: 1,
  },
  {
    scenarioId: 'scenario-1-exec-shock',
    label: 'Exec Escalation Hot Seat (CFO) — Mission 1B',
    enabled: true,
    featured: true,
    pushRank: 2,
  },
];

export function getMockAvailableScenarios(): AvailableScenariosResponse {
  return { scenarios: [...MOCK_SCENARIO_CARDS] };
}

const adminOverviewSchema = z.object({
  tenantId: z.string(),
  totalEvents: z.number().int().nonnegative(),
  byType: z.record(z.string(), z.number().int().nonnegative()),
});

export type MockAdminOverview = z.infer<typeof adminOverviewSchema>;

export function getMockAdminOverview(): MockAdminOverview {
  return adminOverviewSchema.parse({
    tenantId: 'tenant-demo',
    totalEvents: 428,
    byType: {
      EVALUATION_COMPLETED: 190,
      MISSION_COMPLETED: 64,
      MENTOR_INVOKED: 102,
      TELEMETRY_INGESTED: 72,
    },
  });
}

export function getMockAdminCohorts(): { cohorts: Array<{ profileHash: string; eventCount: number }> } {
  return {
    cohorts: [
      { profileHash: 'cohort-a-hash', eventCount: 210 },
      { profileHash: 'cohort-b-hash', eventCount: 128 },
    ],
  };
}
