'use client';

import MissionDashboard from '@/components/mission/MissionDashboard';
import { PrototypeMissionWorkspace } from '@/components/ui-prototype/PrototypeMissionWorkspace';
import { isPlatformMissionsEnabled } from '@/lib/featureFlags';

/** Picks mock mission workspace vs backend-connected `MissionDashboard` (see `NEXT_PUBLIC_USE_PLATFORM_MISSIONS`). */
export function MissionsWorkspaceClient() {
  if (isPlatformMissionsEnabled()) {
    return <MissionDashboard layout="consumer" />;
  }
  return <PrototypeMissionWorkspace />;
}
