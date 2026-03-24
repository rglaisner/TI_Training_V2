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
  /** Public URL path under `/` (e.g. `/office/plates/desk.svg`). Replace with licensed art for production. */
  backgroundSrc: z.string(),
  stageVariant: stageVariantSchema,
  stageAriaLabel: z.string(),
  hudMetrics: hudMetricsSchema.optional(),
});

export type OfficeLocationEntry = z.infer<typeof officeLocationEntrySchema>;

const rawOfficeLocations = [
  {
    id: 'desk' as const,
    title: 'Your desk',
    backgroundSrc: '/office/plates/desk.svg',
    stageVariant: 'monitor' as const,
    stageAriaLabel: 'Workstation monitor — training dashboard',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'hub' as const,
    title: 'Open floor',
    backgroundSrc: '/office/plates/hub.svg',
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Office hub — choose a location',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'coffee' as const,
    title: 'Coffee corner',
    backgroundSrc: '/office/plates/coffee.svg',
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Break area — team chat',
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: false },
  },
  {
    id: 'boardroom' as const,
    title: 'Board room',
    backgroundSrc: '/office/plates/boardroom.svg',
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Board room — presentation',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'boss' as const,
    title: "Boss's office",
    backgroundSrc: '/office/plates/boss.svg',
    stageVariant: 'monitor' as const,
    stageAriaLabel: "Manager's office — one-on-one",
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: true },
  },
  {
    id: 'meeting' as const,
    title: 'Meeting room',
    backgroundSrc: '/office/plates/meeting.svg',
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Mid-size meeting — brainstorming',
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: false },
  },
  {
    id: 'call' as const,
    title: 'Video call',
    backgroundSrc: '/office/plates/call.svg',
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
