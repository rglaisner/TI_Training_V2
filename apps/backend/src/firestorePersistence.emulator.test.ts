import { beforeAll, describe, expect, it } from 'vitest';
import admin from 'firebase-admin';
import { FirestorePersistence } from './firestorePersistence';

const hasEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

describe.skipIf(!hasEmulator)('FirestorePersistence (emulator)', () => {
  beforeAll(() => {
    if (admin.apps.length === 0) {
      admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? 'ti-training-test' });
    }
  });

  it('enforces append-only event create semantics', async () => {
    const persistence = new FirestorePersistence(admin.firestore());
    const event = {
      eventType: 'DECISION_REJECTED' as const,
      eventId: `evt-${Date.now()}`,
      tenantId: 'tenant-emulator',
      timestamp: new Date().toISOString(),
      profileHash: 'profile-hash',
      sessionId: 'session-1',
      nodeId: 'node-1',
      turnId: 1,
      correlationId: 'corr-1',
      scenarioId: 'scenario-1',
      reason: 'INVALID_NODE',
    };

    await persistence.appendEvent(event);
    await expect(persistence.appendEvent(event)).rejects.toThrowError();
  });
});
