import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import { randomUUID } from 'node:crypto';
import {
  ApiErrorSchema,
  DecisionRequestSchema,
  DecisionResponseSchema,
  MentorRequestSchema,
  MentorResponseSchema,
  MissionStateSchema,
  StartMissionRequestSchema,
  StartMissionResponseSchema,
  type ApiError,
  type DecisionResponse,
  type MentorResponse,
  type MissionEvent,
  type MissionState,
  type NodeContext,
  type ProfileMetrics,
  type TICompetency,
} from '@ti-training/shared';
import { createDefaultProfileMetrics } from './domain';
import type { AuthContext, AuthResolver } from './auth';
import type { EvaluationEngine } from './evaluator';
import type { MissionPersistence, SessionRecord } from './persistence';

interface AppDeps {
  authResolver: AuthResolver;
  persistence: MissionPersistence;
  evaluator: EvaluationEngine;
}

function sendApiError(reply: FastifyReply, error: ApiError, statusCode: number): void {
  const safeError = ApiErrorSchema.parse(error);
  reply.code(statusCode).send(safeError);
}

function nowIso(): string {
  return new Date().toISOString();
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
  return MissionStateSchema.parse({
    sessionId: params.sessionId,
    currentNode: params.currentNode,
    profileMetrics: params.profileMetrics,
    isTerminal: params.isTerminal,
  });
}

function requireAdmin(context: AuthContext, requestId: string): ApiError | null {
  if (context.role === 'tenant_admin') {
    return null;
  }
  return {
    code: 'FORBIDDEN',
    message: 'Admin role required',
    requestId,
  };
}

function parseAuthError(error: unknown, requestId: string): ApiError {
  if (
    error instanceof Error &&
    (error.message.includes('Missing Authorization') ||
      error.message.includes('Missing test auth headers'))
  ) {
    return {
      code: 'UNAUTHORIZED',
      message: 'Authorization token is required',
      requestId,
    };
  }
  return {
    code: 'FORBIDDEN',
    message: 'Unable to resolve tenant identity',
    requestId,
  };
}

function createDecisionRejectedEvent(input: {
  context: AuthContext;
  requestId: string;
  scenarioId: string;
  sessionId: string;
  nodeId: string;
  turnId: number;
  reason: string;
}): MissionEvent {
  return {
    eventType: 'DECISION_REJECTED',
    eventId: randomUUID(),
    tenantId: input.context.tenantId,
    timestamp: nowIso(),
    profileHash: input.context.profileHash,
    sessionId: input.sessionId,
    nodeId: input.nodeId,
    turnId: input.turnId,
    correlationId: input.requestId,
    scenarioId: input.scenarioId,
    reason: input.reason,
  };
}

export function createApp(deps: AppDeps) {
  const app = Fastify({ logger: true });
  app.register(cors, { origin: true, methods: ['GET', 'POST', 'OPTIONS'] });

  app.get('/health', async () => ({ status: 'ok' }));

  app.post(
    '/api/missions/start',
    async (request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) => {
      const requestId = randomUUID();
      let authContext: AuthContext;
      try {
        authContext = await deps.authResolver.resolve(request);
      } catch (error) {
        sendApiError(reply, parseAuthError(error, requestId), 401);
        return;
      }

      const parsed = StartMissionRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        sendApiError(
          reply,
          {
            code: 'INVALID_START_REQUEST',
            message: 'Malformed startMission payload',
            requestId,
          },
          422,
        );
        return;
      }

      const sessionId = randomUUID();
      const profileMetrics =
        (await deps.persistence.getProfile(authContext.tenantId, authContext.userId)) ??
        createDefaultProfileMetrics();

      const currentNode = createNodeContext({
        nodeId: 'node-1',
        type: 'open_input',
        sceneText: `Scenario ${parsed.data.scenarioId}: explain your first decision.`,
        openInputConfig: {
          targetCompetencies: ['ti_data_integrity'],
          evaluationPrompt: 'Evaluate response using strict JSON contract.',
        },
      });

      const sessionRecord: SessionRecord = {
        tenantId: authContext.tenantId,
        userId: authContext.userId,
        scenarioId: parsed.data.scenarioId,
        sessionId,
        currentNodeId: currentNode.nodeId,
        currentNodeType: currentNode.type,
        isTerminal: false,
        turnId: 0,
        profileMetrics,
      };
      await deps.persistence.upsertSession(sessionRecord);

      const missionState = buildMissionState({
        sessionId,
        currentNode,
        profileMetrics,
        isTerminal: false,
      });

      const response = StartMissionResponseSchema.parse({
        missionState,
        meta: { startedAt: nowIso() },
      });
      reply.code(200).send(response);
    },
  );

  app.post(
    '/api/missions/decision',
    async (request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) => {
      const requestId = randomUUID();
      let authContext: AuthContext;
      try {
        authContext = await deps.authResolver.resolve(request);
      } catch (error) {
        sendApiError(reply, parseAuthError(error, requestId), 401);
        return;
      }

      const parsed = DecisionRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        sendApiError(
          reply,
          {
            code: 'INVALID_DECISION_REQUEST',
            message: 'Malformed submitDecision payload',
            requestId,
          },
          422,
        );
        return;
      }

      const payload = parsed.data;
      const session = await deps.persistence.getSession(
        authContext.tenantId,
        payload.sessionId,
      );
      app.log.info({
        event: 'DECISION_REQUEST_RECEIVED',
        requestId,
        tenantId: authContext.tenantId,
        sessionId: payload.sessionId,
        nodeId: payload.nodeId,
        clientSubmissionId: payload.clientSubmissionId,
      });
      if (!session || session.userId !== authContext.userId) {
        sendApiError(
          reply,
          {
            code: 'UNKNOWN_SESSION',
            message: 'Session not found',
            requestId,
          },
          400,
        );
        return;
      }

      const cached = await deps.persistence.getCachedDecision(
        authContext.tenantId,
        payload.sessionId,
        payload.nodeId,
        payload.clientSubmissionId,
      );
      if (cached) {
        const cachedResponse = DecisionResponseSchema.parse({
          missionState: cached,
          meta: { turnId: session.turnId, evaluatedAt: nowIso() },
        });
        reply.code(200).send(cachedResponse);
        return;
      }

      if (session.isTerminal) {
        await deps.persistence.appendEvent(
          createDecisionRejectedEvent({
            context: authContext,
            requestId,
            scenarioId: session.scenarioId,
            sessionId: session.sessionId,
            nodeId: payload.nodeId,
            turnId: session.turnId,
            reason: 'SESSION_TERMINAL',
          }),
        );
        sendApiError(
          reply,
          {
            code: 'SESSION_TERMINAL',
            message: 'Session is already terminal',
            requestId,
          },
          422,
        );
        return;
      }

      if (payload.nodeId !== session.currentNodeId) {
        await deps.persistence.appendEvent(
          createDecisionRejectedEvent({
            context: authContext,
            requestId,
            scenarioId: session.scenarioId,
            sessionId: session.sessionId,
            nodeId: payload.nodeId,
            turnId: session.turnId,
            reason: 'INVALID_NODE',
          }),
        );
        sendApiError(
          reply,
          {
            code: 'INVALID_NODE',
            message: 'nodeId does not match session current node',
            requestId,
          },
          422,
        );
        return;
      }

      const nextTurnId = session.turnId + 1;
      const isOpenInput = payload.openInput !== undefined;
      let awardedScore = 50;
      let demonstrated = false;
      let feedbackText = 'Decision captured.';
      let rawScore = 0.5;
      let rawScale: 'zero_to_one' | 'zero_to_one_hundred' = 'zero_to_one';

      if (isOpenInput) {
        try {
          const evaluation = await deps.evaluator.evaluateOpenInput({
            inputText: payload.openInput?.inputText ?? '',
            targetCompetency: 'ti_data_integrity',
          });
          awardedScore = evaluation.awardedScore;
          demonstrated = evaluation.demonstrated;
          feedbackText = evaluation.feedbackText;
          rawScore = evaluation.rawScore;
          rawScale = evaluation.rawScale;
        } catch (error) {
          await deps.persistence.appendEvent({
            eventType: 'EVALUATION_JSON_INVALID',
            eventId: randomUUID(),
            tenantId: authContext.tenantId,
            timestamp: nowIso(),
            profileHash: authContext.profileHash,
            sessionId: session.sessionId,
            nodeId: session.currentNodeId,
            turnId: nextTurnId,
            correlationId: requestId,
            scenarioId: session.scenarioId,
            reason: 'Contract validation failed',
            issues: [
              {
                path: 'EvaluationJsonSchema',
                message: error instanceof Error ? error.message : 'Unknown error',
              },
            ],
          });
          sendApiError(
            reply,
            {
              code: 'EVAL_JSON_INVALID',
              message: 'We could not evaluate this turn',
              requestId,
            },
            422,
          );
          app.log.error({
            event: 'EVAL_JSON_INVALID',
            requestId,
            tenantId: authContext.tenantId,
            sessionId: payload.sessionId,
            nodeId: payload.nodeId,
            clientSubmissionId: payload.clientSubmissionId,
          });
          return;
        }
      }

      const updatedProfile: ProfileMetrics = {
        ...session.profileMetrics,
        totalXP: session.profileMetrics.totalXP + 5,
        categoryXP: {
          ...session.profileMetrics.categoryXP,
          FOUNDATIONS: session.profileMetrics.categoryXP.FOUNDATIONS + 2,
        },
      };
      await deps.persistence.upsertProfile(
        authContext.tenantId,
        authContext.userId,
        updatedProfile,
      );

      const isTerminal = nextTurnId >= 2;
      const nextNode = isTerminal
        ? createNodeContext({
            nodeId: 'terminal-1',
            type: 'branching',
            sceneText: 'Mission complete. Review your dossier.',
          })
        : createNodeContext({
            nodeId: `node-${nextTurnId + 1}`,
            type: isOpenInput ? 'branching' : 'open_input',
            sceneText: 'Next challenge: choose with evidence.',
            openInputConfig: !isOpenInput
              ? {
                  targetCompetencies: ['ti_data_integrity'],
                  evaluationPrompt: 'Evaluate response with strict JSON output',
                }
              : undefined,
          });

      const missionState = buildMissionState({
        sessionId: session.sessionId,
        currentNode: nextNode,
        profileMetrics: updatedProfile,
        isTerminal,
      });

      await deps.persistence.upsertSession({
        ...session,
        turnId: nextTurnId,
        currentNodeId: nextNode.nodeId,
        currentNodeType: nextNode.type,
        isTerminal,
        profileMetrics: updatedProfile,
      });

      await deps.persistence.appendEvent({
        eventType: 'EVALUATION_COMPLETED',
        eventId: randomUUID(),
        tenantId: authContext.tenantId,
        timestamp: nowIso(),
        profileHash: authContext.profileHash,
        sessionId: session.sessionId,
        nodeId: payload.nodeId,
        turnId: nextTurnId,
        correlationId: requestId,
        scenarioId: session.scenarioId,
        awardedScore,
        rawScore,
        rawScale,
        demonstrated,
        feedbackText,
        promptVersion: 'v1',
        scoringVersion: 'v1',
        retryAttempted: false,
      });

      await deps.persistence.setCachedDecision(
        authContext.tenantId,
        payload.sessionId,
        payload.nodeId,
        payload.clientSubmissionId,
        missionState,
      );

      const response: DecisionResponse = {
        missionState,
        feedback: {
          npcMessage: demonstrated
            ? 'Decision accepted. Keep pressure on the evidence.'
            : 'Decision captured; tighten your reasoning on the next turn.',
          evaluation: {
            targetCompetency: 'ti_data_integrity',
            awardedScore,
            demonstrated,
            feedbackText,
          },
        },
        meta: {
          turnId: nextTurnId,
          evaluatedAt: nowIso(),
        },
      };

      app.log.info({
        event: 'DECISION_COMPLETED',
        requestId,
        tenantId: authContext.tenantId,
        sessionId: payload.sessionId,
        nodeId: payload.nodeId,
        turnId: nextTurnId,
        clientSubmissionId: payload.clientSubmissionId,
      });
      reply.code(200).send(DecisionResponseSchema.parse(response));
    },
  );

  app.post(
    '/api/missions/mentor',
    async (request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) => {
      const requestId = randomUUID();
      let authContext: AuthContext;
      try {
        authContext = await deps.authResolver.resolve(request);
      } catch (error) {
        sendApiError(reply, parseAuthError(error, requestId), 401);
        return;
      }

      const parsed = MentorRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        sendApiError(
          reply,
          {
            code: 'INVALID_MENTOR_REQUEST',
            message: 'Malformed mentor payload',
            requestId,
          },
          422,
        );
        return;
      }

      const payload = parsed.data;
      const session = await deps.persistence.getSession(
        authContext.tenantId,
        payload.sessionId,
      );
      if (!session || session.userId !== authContext.userId) {
        sendApiError(
          reply,
          {
            code: 'UNKNOWN_SESSION',
            message: 'Session not found',
            requestId,
          },
          400,
        );
        return;
      }

      if (payload.nodeId !== session.currentNodeId) {
        sendApiError(
          reply,
          {
            code: 'INVALID_NODE',
            message: 'nodeId does not match session current node',
            requestId,
          },
          422,
        );
        return;
      }

      const cached = await deps.persistence.getCachedMentor(
        authContext.tenantId,
        payload.sessionId,
        payload.nodeId,
        payload.clientSubmissionId,
      );
      if (cached) {
        const cachedResponse = MentorResponseSchema.parse({
          missionState: cached,
          mentorHint: { message: 'Re-syncing your last mentor hint…' },
          meta: { turnId: session.turnId, evaluatedAt: nowIso() },
        });
        reply.code(200).send(cachedResponse);
        return;
      }

      // Mentor must not advance the node graph.
      const missionState = buildMissionState({
        sessionId: session.sessionId,
        currentNode: createNodeContext({
          nodeId: session.currentNodeId,
          type: session.currentNodeType,
          sceneText: 'Mentor guidance active.',
          openInputConfig:
            session.currentNodeType === 'open_input'
              ? {
                  targetCompetencies: ['ti_data_integrity'],
                  evaluationPrompt: 'Mentor guidance only',
                }
              : undefined,
        }),
        profileMetrics: session.profileMetrics,
        isTerminal: session.isTerminal,
      });

      await deps.persistence.setCachedMentor(
        authContext.tenantId,
        payload.sessionId,
        payload.nodeId,
        payload.clientSubmissionId,
        missionState,
      );
      await deps.persistence.appendEvent({
        eventType: 'MENTOR_INVOKED',
        eventId: randomUUID(),
        tenantId: authContext.tenantId,
        timestamp: nowIso(),
        profileHash: authContext.profileHash,
        sessionId: session.sessionId,
        nodeId: session.currentNodeId,
        turnId: session.turnId + 1,
        correlationId: requestId,
        scenarioId: session.scenarioId,
      });

      const response: MentorResponse = {
        missionState,
        mentorHint: {
          message:
            payload.challengeText?.trim().length
              ? `Mentor hint: lead with the decision, then justify with one metric from "${payload.challengeText.slice(0, 25)}".`
              : 'Mentor hint: start with your decision, then defend it with one metric and one risk.',
        },
        meta: {
          turnId: session.turnId + 1,
          evaluatedAt: nowIso(),
        },
      };
      reply.code(200).send(MentorResponseSchema.parse(response));
    },
  );

  app.get('/api/missions/tracker/summary', async (request, reply) => {
    const requestId = randomUUID();
    let authContext: AuthContext;
    try {
      authContext = await deps.authResolver.resolve(request);
    } catch (error) {
      sendApiError(reply, parseAuthError(error, requestId), 401);
      return;
    }
    const profile =
      (await deps.persistence.getProfile(authContext.tenantId, authContext.userId)) ??
      createDefaultProfileMetrics();
    const events = await deps.persistence.listEvents(authContext.tenantId, {
      profileHash: authContext.profileHash,
    });
    reply.send({
      levelBand: 0,
      profileMetrics: profile,
      recentEvidence: events.slice(0, 10),
    });
  });

  app.get('/api/admin/tracker/tenant-overview', async (request, reply) => {
    const requestId = randomUUID();
    let authContext: AuthContext;
    try {
      authContext = await deps.authResolver.resolve(request);
    } catch (error) {
      sendApiError(reply, parseAuthError(error, requestId), 401);
      return;
    }
    const denied = requireAdmin(authContext, requestId);
    if (denied) {
      sendApiError(reply, denied, 403);
      return;
    }
    const events = await deps.persistence.listEvents(authContext.tenantId);
    const byType = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] ?? 0) + 1;
      return acc;
    }, {});
    reply.send({ tenantId: authContext.tenantId, totalEvents: events.length, byType });
  });

  app.get('/api/admin/tracker/events', async (request, reply) => {
    const requestId = randomUUID();
    let authContext: AuthContext;
    try {
      authContext = await deps.authResolver.resolve(request);
    } catch (error) {
      sendApiError(reply, parseAuthError(error, requestId), 401);
      return;
    }
    const denied = requireAdmin(authContext, requestId);
    if (denied) {
      sendApiError(reply, denied, 403);
      return;
    }
    const query = request.query as Record<string, string | undefined>;
    const events = await deps.persistence.listEvents(authContext.tenantId, {
      profileHash: query.profileHash,
      scenarioId: query.scenarioId,
      nodeId: query.nodeId,
      from: query.from,
      to: query.to,
    });
    reply.send({ events });
  });

  return app;
}
