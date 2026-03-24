'use client';

import Link from 'next/link';
import type { LocationId } from '@/lib/officeLocations';
import { getOfficeLocationOrThrow, OFFICE_LOCATION_MANIFEST } from '@/lib/officeLocations';
import MissionDashboard from '@/components/mission/MissionDashboard';
import ChatStagePlaceholder from '@/components/office/ChatStagePlaceholder';
import { OfficeShell } from '@/components/office/OfficeShell';

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
      <p className="mt-2 text-sm text-zinc-400">Pick a location. Mission training runs at your desk.</p>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2" data-testid="office-hub-nav">
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

export function OfficeLocationClient({ locationId }: { locationId: LocationId }) {
  const entry = getOfficeLocationOrThrow(locationId);

  const inner =
    locationId === 'desk' ? (
      <MissionDashboard />
    ) : locationId === 'hub' ? (
      <HubNav />
    ) : locationId === 'coffee' ? (
      <ChatStagePlaceholder
        title="Coffee corner"
        subtitle="Casual chat with coworkers — connect voice or text here later."
      />
    ) : locationId === 'meeting' ? (
      <ChatStagePlaceholder
        title="Brainstorming session"
        subtitle="Whiteboard and side chat — realtime integration pending."
      />
    ) : locationId === 'boardroom' ? (
      <SimpleRoomIntro
        title="Board room"
        description="Presentation and readout mode. Slides and timer can mount in this stage when you add them."
      />
    ) : locationId === 'boss' ? (
      <SimpleRoomIntro
        title="One-on-one"
        description="Closed-door debriefs and coaching. Run scored scenarios from your desk for now."
      />
    ) : (
      <div className="bg-zinc-950 p-6 text-zinc-100">
        <h1 className="text-lg font-semibold">Call agenda</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Main tile is the center column; side tiles are for remote participants. Hook up WebRTC when ready.
        </p>
      </div>
    );

  return <OfficeShell entry={entry}>{inner}</OfficeShell>;
}
