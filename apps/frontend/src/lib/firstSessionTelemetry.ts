import type { FirstSessionEventName } from '@ti-training/shared';
import { PlatformClient } from './platformClient';

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

export async function flushFirstSessionTelemetry(sessionId?: string): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  const events = readEvents();
  if (events.length === 0) {
    return;
  }
  try {
    await PlatformClient.ingestFirstSessionTelemetry({
      sessionId,
      events,
    });
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Keep events locally; caller can retry later.
  }
}

