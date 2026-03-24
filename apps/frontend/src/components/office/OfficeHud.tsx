'use client';

import Link from 'next/link';
import type { OfficeLocationEntry } from '@/lib/officeLocations';
import { OFFICE_LOCATION_ORDER } from '@/lib/officeLocations';

function formatClock(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export interface OfficeHudProps {
  entry: OfficeLocationEntry;
  now: Date;
  onFocusTasks: () => void;
  onFocusPhone: () => void;
}

export function OfficeHud({ entry, now, onFocusTasks, onFocusPhone }: OfficeHudProps) {
  const metrics = entry.hudMetrics ?? {};
  const currentIndex = OFFICE_LOCATION_ORDER.indexOf(entry.id);
  const nextId = OFFICE_LOCATION_ORDER[(currentIndex + 1) % OFFICE_LOCATION_ORDER.length];

  return (
    <>
      <div
        className="pointer-events-auto fixed right-4 top-4 z-30 flex max-w-[min(100vw-2rem,20rem)] flex-col items-end gap-2 motion-safe:transition-opacity"
        data-testid="office-hud"
      >
        <div className="flex flex-wrap justify-end gap-2 rounded-2xl border border-white/10 bg-black/55 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-md">
          {metrics.showLevel ? (
            <span className="inline-flex items-center gap-1 font-semibold">
              <span className="text-sky-300" aria-hidden>
                ◆
              </span>
              Level 1
            </span>
          ) : null}
          {metrics.showCurrency ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">$100</span>
          ) : null}
          {metrics.showTrophy ? (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-200">0</span>
          ) : null}
        </div>
        <div
          className="rounded-2xl border border-white/10 bg-black/60 px-4 py-2 text-lg font-bold tabular-nums text-white shadow-lg backdrop-blur-md"
          data-testid="office-hud-clock"
        >
          {formatClock(now)}
        </div>
        <p className="max-w-[12rem] text-right text-[10px] leading-snug text-white/70">
          {entry.title}
        </p>
      </div>

      <div className="pointer-events-auto fixed bottom-4 left-4 z-30 flex flex-col gap-2">
        <button
          type="button"
          data-testid="hud-shortcut-tasks"
          onClick={onFocusTasks}
          className="rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-left text-xs font-medium text-white shadow-md backdrop-blur-md hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
        >
          <span className="rounded border border-white/30 bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">
            Alt
          </span>
          <span className="mx-1">+</span>
          <span className="rounded border border-white/30 bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">
            T
          </span>
          <span className="ml-2">Tasks</span>
        </button>
        <button
          type="button"
          data-testid="hud-shortcut-phone"
          onClick={onFocusPhone}
          className="rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-left text-xs font-medium text-white shadow-md backdrop-blur-md hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
        >
          <span className="rounded border border-white/30 bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">
            Alt
          </span>
          <span className="mx-1">+</span>
          <span className="rounded border border-white/30 bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">
            P
          </span>
          <span className="ml-2">Phone</span>
        </button>
        <Link
          href={`/office/${nextId}`}
          data-testid="hud-nav-next"
          className="rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur-md hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
        >
          Next room →
        </Link>
      </div>
    </>
  );
}
