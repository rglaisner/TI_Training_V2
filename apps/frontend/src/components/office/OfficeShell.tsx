'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { OfficeLocationEntry } from '@/lib/officeLocations';
import { useOfficeChromeStore } from '@/lib/officeChromeStore';
import { OfficeContentStage } from './OfficeContentStage';
import { OfficeHud } from './OfficeHud';

export interface OfficeShellProps {
  entry: OfficeLocationEntry;
  children: ReactNode;
}

export function OfficeShell({ entry, children }: OfficeShellProps) {
  const compactUi = useOfficeChromeStore((s) => s.compactUi);
  const toggleCompactUi = useOfficeChromeStore((s) => s.toggleCompactUi);
  const [now, setNow] = useState(() => new Date());
  const [backgroundFailed, setBackgroundFailed] = useState(false);

  useEffect(() => {
    setBackgroundFailed(false);
  }, [entry.backgroundSrc]);

  const focusTasks = useCallback(() => {
    const el = document.querySelector<HTMLElement>('[data-office-focus="tasks"]');
    el?.focus();
  }, []);

  const focusPhone = useCallback(() => {
    const el = document.querySelector<HTMLElement>('[data-office-focus="phone"]');
    el?.focus();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.repeat) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;

      if (event.key === 't' || event.key === 'T') {
        event.preventDefault();
        focusTasks();
      }
      if (event.key === 'p' || event.key === 'P') {
        event.preventDefault();
        focusPhone();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusPhone, focusTasks]);

  if (compactUi) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <a
          href="#office-primary-stage"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-emerald-600 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to main content
        </a>
        <header className="border-b border-zinc-800 bg-zinc-950/95 px-4 py-3">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-zinc-400">{entry.title} — compact view</p>
            <button
              type="button"
              onClick={toggleCompactUi}
              data-testid="office-compact-toggle"
              className="rounded-md border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Show office chrome
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-5xl p-4" id="office-primary-stage" data-testid="office-primary-stage">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-black text-zinc-100">
      <a
        href="#office-primary-stage"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-emerald-600 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>

      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950"
          aria-hidden
        />
        {!backgroundFailed ? (
          // Plain <img>: user plates live in /public and may be missing locally; next/image treats 404 HTML as a hard error in dev.
          <img
            src={entry.backgroundSrc}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center motion-safe:transition-[transform,filter] motion-reduce:transition-none"
            onError={() => setBackgroundFailed(true)}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/50" aria-hidden />
      </div>

      <OfficeHud entry={entry} now={now} onFocusTasks={focusTasks} onFocusPhone={focusPhone} />

      <div className="pointer-events-auto fixed left-4 top-4 z-30 flex max-w-[min(100vw-8rem,14rem)] flex-col gap-2">
        <button
          type="button"
          onClick={toggleCompactUi}
          data-testid="office-compact-toggle"
          className="rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-left text-xs font-medium text-white shadow-md backdrop-blur-md hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
        >
          Classic UI (no chrome)
        </button>
      </div>

      <OfficeContentStage variant={entry.stageVariant} ariaLabel={entry.stageAriaLabel}>
        {children}
      </OfficeContentStage>
    </div>
  );
}
