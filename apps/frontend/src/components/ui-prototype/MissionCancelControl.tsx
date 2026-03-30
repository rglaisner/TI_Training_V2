'use client';

import { useRef } from 'react';
import { isPlatformMissionsEnabled } from '@/lib/featureFlags';
import { useMissionStore } from '@/lib/missionStore';
import { usePrototypeMissionStore } from '@/lib/ui-prototype/prototypeMissionStore';

export interface MissionCancelControlProps {
  /** Main app header vs missions workspace strip. */
  variant: 'header' | 'workspace';
}

/** Exit affordance with confirm dialog — clears prototype mission state on confirm. */
export function MissionCancelControl({ variant }: MissionCancelControlProps) {
  const resetPrototypeMission = usePrototypeMissionStore((s) => s.resetMission);
  const resetPlatformMission = useMissionStore((s) => s.resetMission);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openModal = (): void => {
    dialogRef.current?.showModal();
  };

  const closeModal = (): void => {
    dialogRef.current?.close();
  };

  const confirmExit = (): void => {
    if (isPlatformMissionsEnabled()) {
      resetPlatformMission();
    } else {
      resetPrototypeMission();
    }
    closeModal();
  };

  const isHeader = variant === 'header';

  return (
    <>
      <button
        type="button"
        data-testid="mission-cancel-open"
        onClick={openModal}
        className={
          isHeader
            ? 'rounded-md border border-red-900/60 bg-red-950/40 px-3 py-1 text-xs font-medium text-red-100 hover:bg-red-950/70'
            : 'rounded-md border border-red-900/60 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-100 hover:bg-red-950/70'
        }
      >
        Cancel mission
      </button>

      <dialog
        ref={dialogRef}
        className="max-w-md rounded-xl border border-zinc-600 bg-zinc-900 p-6 text-zinc-100 shadow-xl [&::backdrop]:bg-black/70"
        aria-labelledby="mission-cancel-title"
      >
        <h2 id="mission-cancel-title" className="text-lg font-semibold text-white">
          Leave this mission?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          If you exit now, you will lose your progress on this run. You can start this scenario again later from the
          mission list.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            data-testid="mission-cancel-stay"
            className="rounded-md border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700"
            onClick={closeModal}
          >
            Stay on mission
          </button>
          <button
            type="button"
            data-testid="mission-cancel-confirm"
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            onClick={confirmExit}
          >
            Exit mission
          </button>
        </div>
      </dialog>
    </>
  );
}
