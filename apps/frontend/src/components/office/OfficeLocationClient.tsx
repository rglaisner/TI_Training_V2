'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { LocationId, OfficeLocationEntry } from '@/lib/officeLocations';
import { getOfficeLocationOrThrow, OFFICE_LOCATION_MANIFEST } from '@/lib/officeLocations';
import MissionDashboard from '@/components/mission/MissionDashboard';
import { PrototypeMissionWorkspace } from '@/components/ui-prototype/PrototypeMissionWorkspace';
import { isPlatformMissionsEnabled } from '@/lib/featureFlags';
import ChatStagePlaceholder from '@/components/office/ChatStagePlaceholder';
import { OfficeShell } from '@/components/office/OfficeShell';

const DESK_MISSION_IDS: readonly LocationId[] = ['desk', 'desk2', 'desk3'];

const CHAT_PLACEHOLDER_IDS: readonly LocationId[] = [
  'coffee',
  'lounge',
  'text_exchange',
  'meeting',
  'meeting2',
];

const PRESENTATION_INTRO_IDS: readonly LocationId[] = [
  'boardroom',
  'hr_expo',
  'hr_expo_2',
  'keynote_midsize',
  'keynote_midsize_2',
  'keynote_midsize_3',
  'keynote_master',
  'keynote_master_2',
  'keynote_master_3',
];

const MENTOR_INTRO_IDS: readonly LocationId[] = ['mentor_diner', 'mentor_outdoor', 'mentor_outdoor_2'];

const EXEC_1ON1_IDS: readonly LocationId[] = ['boss', 'boss2'];

const VIDEO_CALL_IDS: readonly LocationId[] = ['call', 'call2'];

function includesId(list: readonly LocationId[], id: LocationId): boolean {
  return list.includes(id);
}

function SimpleRoomIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4 bg-zinc-950/55 p-6 text-zinc-100 backdrop-blur-md">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/missions"
          className="inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          data-testid="office-link-missions"
        >
          Open missions workspace
        </Link>
        <Link
          href="/office/hub"
          className="inline-flex rounded-md border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
        >
          Office map
        </Link>
      </div>
    </div>
  );
}

const HUB_GROUPS: readonly { title: string; blurb: string; ids: readonly LocationId[] }[] = [
  {
    title: 'Arrival & mission control',
    blurb: 'Hub plus desk views — same mission HUD as /missions when on a desk plate.',
    ids: ['hub', 'desk', 'desk2', 'desk3'],
  },
  {
    title: 'Informal & async',
    blurb: 'Coworker chat, coffee-corner, async threads — tie to scenario beats in SCENARIOS.md.',
    ids: ['lounge', 'coffee', 'text_exchange'],
  },
  {
    title: 'Working sessions',
    blurb: 'Brainstorm / workshop rooms for mid-scenario collaboration moments.',
    ids: ['meeting', 'meeting2'],
  },
  {
    title: 'Executive & board',
    blurb: 'Readouts, 1:1s, and high-stakes presentations.',
    ids: ['boardroom', 'boss', 'boss2'],
  },
  {
    title: 'Remote live',
    blurb: 'Video calls when the scenario routes through remote participants.',
    ids: ['call', 'call2'],
  },
  {
    title: 'Mentor coaching',
    blurb: 'Mentor dialogue surfaces — pair with mentor invoke on the mission HUD.',
    ids: ['mentor_diner', 'mentor_outdoor', 'mentor_outdoor_2'],
  },
  {
    title: 'Events & keynotes',
    blurb: 'Expo floors and keynote venues for external-facing scenario arcs.',
    ids: [
      'hr_expo',
      'hr_expo_2',
      'keynote_midsize',
      'keynote_midsize_2',
      'keynote_midsize_3',
      'keynote_master',
      'keynote_master_2',
      'keynote_master_3',
    ],
  },
];

function HubNav() {
  const byId = new Map(OFFICE_LOCATION_MANIFEST.map((loc) => [loc.id, loc]));
  return (
    <div className="bg-zinc-950/55 p-6 text-zinc-100 backdrop-blur-md">
      <h1 className="text-xl font-semibold">Office hub</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Plates support in-scenario immersion (mentor, coworker chat, board readout, etc.). Mission HUD and scoring use the{' '}
        <Link href="/missions" className="text-emerald-400 hover:text-emerald-300">
          missions workspace
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/home"
          className="inline-flex rounded-lg border border-emerald-800/60 bg-emerald-950/30 px-4 py-2 text-sm font-medium text-emerald-100"
        >
          App home
        </Link>
        <Link
          href="/missions"
          className="inline-flex rounded-lg border border-emerald-700/50 bg-emerald-900/20 px-4 py-2 text-sm font-medium text-emerald-50"
        >
          Missions
        </Link>
      </div>
      <div className="mt-8 space-y-10">
        {HUB_GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="text-sm font-semibold text-zinc-200">{group.title}</h2>
            <p className="mt-1 text-xs text-zinc-500">{group.blurb}</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" data-testid="office-hub-nav">
              {group.ids.map((id) => {
                const loc = byId.get(id);
                if (!loc) {
                  return null;
                }
                return (
                  <li key={loc.id}>
                    <Link
                      href={`/office/${loc.id}`}
                      className="block rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm font-medium text-zinc-200 hover:border-emerald-700/50 hover:bg-zinc-900"
                    >
                      {loc.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <div className="mt-10 border-t border-zinc-800 pt-6">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Program &amp; implementation</h2>
        <ul className="mt-3 flex flex-wrap gap-2" data-testid="office-hub-program-links">
          <li>
            <Link
              href="/progress"
              className="inline-flex rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-100 hover:border-emerald-600/70"
            >
              Progress (prototype)
            </Link>
          </li>
          <li>
            <Link
              href="/help"
              className="inline-flex rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-500"
            >
              Help
            </Link>
          </li>
          <li>
            <Link
              href="/experience"
              className="inline-flex rounded-lg border border-violet-800/50 bg-violet-950/30 px-4 py-2 text-sm font-medium text-violet-100 hover:border-violet-600/60"
            >
              Experience lab
            </Link>
          </li>
          <li>
            <Link
              href="/learn/tokens"
              className="inline-flex rounded-lg border border-cyan-800/50 bg-cyan-950/25 px-4 py-2 text-sm font-medium text-cyan-100 hover:border-cyan-600/60"
            >
              Design tokens
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

function VideoCallStageIntro({ title }: { title: string }) {
  return (
    <div className="bg-zinc-950/55 p-6 text-zinc-100 backdrop-blur-md">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Main content sits in the center column; side tiles are for remote participants. Connect WebRTC when ready.
      </p>
    </div>
  );
}

function renderOfficeLocationContent(locationId: LocationId, entry: OfficeLocationEntry): ReactNode {
  if (locationId === 'hub') {
    return <HubNav />;
  }

  if (includesId(DESK_MISSION_IDS, locationId)) {
    return isPlatformMissionsEnabled() ? <MissionDashboard layout="standalone" /> : <PrototypeMissionWorkspace />;
  }

  if (includesId(CHAT_PLACEHOLDER_IDS, locationId)) {
    return (
      <ChatStagePlaceholder
        title={entry.title}
        subtitle="Transcript and composer will connect to realtime chat or voice when you wire a provider."
      />
    );
  }

  if (includesId(PRESENTATION_INTRO_IDS, locationId)) {
    return (
      <SimpleRoomIntro
        title={entry.title}
        description="Presentation slides, speaker notes, and timers mount here during scenario beats. Scored evaluation stays on the missions workspace unless you integrate otherwise."
      />
    );
  }

  if (includesId(MENTOR_INTRO_IDS, locationId)) {
    return (
      <SimpleRoomIntro
        title={entry.title}
        description="Coaching and mentor dialogue — pair with mentor moments from SCENARIOS.md; mission HUD remains on /missions for structured evaluation."
      />
    );
  }

  if (includesId(EXEC_1ON1_IDS, locationId)) {
    return (
      <SimpleRoomIntro
        title={entry.title}
        description="Closed-door leadership moments. Immersion only unless you wire bespoke flows; scored paths use /missions."
      />
    );
  }

  if (includesId(VIDEO_CALL_IDS, locationId)) {
    return <VideoCallStageIntro title={entry.title} />;
  }

  throw new Error(`Unhandled office location: ${String(locationId)}`);
}

export function OfficeLocationClient({ locationId }: { locationId: LocationId }) {
  const entry = getOfficeLocationOrThrow(locationId);
  const inner = renderOfficeLocationContent(locationId, entry);
  return <OfficeShell entry={entry}>{inner}</OfficeShell>;
}
