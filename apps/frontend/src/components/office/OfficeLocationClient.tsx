'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { LocationId, OfficeLocationEntry } from '@/lib/officeLocations';
import { getOfficeLocationOrThrow, OFFICE_LOCATION_MANIFEST } from '@/lib/officeLocations';
import MissionDashboard from '@/components/mission/MissionDashboard';
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
    <div className="space-y-4 bg-zinc-950 p-6 text-zinc-100">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
      <Link
        href="/office/desk"
        className="inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
        data-testid="office-link-desk"
      >
        Back to desk
      </Link>
    </div>
  );
}

function HubNav() {
  return (
    <div className="bg-zinc-950 p-6 text-zinc-100">
      <h1 className="text-xl font-semibold">Office hub</h1>
      <p className="mt-2 text-sm text-zinc-400">Pick a location. Mission training runs at your desk views.</p>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" data-testid="office-hub-nav">
        {OFFICE_LOCATION_MANIFEST.map((loc) => (
          <li key={loc.id}>
            <Link
              href={`/office/${loc.id}`}
              className="block rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm font-medium text-zinc-200 hover:border-emerald-700/50 hover:bg-zinc-900"
            >
              {loc.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VideoCallStageIntro({ title }: { title: string }) {
  return (
    <div className="bg-zinc-950 p-6 text-zinc-100">
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
    return <MissionDashboard />;
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
        description="Presentation slides, speaker notes, and timers can mount in this stage. Run scored training from your desk when you need evaluation."
      />
    );
  }

  if (includesId(MENTOR_INTRO_IDS, locationId)) {
    return (
      <SimpleRoomIntro
        title={entry.title}
        description="Coaching and mentor dialogue flows can live here. Use the desk for structured missions and evaluations."
      />
    );
  }

  if (includesId(EXEC_1ON1_IDS, locationId)) {
    return (
      <SimpleRoomIntro
        title={entry.title}
        description="Closed-door leadership and performance conversations. Run scored scenarios from your desk when you need structured evaluation."
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
