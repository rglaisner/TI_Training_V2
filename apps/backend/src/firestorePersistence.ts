import type { Firestore } from 'firebase-admin/firestore';
import type { MissionEvent, MissionState, ProfileMetrics } from '@ti-training/shared';
import { ProfileMetricsSchema } from '@ti-training/shared';
import type { MissionPersistence, SessionRecord } from './persistence';
import { SessionRecordSchema } from './sessionRecordSchema';
import { createDefaultProfileMetrics } from './domain';

function cacheId(sessionId: string, nodeId: string, clientSubmissionId: string): string {
  return `${sessionId}__${nodeId}__${clientSubmissionId}`;
}

/** Firestore ignores or rejects `undefined`; strip so we never write half-shaped session docs. */
function stripUndefinedDeep(value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item));
  }
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (child === undefined) {
      continue;
    }
    out[key] = stripUndefinedDeep(child);
  }
  return out;
}

function tenantCollection(db: Firestore, tenantId: string, name: string) {
  return db.collection('tenants').doc(tenantId).collection(name);
}

export class FirestorePersistence implements MissionPersistence {
  constructor(private readonly db: Firestore) {}

  /**
   * Firestore may contain partial/corrupted profile documents.
   * We must normalize before trusting the values for arithmetic / persistence.
   */
  private normalizeProfileMetrics(profile: ProfileMetrics): ProfileMetrics {
    const defaults = createDefaultProfileMetrics();

    const safeNumber = (n: unknown): number => {
      return typeof n === 'number' && Number.isFinite(n) ? n : 0;
    };

    return {
      ...defaults,
      ...profile,
      totalXP: safeNumber(profile.totalXP),
      categoryScores: {
        ...defaults.categoryScores,
        ...profile.categoryScores,
      },
      categoryXP: {
        ...defaults.categoryXP,
        ...profile.categoryXP,
      },
      competencies: {
        ...defaults.competencies,
        ...profile.competencies,
      },
      labelsOfExcellence: Array.isArray(profile.labelsOfExcellence) ? profile.labelsOfExcellence : [],
      activeCosmetics: Array.isArray(profile.activeCosmetics) ? profile.activeCosmetics : [],
    };
  }

  async getSession(tenantId: string, sessionId: string): Promise<SessionRecord | null> {
    const doc = await tenantCollection(this.db, tenantId, 'sessions').doc(sessionId).get();
    if (!doc.exists) {
      return null;
    }
    const parsed = SessionRecordSchema.safeParse(doc.data());
    if (!parsed.success) {
      console.error({
        event: 'SESSION_FIRESTORE_SHAPE_INVALID',
        tenantId,
        sessionId,
        issues: parsed.error.issues,
      });
      return null;
    }
    // Normalize numeric fields (especially against NaN/Infinity) so arithmetic & Firestore writes never crash.
    return {
      ...parsed.data,
      profileMetrics: this.normalizeProfileMetrics(parsed.data.profileMetrics),
    };
  }

  async upsertSession(record: SessionRecord): Promise<void> {
    const payload = stripUndefinedDeep({
      ...record,
      profileMetrics: this.normalizeProfileMetrics(record.profileMetrics),
    }) as Record<string, unknown>;
    await tenantCollection(this.db, record.tenantId, 'sessions')
      .doc(record.sessionId)
      .set(payload, { merge: false });
  }

  async getProfile(tenantId: string, userId: string): Promise<ProfileMetrics | null> {
    const doc = await tenantCollection(this.db, tenantId, 'profiles').doc(userId).get();
    if (!doc.exists) {
      return null;
    }
    const raw: unknown = doc.data();
    const parsed = ProfileMetricsSchema.safeParse(raw);
    if (!parsed.success) {
      console.error({
        event: 'PROFILE_FIRESTORE_SHAPE_INVALID',
        tenantId,
        userId,
        issues: parsed.error.issues,
      });
      return null;
    }
    return this.normalizeProfileMetrics(parsed.data);
  }

  async upsertProfile(
    tenantId: string,
    userId: string,
    profile: ProfileMetrics,
  ): Promise<void> {
    const payload = stripUndefinedDeep(profile) as Record<string, unknown>;
    await tenantCollection(this.db, tenantId, 'profiles').doc(userId).set(payload, {
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
    const payload = stripUndefinedDeep({ missionState }) as Record<string, unknown>;
    await tenantCollection(this.db, tenantId, 'decision_cache')
      .doc(id)
      .set(payload, { merge: false });
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
    const payload = stripUndefinedDeep({ missionState }) as Record<string, unknown>;
    await tenantCollection(this.db, tenantId, 'mentor_cache')
      .doc(id)
      .set(payload, { merge: false });
  }
}
