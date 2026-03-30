import type {
  ApiError,
  AvailableScenariosResponse,
  DecisionRequest,
  DecisionResponse,
  FirstSessionTelemetryIngestRequest,
  FirstSessionTelemetryIngestResponse,
  MentorRequest,
  MentorFeedbackRequest,
  MentorFeedbackResponse,
  MentorResponse,
  MissionState,
  ScenarioRolloutGetResponse,
  ScenarioRolloutSaveRequest,
  ScenarioRolloutSaveResponse,
  StartMissionRequest,
  TrackerSummaryResponse,
} from '@ti-training/shared';
import {
  ApiErrorSchema,
  AvailableScenariosResponseSchema,
  DecisionResponseSchema,
  FirstSessionTelemetryIngestResponseSchema,
  MentorFeedbackResponseSchema,
  MentorResponseSchema,
  ScenarioRolloutGetResponseSchema,
  ScenarioRolloutSaveRequestSchema,
  ScenarioRolloutSaveResponseSchema,
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

function mapApiMessage(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('missing tenantid') || normalized.includes('custom claim')) {
    return 'Signed in, but this account is not provisioned for a tenant yet. Ask an admin to apply Firebase tenant claims.';
  }
  if (normalized.includes('authorization token is required')) {
    if (isBrowserTestAuthEnabled()) {
      return (
        'The API refused the request (it wants a Bearer token). You have frontend test-auth on, so either: (1) set USE_TEST_AUTH=true in apps/backend/.env.local and restart the backend, same port as NEXT_PUBLIC_API_BASE_URL; or (2) turn OFF NEXT_PUBLIC_USE_TEST_AUTH and use Firebase sign-in instead. The scenario cards you see may be offline fallbacks, not a live list.'
      );
    }
    return 'Sign in is required before this action can continue.';
  }
  return message;
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
  const status = response.status;
  let text = '';
  try {
    text = await response.text();
  } catch {
    // ignore; we'll log fallback without body
  }

  const snippet = text
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);

  let payload: unknown = undefined;
  if (text.trim().length > 0) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = undefined;
    }
  }

  const parsed = ApiErrorSchema.safeParse(payload);
  if (parsed.success) {
    throw new PlatformClientError(mapApiMessage(parsed.data.message), parsed.data);
  }

  console.error({
    event: 'PLATFORMCLIENT_API_ERROR_UNPARSEABLE',
    status,
    fallback,
    bodySnippet: text.slice(0, 500),
  });

  throw new PlatformClientError(
    snippet.length > 0 ? `${fallback} (HTTP ${status}): ${snippet}` : `${fallback} (HTTP ${status})`,
  );
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
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(`${apiBaseUrl}/api/scenarios/available`, {
        method: 'GET',
        headers: await buildHeaders(),
        signal: controller.signal,
      });

      if (!response.ok) {
        return parseError(response, 'Available scenarios fetch failed');
      }

      return AvailableScenariosResponseSchema.parse(await safeJson(response));
    } catch (error: unknown) {
      const name = error instanceof Error ? error.name : undefined;
      const msg = error instanceof Error ? error.message : undefined;
      if (name === 'AbortError' || (msg ?? '').toLowerCase().includes('abort')) {
        throw new PlatformClientError('Available scenarios fetch timed out');
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
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

  async submitMentorFeedback(request: MentorFeedbackRequest): Promise<MentorFeedbackResponse> {
    const response = await fetch(`${apiBaseUrl}/api/missions/mentor/feedback`, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return parseError(response, 'Mentor feedback submission failed');
    }

    return MentorFeedbackResponseSchema.parse(await safeJson(response));
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

  async ingestFirstSessionTelemetry(
    request: FirstSessionTelemetryIngestRequest,
  ): Promise<FirstSessionTelemetryIngestResponse> {
    const response = await fetch(`${apiBaseUrl}/api/telemetry/first-session`, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return parseError(response, 'First-session telemetry ingest failed');
    }

    return FirstSessionTelemetryIngestResponseSchema.parse(await safeJson(response));
  },

  async getAdminTenantOverview(): Promise<{ tenantId: string; totalEvents: number; byType: Record<string, number> }> {
    const response = await fetch(`${apiBaseUrl}/api/admin/tracker/tenant-overview`, {
      method: 'GET',
      headers: await buildHeaders(),
    });
    if (!response.ok) {
      return parseError(response, 'Admin tenant overview failed');
    }
    const payload = (await safeJson(response)) as unknown;
    if (!payload || typeof payload !== 'object') {
      throw new PlatformClientError('Admin tenant overview response failed validation.');
    }
    return payload as { tenantId: string; totalEvents: number; byType: Record<string, number> };
  },

  async getAdminCohorts(): Promise<{ cohorts: Array<{ profileHash: string; eventCount: number }> }> {
    const response = await fetch(`${apiBaseUrl}/api/admin/tracker/cohorts`, {
      method: 'GET',
      headers: await buildHeaders(),
    });
    if (!response.ok) {
      return parseError(response, 'Admin cohorts failed');
    }
    const payload = (await safeJson(response)) as unknown;
    if (!payload || typeof payload !== 'object') {
      throw new PlatformClientError('Admin cohorts response failed validation.');
    }
    return payload as { cohorts: Array<{ profileHash: string; eventCount: number }> };
  },

  async getAdminEventsCsv(): Promise<string> {
    const response = await fetch(`${apiBaseUrl}/api/admin/tracker/events/export.csv`, {
      method: 'GET',
      headers: await buildHeaders(),
    });
    if (!response.ok) {
      return parseError(response, 'Admin events export failed');
    }
    return response.text();
  },

  async getScenarioRollout(): Promise<ScenarioRolloutGetResponse> {
    const response = await fetch(`${apiBaseUrl}/api/admin/scenario-rollout`, {
      method: 'GET',
      headers: await buildHeaders(),
    });
    if (!response.ok) {
      return parseError(response, 'Scenario rollout fetch failed');
    }
    const raw = await safeJson(response);
    const parsed = ScenarioRolloutGetResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error({
        event: 'SCENARIO_ROLLOUT_GET_VALIDATION_FAILED',
        issues: parsed.error.issues,
      });
      throw new PlatformClientError('Scenario rollout response failed validation.');
    }
    return parsed.data;
  },

  async saveScenarioRollout(requestBody: ScenarioRolloutSaveRequest): Promise<ScenarioRolloutSaveResponse> {
    const parsedBody = ScenarioRolloutSaveRequestSchema.safeParse(requestBody);
    if (!parsedBody.success) {
      console.error({
        event: 'SCENARIO_ROLLOUT_SAVE_REQUEST_INVALID',
        issues: parsedBody.error.issues,
      });
      throw new PlatformClientError('Scenario rollout save request failed validation.');
    }
    const response = await fetch(`${apiBaseUrl}/api/admin/scenario-rollout`, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify(parsedBody.data),
    });
    if (!response.ok) {
      return parseError(response, 'Scenario rollout save failed');
    }
    const raw = await safeJson(response);
    const parsed = ScenarioRolloutSaveResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error({
        event: 'SCENARIO_ROLLOUT_SAVE_RESPONSE_INVALID',
        issues: parsed.error.issues,
      });
      throw new PlatformClientError('Scenario rollout save response failed validation.');
    }
    return parsed.data;
  },
};

export { PlatformClientError };

