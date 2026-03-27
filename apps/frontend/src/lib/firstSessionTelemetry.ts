export type FirstSessionEventName =
  | 'first_session_loaded'
  | 'first_interaction'
  | 'scenario_start_clicked'
  | 'mentor_invoked'
  | 'mentor_feedback_rated'
  | 'mission_completed'
  | 'next_mission_selected';

export interface FirstSessionEventPayload {
  event: FirstSessionEventName;
  timestamp: string;
  missionId?: string;
  detail?: string;
  value?: number;
}

const STORAGE_KEY = 'ti.firstSession.events';
const MAX_EVENTS = 50;

function readEvents(): FirstSessionEventPayload[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is FirstSessionEventPayload => {
      if (!item || typeof item !== 'object') {
        return false;
      }
      const candidate = item as Partial<FirstSessionEventPayload>;
      return typeof candidate.event === 'string' && typeof candidate.timestamp === 'string';
    });
  } catch {
    return [];
  }
}

function saveEvents(events: readonly FirstSessionEventPayload[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  const clipped = events.slice(-MAX_EVENTS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clipped));
}

export function trackFirstSessionEvent(event: Omit<FirstSessionEventPayload, 'timestamp'>): void {
  if (typeof window === 'undefined') {
    return;
  }
  const payload: FirstSessionEventPayload = {
    ...event,
    timestamp: new Date().toISOString(),
  };
  const events = [...readEvents(), payload];
  saveEvents(events);
  console.info({
    event: 'FIRST_SESSION_TELEMETRY',
    payload,
  });
}

