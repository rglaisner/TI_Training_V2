import type {
  ApiError,
  AvailableScenariosResponse,
  DecisionRequest,
  DecisionResponse,
  MentorRequest,
  MentorResponse,
  MissionState,
  StartMissionRequest,
  TrackerSummaryResponse,
} from '@ti-training/shared';
import {
  ApiErrorSchema,
  AvailableScenariosResponseSchema,
  DecisionResponseSchema,
  MentorResponseSchema,
  StartMissionResponseSchema,
  TrackerSummaryResponseSchema,
} from '@ti-training/shared';
import { getFirebaseAuth } from './firebaseClient';

const apiBaseUrl =
  typeof process.env.NEXT_PUBLIC_API_BASE_URL === 'string' && process.env.NEXT_PUBLIC_API_BASE_URL.trim().length > 0
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : 'http://localhost:4000';

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

function isBrowserTestAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_TEST_AUTH === 'true';
}

function appendTestAuthHeaders(headers: Record<string, string>): void {
  if (!isBrowserTestAuthEnabled()) {
    return;
  }
  const tenantId = process.env.NEXT_PUBLIC_TEST_TENANT_ID ?? 'dev-tenant';
  const userId = process.env.NEXT_PUBLIC_TEST_USER_ID ?? 'dev-user';
  const role =
    process.env.NEXT_PUBLIC_TEST_ROLE === 'tenant_admin' ? 'tenant_admin' : 'tenant_user';
  headers['x-tenant-id'] = tenantId;
  headers['x-user-id'] = userId;
  headers['x-role'] = role;
}

async function buildHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  appendTestAuthHeaders(headers);
  try {
    const user = getFirebaseAuth().currentUser;
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

  async getAvailableScenarios(): Promise<AvailableScenariosResponse> {
    const response = await fetch(`${apiBaseUrl}/api/scenarios/available`, {
      method: 'GET',
      headers: await buildHeaders(),
    });

    if (!response.ok) {
      return parseError(response, 'Available scenarios fetch failed');
    }

    return AvailableScenariosResponseSchema.parse(await safeJson(response));
  },

  async submitDecision(request: DecisionRequest): Promise<DecisionResponse> {
    const response = await fetch(`${apiBaseUrl}/api/missions/decision`, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return parseError(response, 'Decision submit failed');
    }

    return DecisionResponseSchema.parse(await safeJson(response));
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

  async getTrackerSummary(): Promise<TrackerSummaryResponse> {
    const response = await fetch(`${apiBaseUrl}/api/missions/tracker/summary`, {
      method: 'GET',
      headers: await buildHeaders(),
    });

    if (!response.ok) {
      return parseError(response, 'Tracker summary failed');
    }

    const raw = await safeJson(response);
    const parsed = TrackerSummaryResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error({
        event: 'TRACKER_SUMMARY_VALIDATION_FAILED',
        issues: parsed.error.issues,
      });
      throw new PlatformClientError('Tracker summary response failed validation.');
    }
    return parsed.data;
  },
};

export { PlatformClientError };

