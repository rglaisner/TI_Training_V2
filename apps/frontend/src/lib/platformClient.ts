import type {
  DecisionRequest,
  DecisionResponse,
  MentorRequest,
  MentorResponse,
  MissionState,
  StartMissionRequest,
} from '@ti-training/shared';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

async function safeJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response (status ${response.status})`);
  }
}

export const PlatformClient = {
  async startMission(request: StartMissionRequest): Promise<MissionState> {
    const response = await fetch(`${apiBaseUrl}/api/missions/start`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorPayload = await safeJson<{ message?: string }>(
        response,
      ).catch(() => ({ message: undefined }));
      throw new Error(errorPayload.message ?? `Start mission failed`);
    }

    const payload = await safeJson<{ missionState: MissionState }>(
      response,
    );
    return payload.missionState;
  },

  async submitDecision(request: DecisionRequest): Promise<MissionState> {
    const response = await fetch(`${apiBaseUrl}/api/missions/decision`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorPayload = await safeJson<{ message?: string }>(
        response,
      ).catch(() => ({ message: undefined }));
      throw new Error(errorPayload.message ?? `Decision submit failed`);
    }

    const payload = await safeJson<DecisionResponse>(response);
    return payload.missionState;
  },

  async invokeMentor(request: MentorRequest): Promise<MentorResponse> {
    const response = await fetch(`${apiBaseUrl}/api/missions/mentor`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorPayload = await safeJson<{ message?: string }>(
        response,
      ).catch(() => ({ message: undefined }));
      throw new Error(errorPayload.message ?? `Mentor invocation failed`);
    }

    return safeJson<MentorResponse>(response);
  },
};

