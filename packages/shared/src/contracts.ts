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

// Shared zod schemas for backend stubs (and later contract parity validation)
export const NodeContextSchema = z.object({
  nodeId: z.string(),
  type: z.union([z.literal('branching'), z.literal('open_input')]),
  sceneText: z.string(),
  openInputConfig: z
    .object({
      targetCompetencies: z.array(z.string()),
      evaluationPrompt: z.string(),
    })
    .optional(),
});

export const ProfileMetricsSchema = z.object({
  categoryScores: z.record(z.string(), z.number()),
  competencies: z.record(z.string(), z.object({
    score: z.number(),
    evaluations: z.number(),
    lastDemonstrated: z.string(),
    trend: z.union([z.literal('up'), z.literal('down'), z.literal('flat')]),
  })),
  labelsOfExcellence: z.array(z.string()),
  totalXP: z.number(),
  categoryXP: z.record(z.string(), z.number()),
  activeCosmetics: z.array(z.string()),
});

export const MissionStateSchema = z.object({
  sessionId: z.string(),
  currentNode: NodeContextSchema,
  profileMetrics: ProfileMetricsSchema,
  isTerminal: z.boolean(),
});

export const StartMissionRequestSchema = z.object({
  scenarioId: z.string(),
  clientRequestId: z.string().optional(),
});

export const DecisionRequestSchema = z.object({
  sessionId: z.string(),
  nodeId: z.string(),
  clientSubmissionId: z.string(),
  branchingChoice: z
    .object({
      choiceKey: z.string(),
    })
    .optional(),
  openInput: z
    .object({
      inputText: z.string(),
    })
    .optional(),
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

export const MentorRequestSchema = z.object({
  sessionId: z.string(),
  nodeId: z.string(),
  clientSubmissionId: z.string(),
  challengeText: z.string().optional(),
});

