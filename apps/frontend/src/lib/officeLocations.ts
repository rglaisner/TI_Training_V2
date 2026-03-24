import { z } from 'zod';

export const stageVariantSchema = z.enum(['monitor', 'fullscreen', 'videoTiles']);

export const locationIdSchema = z.enum([
  'desk',
  'desk2',
  'desk3',
  'hub',
  'lounge',
  'coffee',
  'text_exchange',
  'meeting',
  'meeting2',
  'boardroom',
  'boss',
  'boss2',
  'call',
  'call2',
  'mentor_diner',
  'mentor_outdoor',
  'mentor_outdoor_2',
  'hr_expo',
  'hr_expo_2',
  'keynote_midsize',
  'keynote_midsize_2',
  'keynote_midsize_3',
  'keynote_master',
  'keynote_master_2',
  'keynote_master_3',
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
 * Filename per location under `apps/frontend/public/office/plates/`.
 * Must match files on disk exactly (case-sensitive on some hosts).
 */
export const OFFICE_PLATE_FILENAMES: Record<LocationId, string> = {
  desk: 'At_Desk1.png',
  desk2: 'At_Desk2.png',
  desk3: 'At_Desk3.png',
  hub: 'Office_Main_Entry_Hall1.png',
  lounge: 'Informal_EntryHall_Meeting1.png',
  coffee: 'Informal_Coffee_Meeting1.png',
  text_exchange: 'Text_Exchange1.png',
  meeting: 'Brainstorming1.png',
  meeting2: 'Brainstorming2.png',
  boardroom: 'Board_Presentation_1.png',
  boss: 'Exec_Meeting1.png',
  boss2: 'Exec_Meeting2.png',
  call: 'Video_Conf1.png',
  call2: 'Video_Conf2.png',
  mentor_diner: 'Mentor_Diner_Meeting1.png',
  mentor_outdoor: 'Mentor_Outdoor_Meeting1.png',
  mentor_outdoor_2: 'Mentor_Outdoor_Meeting2.png',
  hr_expo: 'HRTech_Expo1.png',
  hr_expo_2: 'HRTech_Expo2.png',
  keynote_midsize: 'Keynote_MidSize_Event1.png',
  keynote_midsize_2: 'Keynote_MidSize_Event2.png',
  keynote_midsize_3: 'Keynote_MidSize_Event3.png',
  keynote_master: 'Keynote_MasterEvent1.png',
  keynote_master_2: 'Keynote_MasterEvent2.png',
  keynote_master_3: 'Keynote_MasterEvent3.png',
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
    id: 'desk2' as const,
    title: 'Desk — alternate view',
    backgroundSrc: getOfficePlateUrl('desk2'),
    stageVariant: 'monitor' as const,
    stageAriaLabel: 'Workstation monitor — training dashboard',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'desk3' as const,
    title: 'Desk — wide focus',
    backgroundSrc: getOfficePlateUrl('desk3'),
    stageVariant: 'monitor' as const,
    stageAriaLabel: 'Workstation monitor — training dashboard',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'hub' as const,
    title: 'Main entry hall',
    backgroundSrc: getOfficePlateUrl('hub'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Office hub — choose a location',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'lounge' as const,
    title: 'Entry hall conversation',
    backgroundSrc: getOfficePlateUrl('lounge'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Informal meeting near reception',
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: false },
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
    id: 'text_exchange' as const,
    title: 'Text exchange',
    backgroundSrc: getOfficePlateUrl('text_exchange'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Async messages and threads',
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: false },
  },
  {
    id: 'meeting' as const,
    title: 'Brainstorming room',
    backgroundSrc: getOfficePlateUrl('meeting'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Mid-size meeting — brainstorming',
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: false },
  },
  {
    id: 'meeting2' as const,
    title: 'Brainstorming — alternate',
    backgroundSrc: getOfficePlateUrl('meeting2'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Workshop and ideation',
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: false },
  },
  {
    id: 'boardroom' as const,
    title: 'Board presentation',
    backgroundSrc: getOfficePlateUrl('boardroom'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Board room — presentation',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'boss' as const,
    title: 'Executive 1:1',
    backgroundSrc: getOfficePlateUrl('boss'),
    stageVariant: 'monitor' as const,
    stageAriaLabel: "Manager's office — one-on-one",
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: true },
  },
  {
    id: 'boss2' as const,
    title: 'Executive conversation',
    backgroundSrc: getOfficePlateUrl('boss2'),
    stageVariant: 'monitor' as const,
    stageAriaLabel: 'Closed-door leadership dialogue',
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: true },
  },
  {
    id: 'call' as const,
    title: 'Video call',
    backgroundSrc: getOfficePlateUrl('call'),
    stageVariant: 'videoTiles' as const,
    stageAriaLabel: 'Video call with teammates',
    hudMetrics: { showLevel: false, showCurrency: false, showTrophy: false },
  },
  {
    id: 'call2' as const,
    title: 'Video call — alternate',
    backgroundSrc: getOfficePlateUrl('call2'),
    stageVariant: 'videoTiles' as const,
    stageAriaLabel: 'Video conference layout B',
    hudMetrics: { showLevel: false, showCurrency: false, showTrophy: false },
  },
  {
    id: 'mentor_diner' as const,
    title: 'Mentor — diner',
    backgroundSrc: getOfficePlateUrl('mentor_diner'),
    stageVariant: 'monitor' as const,
    stageAriaLabel: 'Informal mentor session',
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: true },
  },
  {
    id: 'mentor_outdoor' as const,
    title: 'Mentor — outdoor walk',
    backgroundSrc: getOfficePlateUrl('mentor_outdoor'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Walking mentor conversation',
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: true },
  },
  {
    id: 'mentor_outdoor_2' as const,
    title: 'Mentor — outdoor (alt)',
    backgroundSrc: getOfficePlateUrl('mentor_outdoor_2'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Outdoor coaching continuation',
    hudMetrics: { showLevel: true, showCurrency: false, showTrophy: true },
  },
  {
    id: 'hr_expo' as const,
    title: 'HR tech expo — hall A',
    backgroundSrc: getOfficePlateUrl('hr_expo'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Conference floor — expo',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'hr_expo_2' as const,
    title: 'HR tech expo — hall B',
    backgroundSrc: getOfficePlateUrl('hr_expo_2'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Conference floor — expo alternate',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'keynote_midsize' as const,
    title: 'Keynote — mid-size event',
    backgroundSrc: getOfficePlateUrl('keynote_midsize'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Mid-size keynote stage',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'keynote_midsize_2' as const,
    title: 'Keynote — mid-size (B)',
    backgroundSrc: getOfficePlateUrl('keynote_midsize_2'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Mid-size keynote — alternate angle',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'keynote_midsize_3' as const,
    title: 'Keynote — mid-size (C)',
    backgroundSrc: getOfficePlateUrl('keynote_midsize_3'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Mid-size keynote — third view',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'keynote_master' as const,
    title: 'Master keynote — A',
    backgroundSrc: getOfficePlateUrl('keynote_master'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Large keynote — primary',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'keynote_master_2' as const,
    title: 'Master keynote — B',
    backgroundSrc: getOfficePlateUrl('keynote_master_2'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Large keynote — alternate',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
  },
  {
    id: 'keynote_master_3' as const,
    title: 'Master keynote — C',
    backgroundSrc: getOfficePlateUrl('keynote_master_3'),
    stageVariant: 'fullscreen' as const,
    stageAriaLabel: 'Large keynote — third view',
    hudMetrics: { showLevel: true, showCurrency: true, showTrophy: true },
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
