import type { Firestore } from 'firebase-admin/firestore';
import type { MissionEvent, MissionState, ProfileMetrics } from '@ti-training/shared';
import type { MissionPersistence, SessionRecord } from './persistence';

function cacheId(sessionId: string, nodeId: string, clientSubmissionId: string): string {
  return `${sessionId}__${nodeId}__${clientSubmissionId}`;
}

function tenantCollection(db: Firestore, tenantId: string, name: string) {
  return db.collection('tenants').doc(tenantId).collection(name);
}

export class FirestorePersistence implements MissionPersistence {
  constructor(private readonly db: Firestore) {}

  async getSession(tenantId: string, sessionId: string): Promise<SessionRecord | null> {
    const doc = await tenantCollection(this.db, tenantId, 'sessions').doc(sessionId).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as SessionRecord;
  }

  async upsertSession(record: SessionRecord): Promise<void> {
    await tenantCollection(this.db, record.tenantId, 'sessions')
      .doc(record.sessionId)
      .set(record, { merge: true });
  }

  async getProfile(tenantId: string, userId: string): Promise<ProfileMetrics | null> {
    const doc = await tenantCollection(this.db, tenantId, 'profiles').doc(userId).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as ProfileMetrics;
  }

  async upsertProfile(
    tenantId: string,
    userId: string,
    profile: ProfileMetrics,
  ): Promise<void> {
    await tenantCollection(this.db, tenantId, 'profiles').doc(userId).set(profile, {
      merge: true,
    });
  }

  async appendEvent(event: MissionEvent): Promise<void> {
    await tenantCollection(this.db, event.tenantId, 'events')
      .doc(event.eventId)
      .create(event);
  }

  async listEvents(
    tenantId: string,
    filters?: {
      profileHash?: string;
      scenarioId?: string;
      nodeId?: string;
      from?: string;
      to?: string;
    },
  ): Promise<MissionEvent[]> {
    let query = tenantCollection(this.db, tenantId, 'events').orderBy('timestamp', 'desc');
    if (filters?.profileHash) {
      query = query.where('profileHash', '==', filters.profileHash);
    }
    if (filters?.scenarioId) {
      query = query.where('scenarioId', '==', filters.scenarioId);
    }
    if (filters?.nodeId) {
      query = query.where('nodeId', '==', filters.nodeId);
    }
    if (filters?.from) {
      query = query.where('timestamp', '>=', filters.from);
    }
    if (filters?.to) {
      query = query.where('timestamp', '<=', filters.to);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as MissionEvent);
  }

  async getCachedDecision(
    tenantId: string,
    sessionId: string,
    nodeId: string,
    clientSubmissionId: string,
  ): Promise<MissionState | null> {
    const id = cacheId(sessionId, nodeId, clientSubmissionId);
    const doc = await tenantCollection(this.db, tenantId, 'decision_cache').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data()?.missionState as MissionState;
  }

  async setCachedDecision(
    tenantId: string,
    sessionId: string,
    nodeId: string,
    clientSubmissionId: string,
    missionState: MissionState,
  ): Promise<void> {
    const id = cacheId(sessionId, nodeId, clientSubmissionId);
    await tenantCollection(this.db, tenantId, 'decision_cache')
      .doc(id)
      .set({ missionState }, { merge: false });
  }

  async getCachedMentor(
    tenantId: string,
    sessionId: string,
    nodeId: string,
    clientSubmissionId: string,
  ): Promise<MissionState | null> {
    const id = cacheId(sessionId, nodeId, clientSubmissionId);
    const doc = await tenantCollection(this.db, tenantId, 'mentor_cache').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data()?.missionState as MissionState;
  }

  async setCachedMentor(
    tenantId: string,
    sessionId: string,
    nodeId: string,
    clientSubmissionId: string,
    missionState: MissionState,
  ): Promise<void> {
    const id = cacheId(sessionId, nodeId, clientSubmissionId);
    await tenantCollection(this.db, tenantId, 'mentor_cache')
      .doc(id)
      .set({ missionState }, { merge: false });
  }
}
