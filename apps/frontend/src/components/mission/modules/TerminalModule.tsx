'use client';

import type { MissionState } from '@ti-training/shared';

export function TerminalModule({ missionState }: { missionState: MissionState }) {
  const { profileMetrics } = missionState;

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

  const levelBand = (() => {
    // UX-facing label only (contract does not expose a dedicated "levelBand" field).
    // Thresholds are intentionally conservative so early runs stay readable.
    const xp = profileMetrics.totalXP;
    if (xp >= 300) return 'Level 3';
    if (xp >= 150) return 'Level 2';
    return 'Level 1';
  })();

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

  return (
    <article
      data-testid="terminal-dossier"
      className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-4 md:col-span-2"
    >
      <h2 className="font-medium text-emerald-100">Dossier</h2>
      <p className="mt-2 text-sm text-zinc-300">
        Run closed. Your route, open-text evaluations, and mentor touches are logged for review.
      </p>
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
    </article>
  );
}

