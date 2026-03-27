'use client';

import type { MissionState } from '@ti-training/shared';
import Link from 'next/link';
import { useState } from 'react';
import { deriveLevelBandFromXp } from '@ti-training/shared';
import { flushFirstSessionTelemetry, trackFirstSessionEvent } from '@/lib/firstSessionTelemetry';
import { PlatformClient } from '@/lib/platformClient';

export function TerminalModule({ missionState }: { missionState: MissionState }) {
  const { profileMetrics } = missionState;
  const [mentorRated, setMentorRated] = useState(false);

  const categoryOrder = [
    'FOUNDATIONS',
    'INFLUENCE',
    'STRATEGY',
    'CRISIS',
    'ETHICS',
    'LEADING_AND_MANAGING',
    'CREATIVE_AND_CRITICAL_THINKING',
    'THOUGHT_LEADERSHIP',
  ] as const;

  const levelBand = `Level ${deriveLevelBandFromXp(profileMetrics.totalXP)}`;

  const medalTier = (() => {
    const xp = profileMetrics.totalXP;
    if (xp >= 300) return 'Gold tier';
    if (xp >= 150) return 'Silver tier';
    return 'Bronze tier';
  })();

  const topCompetencies = Object.entries(profileMetrics.competencies)
    .map(([competency, detail]) => ({ competency, ...detail }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
  const strongest = topCompetencies.slice(0, 2).map((entry) => entry.competency.replaceAll('_', ' '));
  const weakest = topCompetencies.slice(-2).map((entry) => entry.competency.replaceAll('_', ' '));

  const onMentorRated = (value: number): void => {
    if (mentorRated) {
      return;
    }
    setMentorRated(true);
    trackFirstSessionEvent({
      event: 'mentor_feedback_rated',
      missionId: missionState.sessionId,
      value,
      detail: value > 0 ? 'helpful' : 'not_helpful',
    });
    void PlatformClient.submitMentorFeedback({
      sessionId: missionState.sessionId,
      nodeId: missionState.currentNode.nodeId,
      mentorMessageId: `${missionState.sessionId}-${missionState.currentNode.nodeId}`,
      helpful: value > 0,
      note: value > 0 ? 'helpful' : 'not_helpful',
    });
    void flushFirstSessionTelemetry(missionState.sessionId);
  };

  return (
    <article
      data-testid="terminal-dossier"
      className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-4 md:col-span-2"
    >
      <h2 className="font-medium text-emerald-100">Dossier</h2>
      <p className="mt-2 text-sm text-zinc-300">
        Run closed. Your route, open-text evaluations, and mentor touches are logged for review.
      </p>
      <div className="mt-3 rounded-lg border border-emerald-900/30 bg-black/20 p-3">
        <p className="text-sm font-medium text-emerald-100">Mission recap</p>
        <p className="mt-1 text-xs text-zinc-300">
          Strongest signals: {strongest.join(', ') || 'Foundations emerging'}.
        </p>
        <p className="mt-1 text-xs text-zinc-300">
          Next improvement targets: {weakest.join(', ') || 'Consistency under pressure'}.
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-900/30 bg-black/20 p-3">
          <div className="text-xs font-medium text-zinc-200">Certification summary</div>
          <div className="mt-2 text-sm text-emerald-100">{levelBand}</div>
          <div className="text-xs text-zinc-300">{medalTier}</div>
          <div className="mt-2 text-xs text-zinc-500" data-testid="terminal-xp">
            Total XP: {profileMetrics.totalXP}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-black/15 p-3">
          <div className="text-xs font-medium text-zinc-200">Category XP</div>
          <div className="mt-2 flex flex-wrap gap-2" data-testid="terminal-category-xp">
            {categoryOrder.map((cat) => {
              const xp = profileMetrics.categoryXP[cat];
              return (
                <span
                  key={cat}
                  className="rounded-full border border-zinc-700 bg-zinc-950/40 px-2 py-1 text-[11px] text-zinc-200"
                  title={`${cat} XP`}
                >
                  {cat}:{' '}
                  <span className="font-mono text-[11px] text-emerald-200">{xp}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {profileMetrics.labelsOfExcellence.length ? (
        <div className="mt-4">
          <div className="text-xs font-medium text-zinc-200">Labels of excellence</div>
          <ul data-testid="terminal-labels" className="mt-2 flex flex-wrap gap-2">
            {profileMetrics.labelsOfExcellence.map((label) => (
              <li
                key={label}
                className="rounded-full border border-emerald-800/60 bg-black/20 px-3 py-1 text-xs text-emerald-100"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4">
        <div className="text-xs font-medium text-zinc-200">Competency trends</div>
        <ul data-testid="terminal-competencies" className="mt-2 space-y-2">
          {topCompetencies.map((c) => (
            <li
              key={c.competency}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-black/20 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate font-mono text-[12px] text-zinc-200">{c.competency}</div>
                <div className="mt-1 text-[11px] text-zinc-500">Last demonstrated: {c.lastDemonstrated}</div>
              </div>
              <div className="flex items-end gap-3">
                <div className="text-right">
                  <div className="font-mono text-sm text-emerald-200">{c.score}/100</div>
                  <div className="text-[11px] text-zinc-400">{c.trend}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {profileMetrics.labelsOfExcellence.length === 0 ? (
        <p className="mt-3 text-xs text-zinc-500">
          No labels earned on this run yet. Your next missions can unlock them as your competency signals stabilize.
        </p>
      ) : null}
      <div className="mt-4 rounded-lg border border-zinc-800 bg-black/20 p-3">
        <p className="text-xs font-medium text-zinc-200">Was mentor guidance useful this run?</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="rounded-md border border-emerald-700/60 bg-emerald-950/30 px-3 py-1 text-xs text-emerald-100 hover:bg-emerald-900/40 disabled:opacity-50"
            onClick={() => onMentorRated(1)}
            disabled={mentorRated}
            data-testid="mentor-rating-helpful"
          >
            Helpful
          </button>
          <button
            type="button"
            className="rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
            onClick={() => onMentorRated(0)}
            disabled={mentorRated}
            data-testid="mentor-rating-not-helpful"
          >
            Not helpful
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/office/desk"
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          data-testid="next-mission-cta"
        >
          Start next mission now
        </Link>
        <Link
          href="/tracker"
          className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-900/60"
        >
          Review tracker
        </Link>
      </div>
    </article>
  );
}

