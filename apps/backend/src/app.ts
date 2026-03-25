import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import { randomInt, randomUUID } from 'node:crypto';
import {
  ApiErrorSchema,
  DecisionRequestSchema,
  DecisionResponseSchema,
  AvailableScenariosResponseSchema,
  MentorRequestSchema,
  MentorResponseSchema,
  MissionStateSchema,
  StartMissionRequestSchema,
  StartMissionResponseSchema,
  type ApiError,
  type AvailableScenariosResponse,
  type DecisionResponse,
  type MentorResponse,
  type MissionEvent,
  type MissionState,
  type NodeContext,
  type ProfileMetrics,
  type TICompetency,
} from '@ti-training/shared';
import {
  createDefaultProfileMetrics,
  mergeProfileAfterOpenInputEvaluation,
} from './domain';
import type { AuthContext, AuthResolver } from './auth';
import type { EvaluationEngine, MentorHintGenerator } from './evaluator';
import { primaryTargetCompetency } from './geminiLlm';
import type { MissionPersistence, SessionRecord } from './persistence';
import {
  createTerminalNodeContext,
  getScenarioNode,
  isScenarioSupported,
  listSupportedScenarios,
  runMetadataForSeed,
} from './scenarioCatalog';

interface AppDeps {
  authResolver: AuthResolver;
  persistence: MissionPersistence;
  evaluator: EvaluationEngine;
  mentorHintGenerator: MentorHintGenerator;
  /** Included on evaluation events / logs when using an LLM. */
  evaluationModelId?: string;
}

function sendApiError(reply: FastifyReply, error: ApiError, statusCode: number): void {
  const safeError = ApiErrorSchema.parse(error);
  reply.code(statusCode).send(safeError);
}

function nowIso(): string {
  return new Date().toISOString();
}

function buildMissionState(params: {
  sessionId: string;
  currentNode: NodeContext;
  profileMetrics: ProfileMetrics;
  isTerminal: boolean;
  runMetadata?: { sessionSeed: number; variantLabel: string };
}): MissionState {
  return MissionStateSchema.parse({
    sessionId: params.sessionId,
    currentNode: params.currentNode,
    profileMetrics: params.profileMetrics,
    isTerminal: params.isTerminal,
    runMetadata: params.runMetadata,
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
  if (error instanceof Error && error.message === 'TOKEN_MISSING_UID_OR_TENANT_CLAIM') {
    return {
      code: 'FORBIDDEN',
      message:
        'Your account is signed in but missing tenantId (Firebase custom claim). Run set-user-claims on the backend for your user UID (see docs/firebase-real-auth-setup.md).',
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
  app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'content-type',
      'authorization',
      'x-tenant-id',
      'x-user-id',
      'x-role',
    ],
  });

  app.get('/health', async () => ({ status: 'ok' }));

  app.get('/api/scenarios/available', async (request, reply) => {
    const requestId = randomUUID();
    try {
      await deps.authResolver.resolve(request);
    } catch (error) {
      sendApiError(reply, parseAuthError(error, requestId), 401);
      return;
    }

    // Tenant-specific enablement can be layered later; for now we return all supported scenarios.
    const payload: AvailableScenariosResponse = {
      scenarios: listSupportedScenarios().map((s) => ({
        ...s,
        // Future: filter or adjust `enabled` based on authContext.tenantId.
      })),
    };

    reply.send(AvailableScenariosResponseSchema.parse(payload));
  });

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
      const sessionSeed = randomInt(-0x7fff_ffff, 0x7fff_ffff);
      const profileMetrics =
        (await deps.persistence.getProfile(authContext.tenantId, authContext.userId)) ??
        createDefaultProfileMetrics();

      if (!isScenarioSupported(parsed.data.scenarioId)) {
        sendApiError(
          reply,
          {
            code: 'UNKNOWN_SCENARIO',
            message: `Unknown scenario: ${parsed.data.scenarioId}`,
            requestId,
          },
          404,
        );
        return;
      }

      const currentNode = getScenarioNode(parsed.data.scenarioId, 'node-1', {
        sessionSeed,
      });
      if (!currentNode) {
        sendApiError(
          reply,
          {
            code: 'SCENARIO_CONFIG',
            message: 'Scenario has no start node configured',
            requestId,
          },
          500,
        );
        return;
      }

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
        sessionSeed,
      };
      await deps.persistence.upsertSession(sessionRecord);

      const missionState = buildMissionState({
        sessionId,
        currentNode,
        profileMetrics,
        isTerminal: false,
        runMetadata: runMetadataForSeed(sessionSeed),
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

      if (payload.nodeId.trim() !== session.currentNodeId.trim()) {
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
      const sessionSeed = session.sessionSeed ?? 0;
      const variant = { sessionSeed };
      const runMeta = runMetadataForSeed(sessionSeed);

      const currentNode = getScenarioNode(session.scenarioId, session.currentNodeId, variant);
      if (!currentNode) {
        sendApiError(
          reply,
          {
            code: 'SCENARIO_CONFIG',
            message: 'Scenario node missing on server',
            requestId,
          },
          500,
        );
        return;
      }

      const isOpenInput = payload.openInput !== undefined;
      let awardedScore = 0;
      let demonstrated = false;
      let feedbackText = 'Route recorded.';
      let rawScore = 0;
      let rawScale: 'zero_to_one' | 'zero_to_one_hundred' = 'zero_to_one';
      let evaluationTarget: TICompetency = 'ti_data_integrity';

      let nextNodeId: string;
      if (payload.branchingChoice) {
        const choiceKey = payload.branchingChoice.choiceKey;
        const option = currentNode.branchingOptions?.find((opt) => opt.choiceKey === choiceKey);
        if (!option) {
          await deps.persistence.appendEvent(
            createDecisionRejectedEvent({
              context: authContext,
              requestId,
              scenarioId: session.scenarioId,
              sessionId: session.sessionId,
              nodeId: payload.nodeId,
              turnId: session.turnId,
              reason: 'INVALID_CHOICE',
            }),
          );
          sendApiError(
            reply,
            {
              code: 'INVALID_CHOICE',
              message: 'choiceKey does not match an option on this node',
              requestId,
            },
            422,
          );
          return;
        }
        nextNodeId = option.nextNodeId;
      } else if (isOpenInput) {
        if (!currentNode.nextNodeId) {
          sendApiError(
            reply,
            {
              code: 'SCENARIO_CONFIG',
              message: 'Open-input node has no nextNodeId',
              requestId,
            },
            500,
          );
          return;
        }
        nextNodeId = currentNode.nextNodeId;
        const rubric = currentNode.openInputConfig?.evaluationPrompt ?? '';
        evaluationTarget = primaryTargetCompetency(
          currentNode.openInputConfig?.targetCompetencies ?? ['ti_data_integrity'],
        );
        try {
          const evaluation = await deps.evaluator.evaluateOpenInput({
            inputText: payload.openInput?.inputText ?? '',
            targetCompetency: evaluationTarget,
            sceneContext: currentNode.sceneText,
            evaluationRubric: rubric,
          });
          awardedScore = evaluation.awardedScore;
          demonstrated = evaluation.demonstrated;
          feedbackText = evaluation.feedbackText;
          rawScore = evaluation.rawScore;
          rawScale = evaluation.rawScale;
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          if (msg.startsWith('GEMINI_EVAL_FAILED')) {
            await deps.persistence.appendEvent({
              eventType: 'EVALUATION_LLM_ERROR',
              eventId: randomUUID(),
              tenantId: authContext.tenantId,
              timestamp: nowIso(),
              profileHash: authContext.profileHash,
              sessionId: session.sessionId,
              nodeId: session.currentNodeId,
              turnId: nextTurnId,
              correlationId: requestId,
              scenarioId: session.scenarioId,
              reason: msg,
            });
            app.log.error({
              event: 'EVALUATION_LLM_ERROR',
              requestId,
              tenantId: authContext.tenantId,
              sessionId: payload.sessionId,
              nodeId: payload.nodeId,
              reason: msg,
            });
            sendApiError(
              reply,
              {
                code: 'EVALUATION_UNAVAILABLE',
                message: 'Evaluation service unavailable; try again shortly',
                requestId,
              },
              503,
            );
            return;
          }
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
                message: msg,
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
            issues: msg,
          });
          return;
        }
      } else {
        sendApiError(
          reply,
          {
            code: 'INVALID_DECISION_REQUEST',
            message: 'Decision must include branchingChoice or openInput',
            requestId,
          },
          422,
        );
        return;
      }

      const xpGain = isOpenInput ? (demonstrated ? 12 : 7) : 4;
      const foundationGain = isOpenInput ? (demonstrated ? 5 : 3) : 2;

      const evaluatedAt = nowIso();
      const profileAfterXp: ProfileMetrics = {
        ...session.profileMetrics,
        totalXP: session.profileMetrics.totalXP + xpGain,
        categoryXP: {
          ...session.profileMetrics.categoryXP,
          FOUNDATIONS: session.profileMetrics.categoryXP.FOUNDATIONS + foundationGain,
        },
      };

      const updatedProfile: ProfileMetrics =
        isOpenInput && currentNode.openInputConfig
          ? mergeProfileAfterOpenInputEvaluation({
              profile: profileAfterXp,
              targetCompetencies: currentNode.openInputConfig.targetCompetencies,
              awardedScore,
              demonstrated,
              evaluatedAtIso: evaluatedAt,
            })
          : profileAfterXp;
      await deps.persistence.upsertProfile(
        authContext.tenantId,
        authContext.userId,
        updatedProfile,
      );

      let isTerminal = false;
      let nextNode: NodeContext;
      if (nextNodeId === 'terminal-1') {
        nextNode = createTerminalNodeContext();
        isTerminal = true;
      } else {
        const resolved = getScenarioNode(session.scenarioId, nextNodeId, variant);
        if (!resolved) {
          sendApiError(
            reply,
            {
              code: 'SCENARIO_CONFIG',
              message: `Scenario is missing configured node ${nextNodeId}`,
              requestId,
            },
            500,
          );
          return;
        }
        nextNode = resolved;
      }

      const missionState = buildMissionState({
        sessionId: session.sessionId,
        currentNode: nextNode,
        profileMetrics: updatedProfile,
        isTerminal,
        runMetadata: runMeta,
      });

      await deps.persistence.upsertSession({
        ...session,
        turnId: nextTurnId,
        currentNodeId: nextNode.nodeId,
        currentNodeType: nextNode.type,
        isTerminal,
        profileMetrics: updatedProfile,
        sessionSeed,
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
        promptVersion: 'v2-design-led',
        scoringVersion: 'v2',
        modelId: deps.evaluationModelId,
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
          npcMessage: isOpenInput
            ? demonstrated
              ? 'Strong signal on the rubric—carry that discipline forward.'
              : 'Captured. Tighten specificity and boundaries on the next beat.'
            : 'Route locked. The next screen reflects that stance.',
          ...(isOpenInput
            ? {
                evaluation: {
                  targetCompetency: evaluationTarget,
                  awardedScore,
                  demonstrated,
                  feedbackText,
                },
              }
            : {}),
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

      if (payload.nodeId.trim() !== session.currentNodeId.trim()) {
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

      const sessionSeed = session.sessionSeed ?? 0;
      const variant = { sessionSeed };
      const restoredNode = getScenarioNode(session.scenarioId, session.currentNodeId, variant);
      if (!restoredNode) {
        sendApiError(
          reply,
          {
            code: 'SCENARIO_CONFIG',
            message: 'Scenario node missing for mentor restore',
            requestId,
          },
          500,
        );
        return;
      }
      const missionState = buildMissionState({
        sessionId: session.sessionId,
        currentNode: restoredNode,
        profileMetrics: session.profileMetrics,
        isTerminal: session.isTerminal,
        runMetadata: runMetadataForSeed(sessionSeed),
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
        turnId: session.turnId,
        correlationId: requestId,
        scenarioId: session.scenarioId,
      });

      let mentorMessage: string;
      try {
        mentorMessage = await deps.mentorHintGenerator.generateHint({
          sceneText: restoredNode.sceneText,
          userMessage: payload.userMessage,
          challengeText: payload.challengeText,
        });
      } catch (error) {
        app.log.error({
          event: 'MENTOR_HINT_FAILED',
          requestId,
          tenantId: authContext.tenantId,
          sessionId: payload.sessionId,
          nodeId: payload.nodeId,
          error: error instanceof Error ? error.message : 'unknown',
        });
        mentorMessage =
          'State your decision in one line, then add one metric and one explicit risk or boundary you will not cross.';
      }

      const response: MentorResponse = {
        missionState,
        mentorHint: {
          message: mentorMessage,
        },
        meta: {
          turnId: session.turnId,
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
