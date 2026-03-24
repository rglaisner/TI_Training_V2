import { z } from 'zod';

export const stageVariantSchema = z.enum(['monitor', 'fullscreen', 'videoTiles']);

export const locationIdSchema = z.enum([
  'desk',
  'hub',
  'coffee',
  'boardroom',
  'boss',
  'meeting',
  'call',
]);

export type LocationId = z.infer<typeof locationIdSchema>;
export type StageVariant = z.infer<typeof stageVariantSchema>;

export const hudMetricsSchema = z.object({
  showLevel: z.boolean().optional(),
  showCurrency: z.boolean().optional(),
  showTrophy: z.boolean().optional(),
});

export type HudMetrics = z.infer<typeof hudMetricsSchema>;

export const officeLocationEntrySchema = z.object({
  id: locationIdSchema,
  title: z.string(),
  /** Public URL served from `public/office/plates/`. Controlled by `OFFICE_PLATE_FILENAMES`. */
  backgroundSrc: z.string(),
  stageVariant: stageVariantSchema,
  stageAriaLabel: z.string(),
  hudMetrics: hudMetricsSchema.optional(),
});

export type OfficeLocationEntry = z.infer<typeof officeLocationEntrySchema>;

/**
 * Raster (or SVG) filename per room, under `apps/frontend/public/office/plates/`.
 * Edit this map if your files use different names (e.g. `at-desk.webp`).
 */
export const OFFICE_PLATE_FILENAMES: Record<LocationId, string> = {
  desk: 'desk.png',
  hub: 'hub.png',
  coffee: 'coffee.png',
  boardroom: 'boardroom.png',
  boss: 'boss.png',
  meeting: 'meeting.png',
  call: 'call.png',
};

export function getOfficePlateUrl(locationId: LocationId): string {
  const filename = OFFICE_PLATE_FILENAMES[locationId];
  return `/office/plates/${filename}`;
}

const rawOfficeLocations = [
  {
    id: 'desk' as const,
    title: 'Your desk',
    backgroundSrc: getOfficePlateUrl('desk'),
    stageVariant: 'monitor' as const,
    stageAriaLabel: 'Workstation monitor — training dashboard',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'hub' as const,
    title: 'Open floor',
    backgroundSrc: getOfficePlateUrl('hub'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Office hub — choose a location',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'coffee' as const,
    title: 'Coffee corner',
    backgroundSrc: getOfficePlateUrl('coffee'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Break area — team chat',
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: false },
  },
  {
    id: 'boardroom' as const,
    title: 'Board room',
    backgroundSrc: getOfficePlateUrl('boardroom'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Board room — presentation',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'boss' as const,
    title: "Boss's office",
    backgroundSrc: getOfficePlateUrl('boss'),
    stageVariant: 'monitor' as const,
    stageAriaLabel: "Manager's office — one-on-one",
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: true },
  },
  {
    id: 'meeting' as const,
    title: 'Meeting room',
    backgroundSrc: getOfficePlateUrl('meeting'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Mid-size meeting — brainstorming',
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: false },
  },
  {
    id: 'call' as const,
    title: 'Video call',
    backgroundSrc: getOfficePlateUrl('call'),
    stageVariant: 'videoTiles' as const,
    stageAriaLabel: 'Video call with teammates',
    hudMetrics: { showLevel: false, showCurrency: false, showTrophy: false },
  },
];

const parsedManifest = z.array(officeLocationEntrySchema).safeParse(rawOfficeLocations);

if (!parsedManifest.success) {
  const issues = parsedManifest.error.flatten();
  throw new Error(`OFFICE_LOCATION_MANIFEST_INVALID: ${JSON.stringify(issues)}`);
}

export const OFFICE_LOCATION_MANIFEST: readonly OfficeLocationEntry[] = parsedManifest.data;

const byId = new Map(OFFICE_LOCATION_MANIFEST.map((entry) => [entry.id, entry]));

export function getOfficeLocationOrThrow(locationId: LocationId): OfficeLocationEntry {
  const entry = byId.get(locationId);
  if (!entry) {
    throw new Error(`Unknown office location: ${locationId}`);
  }
  return entry;
}

export const OFFICE_LOCATION_ORDER: LocationId[] = OFFICE_LOCATION_MANIFEST.map((e) => e.id);
