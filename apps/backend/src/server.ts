import Fastify, {
  type FastifyReply,
  type FastifyRequest,
} from 'fastify';
import cors from '@fastify/cors';
import {
  DecisionRequestSchema,
  type DecisionResponse,
  type MentorRequest,
  MentorRequestSchema,
  type MissionState,
  MissionStateSchema,
  type NodeContext,
  type ProfileMetrics,
  type StartMissionRequest,
  StartMissionRequestSchema,
  type TICompetency,
  type TICategory,
  type CompetencyDetail,
} from '@ti-training/shared';
import { randomUUID } from 'node:crypto';

type SessionRecord = {
  sessionId: string;
  currentNodeId: string;
  currentNodeType: 'branching' | 'open_input';
  isTerminal: boolean;
  turnId: number;
  profileMetrics: ProfileMetrics;
};

const app = Fastify({
  logger: true,
});

app.register(cors, { origin: true, methods: ['GET', 'POST', 'OPTIONS'] });

app.get('/health', async () => {
  return { status: 'ok' };
});

const TICATEGORIES = [
  'FOUNDATIONS',
  'INFLUENCE',
  'STRATEGY',
  'CRISIS',
  'ETHICS',
  'LEADING_AND_MANAGING',
  'CREATIVE_AND_CRITICAL_THINKING',
  'THOUGHT_LEADERSHIP',
] as const satisfies TICategory[];

const TI_COMPETENCIES = [
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
] as const satisfies TICompetency[];

const decisionCache = new Map<string, DecisionResponse>();
const mentorCache = new Map<string, { missionState: MissionState; mentorHint?: { message: string }; meta?: { turnId: number; evaluatedAt: string } }>();
const sessions = new Map<string, SessionRecord>();

function createDefaultCompetencyDetail(): CompetencyDetail {
  return {
    score: 0,
    evaluations: 0,
    lastDemonstrated: new Date(0).toISOString(),
    trend: 'flat',
  };
}

function createDefaultProfileMetrics(): ProfileMetrics {
  const categoryScores = Object.fromEntries(
    TICATEGORIES.map((category) => [category, 0]),
  ) as Record<TICategory, number>;

  const competencies = Object.fromEntries(
    TI_COMPETENCIES.map((competency) => [competency, createDefaultCompetencyDetail()]),
  ) as Record<TICompetency, CompetencyDetail>;

  const categoryXP = Object.fromEntries(
    TICATEGORIES.map((category) => [category, 0]),
  ) as Record<TICategory, number>;

  return {
    categoryScores,
    competencies,
    labelsOfExcellence: [],
    totalXP: 0,
    categoryXP,
    activeCosmetics: [],
  };
}

function createNodeContext(params: {
  nodeId: string;
  type: 'branching' | 'open_input';
  sceneText: string;
  openInputConfig?: {
    targetCompetencies: TICompetency[];
    evaluationPrompt: string;
  };
}): NodeContext {
  return {
    nodeId: params.nodeId,
    type: params.type,
    sceneText: params.sceneText,
    openInputConfig: params.openInputConfig,
  };
}

function buildMissionState(params: {
  sessionId: string;
  currentNode: NodeContext;
  profileMetrics: ProfileMetrics;
  isTerminal: boolean;
}): MissionState {
  const candidate: MissionState = {
    sessionId: params.sessionId,
    currentNode: params.currentNode,
    profileMetrics: params.profileMetrics,
    isTerminal: params.isTerminal,
  };

  // Defensive runtime validation: future contract changes should fail fast.
  const validation = MissionStateSchema.safeParse(candidate);
  if (!validation.success) {
    throw new Error('Internal scaffold error: invalid MissionState shape');
  }

  return candidate;
}

function sendApiError(reply: FastifyReply, params: {
  statusCode: number;
  code: string;
  message: string;
  requestId: string;
  details?: unknown;
}): void {
  reply.code(params.statusCode).send({
    code: params.code,
    message: params.message,
    requestId: params.requestId,
    details: params.details,
  });
}

app.post(
  '/api/missions/start',
  async (
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply,
  ) => {
    const requestId = randomUUID();
    const parsed = StartMissionRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      sendApiError(reply, {
        statusCode: 422,
        code: 'INVALID_START_REQUEST',
        message: 'Malformed startMission payload',
        requestId,
      });
      return;
    }

    const payload: StartMissionRequest = parsed.data;
    const sessionId = randomUUID();

    const initialNode = createNodeContext({
      nodeId: 'node-1',
      type: 'open_input',
      sceneText: `Scenario ${payload.scenarioId}: explain your first decision.`,
      openInputConfig: {
        targetCompetencies: ['ti_data_integrity'],
        evaluationPrompt: 'Evaluate input against target competencies and return structured feedback.',
      },
    });

    const record: SessionRecord = {
      sessionId,
      currentNodeId: initialNode.nodeId,
      currentNodeType: initialNode.type,
      isTerminal: false,
      turnId: 0,
      profileMetrics: createDefaultProfileMetrics(),
    };
    sessions.set(sessionId, record);

    const missionState = buildMissionState({
      sessionId,
      currentNode: initialNode,
      profileMetrics: record.profileMetrics,
      isTerminal: false,
    });

    reply.code(200).send({
      missionState,
      meta: { startedAt: new Date().toISOString() },
    });
  },
);

app.post(
  '/api/missions/decision',
  async (
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply,
  ) => {
    const requestId = randomUUID();
    const parsed = DecisionRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      sendApiError(reply, {
        statusCode: 422,
        code: 'INVALID_DECISION_REQUEST',
        message: 'Malformed submitDecision payload',
        requestId,
      });
      return;
    }

    const payload = parsed.data;
    const session = sessions.get(payload.sessionId);
    if (!session) {
      sendApiError(reply, {
        statusCode: 400,
        code: 'UNKNOWN_SESSION',
        message: 'Session not found',
        requestId,
      });
      return;
    }

    if (payload.nodeId !== session.currentNodeId || session.isTerminal) {
      sendApiError(reply, {
        statusCode: 422,
        code: 'SESSION_NODE_MISMATCH',
        message: 'nodeId does not match current session state',
        requestId,
      });
      return;
    }

    const idempotencyKey = `${payload.sessionId}:${payload.nodeId}:${payload.clientSubmissionId}`;
    const cached = decisionCache.get(idempotencyKey);
    if (cached) {
      reply.code(200).send(cached);
      return;
    }

    const nextTurnId = session.turnId + 1;

    const nextNodeType: 'branching' | 'open_input' = payload.openInput ? 'branching' : 'open_input';

    const evaluationTarget = payload.openInput
      ? 'ti_data_integrity'
      : 'ti_workforce_planning';

    const awardedScore = payload.openInput ? 72 : 64;
    const demonstrated = payload.openInput ? true : false;

    // Deterministic placeholder profile update (scaffold only)
    const updatedProfile: ProfileMetrics = {
      ...session.profileMetrics,
      totalXP: session.profileMetrics.totalXP + 5,
      categoryXP: {
        ...session.profileMetrics.categoryXP,
        FOUNDATIONS: session.profileMetrics.categoryXP.FOUNDATIONS + 2,
      },
    };

    const isTerminal = nextTurnId >= 2;

    const nextNode = isTerminal
      ? createNodeContext({
          nodeId: 'terminal-1',
          type: 'branching',
          sceneText: 'Mission complete. Review your dossier and next steps.',
        })
      : createNodeContext({
          nodeId: `node-${nextTurnId + 1}`,
          type: nextNodeType,
          sceneText: `Next challenge: make your decision with evidence and clear reasoning.`,
          openInputConfig: nextNodeType === 'open_input' ? {
            targetCompetencies: ['ti_data_integrity', 'ti_exec_comms'],
            evaluationPrompt: 'Evaluate this response with the strict JSON contract.',
          } : undefined,
        });

    session.turnId = nextTurnId;
    session.currentNodeId = nextNode.nodeId;
    session.currentNodeType = nextNode.type;
    session.isTerminal = isTerminal;
    session.profileMetrics = updatedProfile;

    const missionState = buildMissionState({
      sessionId: session.sessionId,
      currentNode: nextNode,
      profileMetrics: updatedProfile,
      isTerminal,
    });

    const response: DecisionResponse = {
      missionState,
      feedback: {
        npcMessage: payload.openInput ? 'Your reasoning is structured and hits the brief.' : 'Decision recorded; consider strengthening evidence.',
        evaluation: {
          targetCompetency: evaluationTarget,
          awardedScore,
          demonstrated,
          feedbackText: payload.openInput ? 'Good alignment. Next time, add stakeholder constraints earlier.' : 'Solid start. Add a specific metric or assumption.',
        },
      },
      meta: {
        turnId: nextTurnId,
        evaluatedAt: new Date().toISOString(),
      },
    };

    decisionCache.set(idempotencyKey, response);
    reply.code(200).send(response);
  },
);

app.post(
  '/api/missions/mentor',
  async (
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply,
  ) => {
    const requestId = randomUUID();
    const parsed = MentorRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      sendApiError(reply, {
        statusCode: 422,
        code: 'INVALID_MENTOR_REQUEST',
        message: 'Malformed mentor payload',
        requestId,
      });
      return;
    }

    const payload: MentorRequest = parsed.data;
    const session = sessions.get(payload.sessionId);
    if (!session) {
      sendApiError(reply, {
        statusCode: 400,
        code: 'UNKNOWN_SESSION',
        message: 'Session not found',
        requestId,
      });
      return;
    }

    if (payload.nodeId !== session.currentNodeId) {
      sendApiError(reply, {
        statusCode: 422,
        code: 'SESSION_NODE_MISMATCH',
        message: 'nodeId does not match current session state',
        requestId,
      });
      return;
    }

    const idempotencyKey = `${payload.sessionId}:${payload.nodeId}:${payload.clientSubmissionId}`;
    const cached = mentorCache.get(idempotencyKey);
    if (cached) {
      reply.code(200).send({
        missionState: cached.missionState,
        mentorHint: cached.mentorHint,
        meta: cached.meta,
      });
      return;
    }

    const evaluatedAt = new Date().toISOString();
    const nextTurnId = session.turnId + 1;

    const hintMessage = payload.challengeText
      ? `Mentor hint: connect your next step to ${payload.challengeText.slice(0, 40)}... and name the tradeoff.`
      : 'Mentor hint: state the goal, name the tradeoff, then justify the chosen action.';

    const currentNode: NodeContext = createNodeContext({
      nodeId: session.currentNodeId,
      type: session.currentNodeType,
      sceneText: 'Mentor requested.',
      openInputConfig: session.currentNodeType === 'open_input'
        ? {
            targetCompetencies: ['ti_data_integrity'],
            evaluationPrompt: 'Mentor should help the user formulate an answer.',
          }
        : undefined,
    });

    const missionState = buildMissionState({
      sessionId: session.sessionId,
      currentNode,
      profileMetrics: session.profileMetrics,
      isTerminal: session.isTerminal,
    });

    const response = {
      missionState,
      mentorHint: { message: hintMessage },
      meta: { turnId: nextTurnId, evaluatedAt },
    };

    mentorCache.set(idempotencyKey, response);
    session.turnId = nextTurnId;

    reply.code(200).send(response);
  },
);

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

await app.listen({ port, host });

