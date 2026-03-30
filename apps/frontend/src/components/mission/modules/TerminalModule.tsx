'use client';

import type { MissionState, ProfileTrend, TICompetency } from '@ti-training/shared';
import { deriveLevelBandFromXp } from '@ti-training/shared';
import Link from 'next/link';
import { categoryLabel, competencyLabel } from '@/lib/competencyLabels';

function formatDemonstrationHint(iso: string): string {
  const d = new Date(iso);
  const t = d.getTime();
  if (!Number.isFinite(t) || t <= 0) {
    return 'No demonstration on file yet';
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function trendHint(trend: ProfileTrend): string {
  switch (trend) {
    case 'up':
      return 'Trend: rising';
    case 'down':
      return 'Trend: softening';
    case 'flat':
      return 'Trend: steady';
    default: {
      const _exhaustive: never = trend;
      return String(_exhaustive);
    }
  }
}

function ScoreBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/90"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Score ${clamped} out of 100`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-800 to-emerald-500 motion-safe:transition-[width] motion-reduce:transition-none"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export interface TerminalModuleProps {
  missionState: MissionState;
  /** Learner-facing line from the final scored turn (shown only on debrief, not after intermediate steps). */
  closingFeedback?: string;
  /** Same scenario id as current run — triggers a new session with server-side branching on integration. */
  onRedoSameScenario?: () => void;
  redoScenarioLabel?: string;
  /** Clear mission and return to scenario list (e.g. /missions). */
  onReturnToScenarioList?: () => void;
}

export function TerminalModule({
  missionState,
  closingFeedback,
  onRedoSameScenario,
  redoScenarioLabel,
  onReturnToScenarioList,
}: TerminalModuleProps) {
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

  const maxCategoryXp = Math.max(1, ...categoryOrder.map((cat) => profileMetrics.categoryXP[cat] ?? 0));

  const levelBand = `Level ${deriveLevelBandFromXp(profileMetrics.totalXP)}`;

  const medalTier = (() => {
    const xp = profileMetrics.totalXP;
    if (xp >= 300) return 'Gold tier';
    if (xp >= 150) return 'Silver tier';
    return 'Bronze tier';
  })();

  const topCompetencies = Object.entries(profileMetrics.competencies)
    .map(([competency, detail]) => ({ competency: competency as TICompetency, ...detail }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
  const strongest = topCompetencies.slice(0, 2).map((entry) => competencyLabel(entry.competency));
  const weakest = topCompetencies.slice(-2).map((entry) => competencyLabel(entry.competency));

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
        {missionState.runMetadata ? (
          <p className="mt-1 text-xs text-amber-100/90" data-testid="terminal-run-variant">
            Run context: {missionState.runMetadata.variantLabel}
          </p>
        ) : null}
        <p className="mt-1 text-xs text-zinc-300">
          Strongest signals: {strongest.join(', ') || 'Foundations emerging'}.
        </p>
        <p className="mt-1 text-xs text-zinc-300">
          Next improvement targets: {weakest.join(', ') || 'Consistency under pressure'}.
        </p>
        {closingFeedback?.trim() ? (
          <p className="mt-3 text-sm text-emerald-200/90" data-testid="last-evaluation">
            {closingFeedback.trim()}
          </p>
        ) : null}
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
          <div className="text-xs font-medium text-zinc-200">Experience by area</div>
          <p className="mt-1 text-[11px] text-zinc-500">Relative XP earned per program area (this snapshot).</p>
          <ul className="mt-3 space-y-2" data-testid="terminal-category-xp">
            {categoryOrder.map((cat) => {
              const xp = profileMetrics.categoryXP[cat];
              const widthPct = Math.round((xp / maxCategoryXp) * 100);
              return (
                <li key={cat}>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-300">
                    <span>{categoryLabel(cat)}</span>
                    <span className="tabular-nums text-emerald-200">{xp}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-emerald-600/80"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
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
        <div className="text-xs font-medium text-zinc-200">Skill signal (top areas)</div>
        <p className="mt-1 text-[11px] text-zinc-500">
          Bars show current score (0–100). Dates reflect the last time this profile recorded a demonstration for that
          skill.
        </p>
        <ul data-testid="terminal-competencies" className="mt-3 space-y-3">
          {topCompetencies.map((c) => (
            <li
              key={c.competency}
              className="rounded-lg border border-zinc-800 bg-black/20 px-3 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-medium text-sm text-zinc-100">{competencyLabel(c.competency)}</div>
                <div className="tabular-nums text-sm text-emerald-200">{c.score}/100</div>
              </div>
              <div className="mt-2">
                <ScoreBar value={c.score} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                <span>{trendHint(c.trend)}</span>
                <span>{formatDemonstrationHint(c.lastDemonstrated)}</span>
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

      {onRedoSameScenario ? (
        <div className="mt-4 rounded-lg border border-emerald-800/40 bg-black/25 p-3">
          <p className="text-xs font-medium text-emerald-100/95">Run this scenario again</p>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
            Same scenario spine — each new start gets a fresh branch and run context from the platform (variant label updates in the HUD). Use this to practice the same mission with different pressure.
          </p>
          <button
            type="button"
            className="mt-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
            data-testid="redo-scenario-button"
            onClick={() => onRedoSameScenario()}
          >
            {redoScenarioLabel ? `Run again · ${redoScenarioLabel}` : 'Run this scenario again'}
          </button>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {onReturnToScenarioList ? (
          <button
            type="button"
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            data-testid="next-mission-cta"
            onClick={() => onReturnToScenarioList()}
          >
            Choose another mission
          </button>
        ) : (
          <Link
            href="/missions"
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            data-testid="next-mission-cta"
          >
            Choose another mission
          </Link>
        )}
        <Link
          href="/progress"
          className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-900/60"
        >
          Review progress
        </Link>
      </div>
    </article>
  );
}
