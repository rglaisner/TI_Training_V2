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

export interface BranchingOption {
  choiceKey: string;
  label: string;
  /** Graph edge: node to enter after this choice (use `terminal-1` to end the mission). */
  nextNodeId: string;
}

/** Optional run metadata so the UI can show variation without hiding that the mission is personalized. */
export interface MissionRunMetadata {
  sessionSeed: number;
  variantLabel: string;
}

export interface NodeContext {
  nodeId: string;
  type: NodeType;
  sceneText: string;
  openInputConfig?: NodeOpenInputConfig;
  /** Shown when `type === 'branching'` (except terminal summary nodes). */
  branchingOptions?: BranchingOption[];
  /**
   * When `type === 'open_input'`, the node to enter after a successful open-input evaluation
   * (use `terminal-1` to end after this step).
   */
  nextNodeId?: string;
}

export interface MissionState {
  sessionId: string;
  currentNode: NodeContext;
  profileMetrics: ProfileMetrics;
  isTerminal: boolean;
  runMetadata?: MissionRunMetadata;
}

export interface ScenarioCard {
  scenarioId: string;
  label: string;
  enabled: boolean;
  featured: boolean;
  comingSoon?: boolean;
  /** Higher means it should be shown earlier in the “push” ordering. */
  pushRank?: number;
}

export interface AvailableScenariosResponse {
  scenarios: ScenarioCard[];
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
      rubricBreakdown?: EvaluationRubricBreakdown;
      evaluationConfidence?: number;
      scoringRationaleVersion?: string;
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
  /** Learner message for a short Socratic exchange (optional). */
  userMessage?: string;
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

export interface MentorFeedbackRequest {
  sessionId: string;
  nodeId: string;
  mentorMessageId: string;
  helpful: boolean;
  note?: string;
}

export interface MentorFeedbackResponse {
  accepted: true;
  recordedAt: string;
}

export type FirstSessionEventName =
  | 'first_session_loaded'
  | 'first_interaction'
  | 'scenario_start_clicked'
  | 'mentor_invoked'
  | 'mentor_feedback_rated'
  | 'mission_completed'
  | 'next_mission_selected'
  | 'auth_panel_state_shown'
  | 'auth_error_seen'
  | 'misconfig_retry_clicked'
  | 'bypass_mode_seen'
  | 'sign_in_success';

export interface FirstSessionTelemetryItem {
  event: FirstSessionEventName;
  timestamp: string;
  missionId?: string;
  detail?: string;
  value?: number;
}

export interface FirstSessionTelemetryIngestRequest {
  sessionId?: string;
  events: FirstSessionTelemetryItem[];
}

export interface FirstSessionTelemetryIngestResponse {
  acceptedCount: number;
}

export interface EvaluationRubricBreakdown {
  decisionClarity: number;
  evidenceDiscipline: number;
  boundaryExplicitness: number;
  stakeholderActionability: number;
  rubricAlignment: number;
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

export const BranchingOptionSchema = z.object({
  choiceKey: z.string().min(1),
  label: z.string().min(1),
  nextNodeId: z.string().min(1),
});

export const MissionRunMetadataSchema = z.object({
  sessionSeed: z.number().int(),
  variantLabel: z.string().min(1),
});

export const NodeContextSchema = z
  .object({
    nodeId: z.string().min(1),
    type: NodeTypeSchema,
    sceneText: z.string().min(1),
    openInputConfig: NodeOpenInputConfigSchema.optional(),
    branchingOptions: z.array(BranchingOptionSchema).optional(),
    nextNodeId: z.string().min(1).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.type === 'open_input' && !val.openInputConfig) {
      ctx.addIssue({
        code: 'custom',
        message: 'open_input nodes require openInputConfig',
        path: ['openInputConfig'],
      });
    }
    if (val.type === 'open_input' && val.nodeId !== 'terminal-1' && !val.nextNodeId) {
      ctx.addIssue({
        code: 'custom',
        message: 'open_input nodes require nextNodeId (except terminal-1)',
        path: ['nextNodeId'],
      });
    }
    if (val.type === 'branching' && val.nodeId !== 'terminal-1') {
      if (!val.branchingOptions || val.branchingOptions.length < 3) {
        ctx.addIssue({
          code: 'custom',
          message:
            'branching nodes require at least three branchingOptions (except terminal-1) — avoid false binary choices',
          path: ['branchingOptions'],
        });
      }
    }
  });

export const MissionStateSchema = z.object({
  sessionId: z.string().min(1),
  currentNode: NodeContextSchema,
  profileMetrics: ProfileMetricsSchema,
  isTerminal: z.boolean(),
  runMetadata: MissionRunMetadataSchema.optional(),
});

export const ScenarioCardSchema = z.object({
  scenarioId: z.string().min(1),
  label: z.string().min(1),
  enabled: z.boolean(),
  featured: z.boolean(),
  comingSoon: z.boolean().optional(),
  pushRank: z.number().int().nonnegative().optional(),
});

export const AvailableScenariosResponseSchema = z.object({
  scenarios: z.array(ScenarioCardSchema),
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
          rubricBreakdown: z
            .object({
              decisionClarity: z.number().min(0).max(1),
              evidenceDiscipline: z.number().min(0).max(1),
              boundaryExplicitness: z.number().min(0).max(1),
              stakeholderActionability: z.number().min(0).max(1),
              rubricAlignment: z.number().min(0).max(1),
            })
            .optional(),
          evaluationConfidence: z.number().min(0).max(1).optional(),
          scoringRationaleVersion: z.string().min(1).optional(),
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
  userMessage: z.string().optional(),
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

export const MentorFeedbackRequestSchema = z.object({
  sessionId: z.string().min(1),
  nodeId: z.string().min(1),
  mentorMessageId: z.string().min(1),
  helpful: z.boolean(),
  note: z.string().max(500).optional(),
});

export const MentorFeedbackResponseSchema = z.object({
  accepted: z.literal(true),
  recordedAt: z.string(),
});

export const FirstSessionTelemetryItemSchema = z.object({
  event: z.string().min(1),
  timestamp: z.string().min(1),
  missionId: z.string().optional(),
  detail: z.string().optional(),
  value: z.number().optional(),
});

export const FirstSessionTelemetryIngestRequestSchema = z.object({
  sessionId: z.string().optional(),
  events: z.array(FirstSessionTelemetryItemSchema).min(1).max(100),
});

export const FirstSessionTelemetryIngestResponseSchema = z.object({
  acceptedCount: z.number().int().nonnegative(),
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
  'MENTOR_FEEDBACK_RECORDED',
  'BASELINE_CAPTURED',
  'MISSION_COMPLETED',
  'TELEMETRY_INGESTED',
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
  scoringRationaleVersion: z.string().min(1).optional(),
  evaluationConfidence: z.number().min(0).max(1).optional(),
  rubricBreakdown: z
    .object({
      decisionClarity: z.number().min(0).max(1),
      evidenceDiscipline: z.number().min(0).max(1),
      boundaryExplicitness: z.number().min(0).max(1),
      stakeholderActionability: z.number().min(0).max(1),
      rubricAlignment: z.number().min(0).max(1),
    })
    .optional(),
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

export const MentorFeedbackRecordedEventSchema = EventBaseSchema.extend({
  eventType: z.literal('MENTOR_FEEDBACK_RECORDED'),
  scenarioId: z.string().min(1),
  helpful: z.boolean(),
  mentorMessageId: z.string().min(1),
  note: z.string().optional(),
});

export const BaselineCapturedEventSchema = EventBaseSchema.extend({
  eventType: z.literal('BASELINE_CAPTURED'),
  scenarioId: z.string().min(1),
  baselineTotalXp: z.number(),
});

export const MissionCompletedEventSchema = EventBaseSchema.extend({
  eventType: z.literal('MISSION_COMPLETED'),
  scenarioId: z.string().min(1),
  xpDelta: z.number(),
});

export const TelemetryIngestedEventSchema = EventBaseSchema.extend({
  eventType: z.literal('TELEMETRY_INGESTED'),
  scenarioId: z.string().min(1),
  detail: z.string().min(1),
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
  MentorFeedbackRecordedEventSchema,
  BaselineCapturedEventSchema,
  MissionCompletedEventSchema,
  TelemetryIngestedEventSchema,
  VoiceTurnEvaluatedEventSchema,
  AdminConfigChangedEventSchema,
]);

export type MissionEvent = z.infer<typeof MissionEventSchema>;

/** Response shape for `GET /api/missions/tracker/summary` (user-facing tracker). */
export const TrackerSummaryResponseSchema = z.object({
  levelBand: z.number().int(),
  profileMetrics: ProfileMetricsSchema,
  recentEvidence: z.array(MissionEventSchema),
});

export type TrackerSummaryResponse = z.infer<typeof TrackerSummaryResponseSchema>;

/** Entry for tenant scenario rollout / catalog controls (admin). */
export const ScenarioRolloutEntrySchema = z.object({
  enabled: z.boolean(),
  featured: z.boolean().optional(),
  pushRank: z.number().int().optional(),
});

export type ScenarioRolloutEntry = z.infer<typeof ScenarioRolloutEntrySchema>;

export const ScenarioRolloutGetResponseSchema = z.object({
  config: z.record(z.string(), ScenarioRolloutEntrySchema),
});

export type ScenarioRolloutGetResponse = z.infer<typeof ScenarioRolloutGetResponseSchema>;

export const ScenarioRolloutSaveResponseSchema = z.object({
  ok: z.literal(true),
});

export type ScenarioRolloutSaveResponse = z.infer<typeof ScenarioRolloutSaveResponseSchema>;

export const ScenarioRolloutSaveRequestSchema = z.object({
  config: z.record(z.string(), ScenarioRolloutEntrySchema),
});

export type ScenarioRolloutSaveRequest = z.infer<typeof ScenarioRolloutSaveRequestSchema>;

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

export function deriveLevelBandFromXp(totalXp: number): number {
  if (totalXp >= 300) return 3;
  if (totalXp >= 150) return 2;
  return 1;
}

