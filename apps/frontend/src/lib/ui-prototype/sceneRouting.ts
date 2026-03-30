/**
 * Maps narrative moments to office plate routes for in-scenario immersion
 * (SCENARIOS.md — mentor vs coworker vs boardroom, etc.). ui-prototype only.
 */
import type { LocationId } from '@/lib/officeLocations';

export type ImmersionMoment =
  | 'hub_entry'
  | 'desk_work'
  | 'coworker_informal'
  | 'async_message'
  | 'working_session'
  | 'board_readout'
  | 'exec_one_on_one'
  | 'video_call'
  | 'mentor_coaching'
  | 'industry_event'
  | 'keynotevenue';

const MOMENT_TO_OFFICE: Record<ImmersionMoment, LocationId> = {
  hub_entry: 'hub',
  desk_work: 'desk',
  coworker_informal: 'coffee',
  async_message: 'text_exchange',
  working_session: 'meeting',
  board_readout: 'boardroom',
  exec_one_on_one: 'boss',
  video_call: 'call',
  mentor_coaching: 'mentor_diner',
  industry_event: 'hr_expo',
  keynotevenue: 'keynote_midsize',
};

export function officePathForMoment(moment: ImmersionMoment): string {
  return `/office/${MOMENT_TO_OFFICE[moment]}`;
}

export function momentLabel(moment: ImmersionMoment): string {
  const labels: Record<ImmersionMoment, string> = {
    hub_entry: 'Main entry hall',
    desk_work: 'Your desk',
    coworker_informal: 'Coffee corner (peer chat)',
    async_message: 'Text exchange',
    working_session: 'Brainstorming room',
    board_readout: 'Board presentation',
    exec_one_on_one: 'Executive 1:1',
    video_call: 'Video call',
    mentor_coaching: 'Mentor conversation',
    industry_event: 'Industry expo floor',
    keynotevenue: 'Keynote venue',
  };
  return labels[moment];
}

/** Heuristic from prototype HUD: last social message source → suggested immersion jump. */
export function suggestedMomentFromSocial(social: { source: 'npc' | 'mentor' }[]): ImmersionMoment | null {
  for (let i = social.length - 1; i >= 0; i -= 1) {
    if (social[i].source === 'mentor') {
      return 'mentor_coaching';
    }
  }
  return 'coworker_informal';
}
