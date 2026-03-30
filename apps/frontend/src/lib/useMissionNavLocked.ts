'use client';

import { isPlatformMissionsEnabled } from '@/lib/featureFlags';
import { useMissionStore } from '@/lib/missionStore';
import { usePrototypeMissionStore } from '@/lib/ui-prototype/prototypeMissionStore';

/**
 * True while the learner has an active (non-terminal) mission — used to lock AppShell nav and show cancel.
 */
export function useMissionNavLocked(): boolean {
  const platform = isPlatformMissionsEnabled();
  const prototypeMission = usePrototypeMissionStore((s) => s.missionState);
  const platformMission = useMissionStore((s) => s.missionState);

  const missionState = platform ? platformMission : prototypeMission;
  return missionState !== null && !missionState.isTerminal;
}
