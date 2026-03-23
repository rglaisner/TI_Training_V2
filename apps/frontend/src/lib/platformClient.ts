import type {
  ApiError,
  DecisionRequest,
  DecisionResponse,
  MentorRequest,
  MentorResponse,
  MissionState,
  StartMissionRequest,
} from '@ti-training/shared';
import {
  ApiErrorSchema,
  DecisionResponseSchema,
  MentorResponseSchema,
  StartMissionResponseSchema,
} from '@ti-training/shared';
import { getAuth } from 'firebase/auth';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

class PlatformClientError extends Error {
  constructor(
    message: string,
    public readonly apiError?: ApiError,
  ) {
    super(message);
    this.name = 'PlatformClientError';
  }
}

async function safeJson(response: Response): Promise<unknown> {
  const text = await response.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Invalid JSON response (status ${response.status})`);
  }
}

async function buildHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  try {
    const user = getAuth().currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers.authorization = `Bearer ${token}`;
    }
  } catch {
    // Firebase auth may not be initialized in local deterministic tests.
  }
  return headers;
}

async function parseError(response: Response, fallback: string): Promise<never> {
  const payload = await safeJson(response).catch(() => undefined);
  const parsed = ApiErrorSchema.safeParse(payload);
  if (parsed.success) {
    throw new PlatformClientError(parsed.data.message, parsed.data);
  }
  throw new PlatformClientError(fallback);
}

export const PlatformClient = {
  async startMission(request: StartMissionRequest): Promise<MissionState> {
    const response = await fetch(`${apiBaseUrl}/api/missions/start`, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return parseError(response, 'Start mission failed');
    }

    const payload = StartMissionResponseSchema.parse(await safeJson(response));
    return payload.missionState;
  },

  async submitDecision(request: DecisionRequest): Promise<MissionState> {
    const response = await fetch(`${apiBaseUrl}/api/missions/decision`, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return parseError(response, 'Decision submit failed');
    }

    const payload: DecisionResponse = DecisionResponseSchema.parse(
      await safeJson(response),
    );
    return payload.missionState;
  },

  async invokeMentor(request: MentorRequest): Promise<MentorResponse> {
    const response = await fetch(`${apiBaseUrl}/api/missions/mentor`, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return parseError(response, 'Mentor invocation failed');
    }

    return MentorResponseSchema.parse(await safeJson(response));
  },
};

export { PlatformClientError };

