import { describe, expect, it } from 'vitest';
import { InMemoryPersistence } from './persistence';

describe('InMemoryPersistence append-only semantics', () => {
  it('rejects event overwrite with same eventId', async () => {
    const persistence = new InMemoryPersistence();
    const baseEvent = {
      eventType: 'DECISION_REJECTED' as const,
      eventId: 'evt-1',
      tenantId: 'tenant-a',
      timestamp: new Date().toISOString(),
      profileHash: 'profile-hash',
      sessionId: 'session-1',
      nodeId: 'node-1',
      turnId: 1,
      correlationId: 'corr-1',
      scenarioId: 'scenario-1',
      reason: 'INVALID_NODE',
    };

    await persistence.appendEvent(baseEvent);
    await expect(persistence.appendEvent(baseEvent)).rejects.toThrowError(
      /append-only/i,
    );
  });
});
