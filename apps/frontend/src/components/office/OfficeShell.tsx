'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { OfficeLocationEntry } from '@/lib/officeLocations';
import { OfficeContentStage } from './OfficeContentStage';

export interface OfficeShellProps {
  entry: OfficeLocationEntry;
  children: ReactNode;
}

export function OfficeShell({ entry, children }: OfficeShellProps) {
  const [backgroundFailed, setBackgroundFailed] = useState(false);

  useEffect(() => {
    setBackgroundFailed(false);
  }, [entry.backgroundSrc]);

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

      <OfficeContentStage variant={entry.stageVariant} ariaLabel={entry.stageAriaLabel}>
        {children}
      </OfficeContentStage>
    </div>
  );
}
