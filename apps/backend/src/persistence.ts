import type {
  MissionEvent,
  MissionState,
  ProfileMetrics,
} from '@ti-training/shared';

export interface SessionRecord {
  tenantId: string;
  userId: string;
  scenarioId: string;
  sessionId: string;
  currentNodeId: string;
  currentNodeType: 'branching' | 'open_input';
  isTerminal: boolean;
  turnId: number;
  profileMetrics: ProfileMetrics;
}

export interface MissionPersistence {
  getSession(tenantId: string, sessionId: string): Promise<SessionRecord | null>;
  upsertSession(record: SessionRecord): Promise<void>;
  getProfile(tenantId: string, userId: string): Promise<ProfileMetrics | null>;
  upsertProfile(tenantId: string, userId: string, profile: ProfileMetrics): Promise<void>;
  appendEvent(event: MissionEvent): Promise<void>;
  listEvents(tenantId: string, filters?: {
    profileHash?: string;
    scenarioId?: string;
    nodeId?: string;
    from?: string;
    to?: string;
  }): Promise<MissionEvent[]>;
  getCachedDecision(
    tenantId: string,
    sessionId: string,
    nodeId: string,
    clientSubmissionId: string,
  ): Promise<MissionState | null>;
  setCachedDecision(
    tenantId: string,
    sessionId: string,
    nodeId: string,
    clientSubmissionId: string,
    missionState: MissionState,
  ): Promise<void>;
  getCachedMentor(
    tenantId: string,
    sessionId: string,
    nodeId: string,
    clientSubmissionId: string,
  ): Promise<MissionState | null>;
  setCachedMentor(
    tenantId: string,
    sessionId: string,
    nodeId: string,
    clientSubmissionId: string,
    missionState: MissionState,
  ): Promise<void>;
}

function makeCacheKey(
  tenantId: string,
  sessionId: string,
  nodeId: string,
  clientSubmissionId: string,
): string {
  return `${tenantId}:${sessionId}:${nodeId}:${clientSubmissionId}`;
}

export class InMemoryPersistence implements MissionPersistence {
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly profiles = new Map<string, ProfileMetrics>();
  private readonly events = new Map<string, MissionEvent>();
  private readonly decisionCache = new Map<string, MissionState>();
  private readonly mentorCache = new Map<string, MissionState>();

  async getSession(tenantId: string, sessionId: string): Promise<SessionRecord | null> {
    return this.sessions.get(`${tenantId}:${sessionId}`) ?? null;
  }

  async upsertSession(record: SessionRecord): Promise<void> {
    this.sessions.set(`${record.tenantId}:${record.sessionId}`, record);
  }

  async getProfile(tenantId: string, userId: string): Promise<ProfileMetrics | null> {
    return this.profiles.get(`${tenantId}:${userId}`) ?? null;
  }

  async upsertProfile(
    tenantId: string,
    userId: string,
    profile: ProfileMetrics,
  ): Promise<void> {
    this.profiles.set(`${tenantId}:${userId}`, profile);
  }

  async appendEvent(event: MissionEvent): Promise<void> {
    const key = `${event.tenantId}:${event.eventId}`;
    if (this.events.has(key)) {
      throw new Error('event append-only violation');
    }
    this.events.set(key, event);
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
    const events = [...this.events.values()].filter((event) => event.tenantId === tenantId);
    return events.filter((event) => {
      if (filters?.profileHash && event.profileHash !== filters.profileHash) {
        return false;
      }
      if (filters?.scenarioId && event.scenarioId !== filters.scenarioId) {
        return false;
      }
      if (filters?.nodeId && event.nodeId !== filters.nodeId) {
        return false;
      }
      if (filters?.from && event.timestamp < filters.from) {
        return false;
      }
      if (filters?.to && event.timestamp > filters.to) {
        return false;
      }
      return true;
    });
  }

  async getCachedDecision(
    tenantId: string,
    sessionId: string,
    nodeId: string,
    clientSubmissionId: string,
  ): Promise<MissionState | null> {
    const key = makeCacheKey(tenantId, sessionId, nodeId, clientSubmissionId);
    return this.decisionCache.get(key) ?? null;
  }

  async setCachedDecision(
    tenantId: string,
    sessionId: string,
    nodeId: string,
    clientSubmissionId: string,
    missionState: MissionState,
  ): Promise<void> {
    const key = makeCacheKey(tenantId, sessionId, nodeId, clientSubmissionId);
    if (!this.decisionCache.has(key)) {
      this.decisionCache.set(key, missionState);
    }
  }

  async getCachedMentor(
    tenantId: string,
    sessionId: string,
    nodeId: string,
    clientSubmissionId: string,
  ): Promise<MissionState | null> {
    const key = makeCacheKey(tenantId, sessionId, nodeId, clientSubmissionId);
    return this.mentorCache.get(key) ?? null;
  }

  async setCachedMentor(
    tenantId: string,
    sessionId: string,
    nodeId: string,
    clientSubmissionId: string,
    missionState: MissionState,
  ): Promise<void> {
    const key = makeCacheKey(tenantId, sessionId, nodeId, clientSubmissionId);
    if (!this.mentorCache.has(key)) {
      this.mentorCache.set(key, missionState);
    }
  }
}
