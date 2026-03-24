import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createApp } from './app';
import { TestAuthResolver } from './auth';
import { DeterministicEvaluationEngine, TemplateMentorHintGenerator } from './evaluator';
import { InMemoryPersistence } from './persistence';

function appWithMemory() {
  return createApp({
    authResolver: new TestAuthResolver(),
    evaluator: new DeterministicEvaluationEngine(),
    mentorHintGenerator: new TemplateMentorHintGenerator(),
    evaluationModelId: 'test-deterministic',
    persistence: new InMemoryPersistence(),
  });
}

describe('mission contracts', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = appWithMemory();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects requests without auth headers', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/missions/start',
      payload: { scenarioId: 'scenario-1' },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json().code).toBe('UNAUTHORIZED');
  });

  it('supports idempotent decision replay without node drift', async () => {
    const start = await app.inject({
      method: 'POST',
      url: '/api/missions/start',
      headers: {
        'x-tenant-id': 't1',
        'x-user-id': 'u1',
      },
      payload: { scenarioId: 'scenario-1' },
    });

    const missionState = start.json().missionState as {
      sessionId: string;
      currentNode: { nodeId: string };
    };

    const first = await app.inject({
      method: 'POST',
      url: '/api/missions/decision',
      headers: {
        'x-tenant-id': 't1',
        'x-user-id': 'u1',
      },
      payload: {
        sessionId: missionState.sessionId,
        nodeId: missionState.currentNode.nodeId,
        clientSubmissionId: 'sub-1',
        branchingChoice: { choiceKey: 'route_legal_first' },
      },
    });

    const replay = await app.inject({
      method: 'POST',
      url: '/api/missions/decision',
      headers: {
        'x-tenant-id': 't1',
        'x-user-id': 'u1',
      },
      payload: {
        sessionId: missionState.sessionId,
        nodeId: missionState.currentNode.nodeId,
        clientSubmissionId: 'sub-1',
        branchingChoice: { choiceKey: 'route_legal_first' },
      },
    });

    expect(first.statusCode).toBe(200);
    expect(replay.statusCode).toBe(200);
    expect(replay.json().missionState.currentNode.nodeId).toBe(
      first.json().missionState.currentNode.nodeId,
    );
  });

  it('rejects node mismatch and keeps deterministic error code', async () => {
    const start = await app.inject({
      method: 'POST',
      url: '/api/missions/start',
      headers: {
        'x-tenant-id': 't1',
        'x-user-id': 'u1',
      },
      payload: { scenarioId: 'scenario-1' },
    });

    const missionState = start.json().missionState as { sessionId: string };

    const response = await app.inject({
      method: 'POST',
      url: '/api/missions/decision',
      headers: {
        'x-tenant-id': 't1',
        'x-user-id': 'u1',
      },
      payload: {
        sessionId: missionState.sessionId,
        nodeId: 'wrong-node',
        clientSubmissionId: 'sub-2',
        openInput: { inputText: 'A response' },
      },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().code).toBe('INVALID_NODE');
  });

  it('mentor invocation does not advance node graph', async () => {
    const start = await app.inject({
      method: 'POST',
      url: '/api/missions/start',
      headers: {
        'x-tenant-id': 't1',
        'x-user-id': 'u1',
      },
      payload: { scenarioId: 'scenario-1' },
    });

    const missionState = start.json().missionState as {
      sessionId: string;
      currentNode: { nodeId: string };
    };

    const mentor = await app.inject({
      method: 'POST',
      url: '/api/missions/mentor',
      headers: {
        'x-tenant-id': 't1',
        'x-user-id': 'u1',
      },
      payload: {
        sessionId: missionState.sessionId,
        nodeId: missionState.currentNode.nodeId,
        clientSubmissionId: 'mentor-1',
      },
    });

    expect(mentor.statusCode).toBe(200);
    expect(mentor.json().missionState.currentNode.nodeId).toBe(
      missionState.currentNode.nodeId,
    );
  });

  it('enforces tenant admin for admin tracker endpoint', async () => {
    const denied = await app.inject({
      method: 'GET',
      url: '/api/admin/tracker/tenant-overview',
      headers: {
        'x-tenant-id': 't1',
        'x-user-id': 'u1',
      },
    });
    expect(denied.statusCode).toBe(403);

    const allowed = await app.inject({
      method: 'GET',
      url: '/api/admin/tracker/tenant-overview',
      headers: {
        'x-tenant-id': 't1',
        'x-user-id': 'u-admin',
        'x-role': 'tenant_admin',
      },
    });
    expect(allowed.statusCode).toBe(200);
    expect(allowed.json().tenantId).toBe('t1');
  });
});
