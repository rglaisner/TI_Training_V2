'use client';

import type { ReactNode } from 'react';
import type { StageVariant } from '@/lib/officeLocations';

export interface OfficeContentStageProps {
  variant: StageVariant;
  ariaLabel: string;
  children: ReactNode;
}

export function OfficeContentStage({ variant, ariaLabel, children }: OfficeContentStageProps) {
  if (variant === 'monitor') {
    return (
      <div className="relative z-10 flex min-h-[100dvh] flex-col px-3 pb-6 pt-16 sm:px-6 sm:pt-20">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-end pb-6 sm:pb-10">
          <div
            className="relative w-full max-w-5xl rounded-xl border-[10px] border-[#0a0a0c] bg-[#0a0a0c] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_80px_rgba(0,0,0,0.65)] motion-safe:transition-transform"
            data-testid="office-stage-monitor"
          >
            <div
              className="pointer-events-auto relative flex aspect-video w-full min-h-0 flex-col overflow-hidden rounded-md bg-zinc-950 ring-1 ring-white/10"
              role="region"
              aria-label={ariaLabel}
              data-testid="office-primary-stage"
              id="office-primary-stage"
            >
              <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'videoTiles') {
    return (
      <div className="relative z-10 flex min-h-[100dvh] flex-col px-3 pb-28 pt-20 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
          <div
            className="pointer-events-auto flex aspect-video items-center justify-center rounded-xl border border-white/10 bg-black/45 text-sm text-zinc-300 backdrop-blur-md motion-safe:transition-opacity lg:aspect-auto lg:min-h-[140px]"
            data-testid="office-video-tile-peer-a"
          >
            Teammate A
          </div>
          <div
            className="pointer-events-auto flex min-h-[min(50vh,420px)] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 shadow-xl backdrop-blur-md"
            role="region"
            aria-label={ariaLabel}
            data-testid="office-primary-stage"
            id="office-primary-stage"
          >
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </div>
          <div
            className="pointer-events-auto flex aspect-video items-center justify-center rounded-xl border border-white/10 bg-black/45 text-sm text-zinc-300 backdrop-blur-md motion-safe:transition-opacity lg:aspect-auto lg:min-h-[140px]"
            data-testid="office-video-tile-peer-b"
          >
            Teammate B
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex min-h-[100dvh] flex-col px-3 pb-24 pt-20 sm:px-8">
      <div
        className="pointer-events-auto mx-auto mt-2 w-full max-w-4xl flex-1 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/90 shadow-2xl backdrop-blur-md"
        role="region"
        aria-label={ariaLabel}
        data-testid="office-primary-stage"
        id="office-primary-stage"
      >
        <div className="h-full max-h-[min(78vh,820px)] overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
