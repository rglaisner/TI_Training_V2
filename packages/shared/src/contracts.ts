import { z } from 'zod';

export type TICategory =
  | 'FOUNDATIONS'
  | 'INFLUENCE'
  | 'STRATEGY'
  | 'CRISIS'
  | 'ETHICS'
  | 'LEADING_AND_MANAGING'
  | 'CREATIVE_AND_CRITICAL_THINKING'
  | 'THOUGHT_LEADERSHIP';

export type TICompetency =
  | 'ti_data_integrity'
  | 'ti_stakeholder_mgmt'
  | 'ti_exec_comms'
  | 'ti_osint_humint'
  | 'ti_workforce_planning'
  | 'ti_risk_modeling'
  | 'ti_crisis_triage'
  | 'ti_cross_functional_leadership'
  | 'ti_capability_assessment'
  | 'ti_data_governance_accountability'
  | 'ti_lateral_thinking'
  | 'ti_signal_triangulation'
  | 'ti_org_design'
  | 'ti_strategic_vision'
  | 'ti_opsec_awareness';

export type ProfileTrend = 'up' | 'down' | 'flat';

export interface CompetencyDetail {
  score: number; // 0-100
  evaluations: number;
  lastDemonstrated: string; // ISO timestamp
  trend: ProfileTrend;
}

export interface ProfileMetrics {
  // Serious track (certification)
  categoryScores: Record<TICategory, number>;
  competencies: Record<TICompetency, CompetencyDetail>;
  labelsOfExcellence: string[];

  // Fun track (engagement economy)
  totalXP: number;
  categoryXP: Record<TICategory, number>;
  activeCosmetics: string[];
}

export type NodeType = 'branching' | 'open_input';

export interface NodeOpenInputConfig {
  targetCompetencies: TICompetency[];
  evaluationPrompt: string;
}

export interface NodeContext {
  nodeId: string;
  type: NodeType;
  sceneText: string;
  openInputConfig?: NodeOpenInputConfig;
}

export interface MissionState {
  sessionId: string;
  currentNode: NodeContext;
  profileMetrics: ProfileMetrics;
  isTerminal: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  requestId: string;
  details?: unknown;
}

export interface StartMissionRequest {
  scenarioId: string;
  clientRequestId?: string;
}

export interface StartMissionResponse {
  missionState: MissionState;
  meta?: {
    startedAt: string;
  };
}

export interface DecisionRequest {
  sessionId: string;
  nodeId: string;
  clientSubmissionId: string;
  branchingChoice?: {
    choiceKey: string;
  };
  openInput?: {
    inputText: string;
  };
  voice?: {
    transcriptText?: string;
    turnBoundary?: {
      startedAtMs: number;
      endedAtMs: number;
    };
  };
}

export interface DecisionResponse {
  missionState: MissionState;
  feedback?: {
    npcMessage?: string;
    evaluation?: {
      targetCompetency: TICompetency;
      awardedScore: number; // 0-100
      demonstrated: boolean;
      feedbackText: string;
    };
  };
  meta?: {
    turnId: number;
    evaluatedAt: string;
  };
}

export interface MentorRequest {
  sessionId: string;
  nodeId: string;
  clientSubmissionId: string;
  challengeText?: string;
}

export interface MentorResponse {
  missionState: MissionState;
  mentorHint?: {
    message: string;
  };
  meta?: {
    turnId: number;
    evaluatedAt: string;
  };
}

export const tiCategoryValues = [
  'FOUNDATIONS',
  'INFLUENCE',
  'STRATEGY',
  'CRISIS',
  'ETHICS',
  'LEADING_AND_MANAGING',
  'CREATIVE_AND_CRITICAL_THINKING',
  'THOUGHT_LEADERSHIP',
] as const satisfies readonly TICategory[];

export const tiCompetencyValues = [
  'ti_data_integrity',
  'ti_stakeholder_mgmt',
  'ti_exec_comms',
  'ti_osint_humint',
  'ti_workforce_planning',
  'ti_risk_modeling',
  'ti_crisis_triage',
  'ti_cross_functional_leadership',
  'ti_capability_assessment',
  'ti_data_governance_accountability',
  'ti_lateral_thinking',
  'ti_signal_triangulation',
  'ti_org_design',
  'ti_strategic_vision',
  'ti_opsec_awareness',
] as const satisfies readonly TICompetency[];

export const TiCategorySchema = z.enum(tiCategoryValues);
export const TiCompetencySchema = z.enum(tiCompetencyValues);
export const ProfileTrendSchema = z.enum(['up', 'down', 'flat'] as const);
export const NodeTypeSchema = z.enum(['branching', 'open_input'] as const);
export const TenantRoleSchema = z.enum(['tenant_user', 'tenant_admin'] as const);

export const CompetencyDetailSchema = z.object({
  score: z.number().min(0).max(100),
  evaluations: z.number().int().nonnegative(),
  lastDemonstrated: z.string(),
  trend: ProfileTrendSchema,
});

export const ProfileMetricsSchema = z.object({
  categoryScores: z.record(TiCategorySchema, z.number()),
  competencies: z.record(TiCompetencySchema, CompetencyDetailSchema),
  labelsOfExcellence: z.array(z.string()),
  totalXP: z.number(),
  categoryXP: z.record(TiCategorySchema, z.number()),
  activeCosmetics: z.array(z.string()),
});

export const NodeOpenInputConfigSchema = z.object({
  targetCompetencies: z.array(TiCompetencySchema).min(1),
  evaluationPrompt: z.string().min(1),
});

export const NodeContextSchema = z.object({
  nodeId: z.string().min(1),
  type: NodeTypeSchema,
  sceneText: z.string().min(1),
  openInputConfig: NodeOpenInputConfigSchema.optional(),
});

export const MissionStateSchema = z.object({
  sessionId: z.string().min(1),
  currentNode: NodeContextSchema,
  profileMetrics: ProfileMetricsSchema,
  isTerminal: z.boolean(),
});

export const StartMissionRequestSchema = z.object({
  scenarioId: z.string().min(1),
  clientRequestId: z.string().optional(),
});

export const StartMissionResponseSchema = z.object({
  missionState: MissionStateSchema,
  meta: z
    .object({
      startedAt: z.string(),
    })
    .optional(),
});

const DecisionBaseSchema = z.object({
  sessionId: z.string().min(1),
  nodeId: z.string().min(1),
  clientSubmissionId: z.string().min(1),
  voice: z
    .object({
      transcriptText: z.string().optional(),
      turnBoundary: z
        .object({
          startedAtMs: z.number(),
          endedAtMs: z.number(),
        })
        .optional(),
    })
    .optional(),
});

const DecisionBranchingSchema = DecisionBaseSchema.extend({
  branchingChoice: z.object({
    choiceKey: z.string().min(1),
  }),
  openInput: z.undefined().optional(),
});

const DecisionOpenInputSchema = DecisionBaseSchema.extend({
  openInput: z.object({
    inputText: z.string().min(1),
  }),
  branchingChoice: z.undefined().optional(),
});

export const DecisionRequestSchema = z.union([
  DecisionBranchingSchema,
  DecisionOpenInputSchema,
]);

export const DecisionResponseSchema = z.object({
  missionState: MissionStateSchema,
  feedback: z
    .object({
      npcMessage: z.string().optional(),
      evaluation: z
        .object({
          targetCompetency: TiCompetencySchema,
          awardedScore: z.number().min(0).max(100),
          demonstrated: z.boolean(),
          feedbackText: z.string().min(1),
        })
        .optional(),
    })
    .optional(),
  meta: z
    .object({
      turnId: z.number().int().nonnegative(),
      evaluatedAt: z.string(),
    })
    .optional(),
});

export const MentorRequestSchema = z.object({
  sessionId: z.string().min(1),
  nodeId: z.string().min(1),
  clientSubmissionId: z.string().min(1),
  challengeText: z.string().optional(),
});

export const MentorResponseSchema = z.object({
  missionState: MissionStateSchema,
  mentorHint: z
    .object({
      message: z.string().min(1),
    })
    .optional(),
  meta: z
    .object({
      turnId: z.number().int().nonnegative(),
      evaluatedAt: z.string(),
    })
    .optional(),
});

export const ApiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  requestId: z.string().min(1),
  details: z.unknown().optional(),
});

export const EvaluationJsonSchema = z.strictObject({
  Score: z.number().finite(),
  Demonstrated: z.boolean(),
  Feedback: z.string().trim().min(1),
});

export type EvaluationJson = z.infer<typeof EvaluationJsonSchema>;

export const EventTypeSchema = z.enum([
  'EVALUATION_COMPLETED',
  'EVALUATION_JSON_INVALID',
  'EVALUATION_LLM_ERROR',
  'DECISION_REJECTED',
  'MENTOR_INVOKED',
  'VOICE_TURN_EVALUATED',
  'ADMIN_CONFIG_CHANGED',
] as const);

const EventBaseSchema = z.object({
  eventId: z.string().min(1),
  tenantId: z.string().min(1),
  timestamp: z.string(),
  profileHash: z.string().min(1),
  sessionId: z.string().min(1),
  nodeId: z.string().min(1),
  turnId: z.number().int().nonnegative(),
  correlationId: z.string().min(1),
});

export const EvaluationCompletedEventSchema = EventBaseSchema.extend({
  eventType: z.literal('EVALUATION_COMPLETED'),
  scenarioId: z.string().min(1),
  awardedScore: z.number().min(0).max(100),
  rawScore: z.number().finite(),
  rawScale: z.enum(['zero_to_one', 'zero_to_one_hundred'] as const),
  demonstrated: z.boolean(),
  feedbackText: z.string().trim().min(1),
  promptVersion: z.string().min(1),
  scoringVersion: z.string().min(1),
  modelId: z.string().min(1).optional(),
  retryAttempted: z.boolean(),
});

export const EvaluationJsonInvalidEventSchema = EventBaseSchema.extend({
  eventType: z.literal('EVALUATION_JSON_INVALID'),
  scenarioId: z.string().min(1),
  reason: z.string().min(1),
  issues: z.array(z.object({ path: z.string(), message: z.string() })).min(1),
});

export const EvaluationLlmErrorEventSchema = EventBaseSchema.extend({
  eventType: z.literal('EVALUATION_LLM_ERROR'),
  scenarioId: z.string().min(1),
  reason: z.string().min(1),
});

export const DecisionRejectedEventSchema = EventBaseSchema.extend({
  eventType: z.literal('DECISION_REJECTED'),
  scenarioId: z.string().min(1),
  reason: z.string().min(1),
});

export const MentorInvokedEventSchema = EventBaseSchema.extend({
  eventType: z.literal('MENTOR_INVOKED'),
  scenarioId: z.string().min(1),
});

export const VoiceTurnEvaluatedEventSchema = EventBaseSchema.extend({
  eventType: z.literal('VOICE_TURN_EVALUATED'),
  scenarioId: z.string().min(1),
});

export const AdminConfigChangedEventSchema = EventBaseSchema.extend({
  eventType: z.literal('ADMIN_CONFIG_CHANGED'),
  scenarioId: z.string().min(1),
});

export const MissionEventSchema = z.union([
  EvaluationCompletedEventSchema,
  EvaluationJsonInvalidEventSchema,
  EvaluationLlmErrorEventSchema,
  DecisionRejectedEventSchema,
  MentorInvokedEventSchema,
  VoiceTurnEvaluatedEventSchema,
  AdminConfigChangedEventSchema,
]);

export type MissionEvent = z.infer<typeof MissionEventSchema>;

export function normalizeScoreTo100(rawScore: number): {
  awardedScore: number;
  rawScale: 'zero_to_one' | 'zero_to_one_hundred';
} {
  if (!Number.isFinite(rawScore)) {
    throw new Error('Score must be a finite number');
  }

  if (rawScore >= 0 && rawScore <= 1) {
    return {
      awardedScore: Math.round(rawScore * 100),
      rawScale: 'zero_to_one',
    };
  }

  if (rawScore >= 0 && rawScore <= 100) {
    return {
      awardedScore: Math.round(rawScore),
      rawScale: 'zero_to_one_hundred',
    };
  }

  throw new Error('Score must be in range 0..1 or 0..100');
}

