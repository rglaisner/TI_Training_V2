'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { MissionEvent } from '@ti-training/shared';
import { getMockTrackerSummary } from '@/lib/ui-prototype/fixtures';
import { usePrototypeAuth } from '@/lib/ui-prototype/PrototypeAuthContext';
import { PrototypeSignInPanel } from '@/components/ui-prototype/PrototypeSignInPanel';

function evidenceHeadline(event: MissionEvent): string {
  switch (event.eventType) {
    case 'EVALUATION_COMPLETED':
      return `Evaluated · ${event.scenarioId} / ${event.nodeId} · score ${event.awardedScore}${event.demonstrated ? ' · demonstrated' : ''}`;
    case 'EVALUATION_JSON_INVALID':
      return `Schema issue · ${event.scenarioId}`;
    case 'EVALUATION_LLM_ERROR':
      return `Model error · ${event.scenarioId}`;
    case 'DECISION_REJECTED':
      return `Rejected · ${event.scenarioId}`;
    case 'MENTOR_INVOKED':
      return `Mentor · ${event.scenarioId}`;
    case 'MENTOR_FEEDBACK_RECORDED':
      return `Mentor feedback · ${event.scenarioId} · ${event.helpful ? 'helpful' : 'not helpful'}`;
    case 'BASELINE_CAPTURED':
      return `Baseline captured · ${event.scenarioId}`;
    case 'MISSION_COMPLETED':
      return `Mission completed · ${event.scenarioId} · xp delta ${event.xpDelta}`;
    case 'TELEMETRY_INGESTED':
      return `Telemetry ingested · ${event.detail}`;
    case 'VOICE_TURN_EVALUATED':
      return `Voice turn · ${event.scenarioId}`;
    case 'ADMIN_CONFIG_CHANGED':
      return `Admin config · ${event.scenarioId}`;
    default: {
      const _exhaustive: never = event;
      return String(_exhaustive);
    }
  }
}

export function PrototypeProgressPage() {
  const { user } = usePrototypeAuth();
  const summary = useMemo(() => {
    if (!user) {
      return null;
    }
    return getMockTrackerSummary();
  }, [user]);

  return (
    <div className="text-zinc-100">
      <header className="border-b border-emerald-900/40 pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400/90">Progress</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Your certification arc
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Prototype fixtures mirror the tracker shape — events and scores here are sample data until PlatformClient is
          wired post-approval.
        </p>
        <nav className="mt-5 flex flex-wrap gap-3 text-sm">
          <Link
            href="/missions"
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:border-emerald-700/60 hover:text-white"
          >
            Missions
          </Link>
          <Link
            href="/office/hub"
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:border-emerald-700/60 hover:text-white"
          >
            Office
          </Link>
        </nav>
      </header>

      <PrototypeSignInPanel className="mt-6" />

      {!user ? (
        <p className="mt-6 text-sm text-zinc-400">Sign in with a demo persona to view mock progress.</p>
      ) : null}

      {summary ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-lg shadow-black/20">
              <p className="font-mono text-xs text-zinc-500">Level band</p>
              <p className="mt-2 text-3xl font-semibold text-white tabular-nums">{summary.levelBand}</p>
              <p className="mt-1 text-xs text-zinc-500">Roadmap placeholder · 0–6 scale in spec</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-lg shadow-black/20">
              <p className="font-mono text-xs text-zinc-500">Total XP</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-300 tabular-nums">
                {summary.profileMetrics.totalXP}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-lg shadow-black/20">
              <p className="font-mono text-xs text-zinc-500">Labels of excellence</p>
              <p className="mt-2 text-lg font-medium text-amber-100/90">
                {summary.profileMetrics.labelsOfExcellence.length
                  ? `${summary.profileMetrics.labelsOfExcellence.length} earned`
                  : 'None yet'}
              </p>
            </div>
          </div>

          {summary.profileMetrics.labelsOfExcellence.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-sm font-medium text-zinc-300">Badges & labels</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {summary.profileMetrics.labelsOfExcellence.map((label) => (
                  <li
                    key={label}
                    className="rounded-full border border-amber-700/40 bg-amber-950/40 px-3 py-1 text-xs font-medium text-amber-100"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="text-sm font-medium text-zinc-300">Recent evidence</h2>
            <ul className="mt-4 space-y-2">
              {summary.recentEvidence.map((event) => (
                <li
                  key={event.eventId}
                  className="rounded-lg border border-zinc-800/80 bg-black/25 px-4 py-3 text-sm text-zinc-300"
                >
                  <span className="font-mono text-xs text-zinc-500">{event.timestamp}</span>
                  <p className="mt-1 text-zinc-200">{evidenceHeadline(event)}</p>
                  {event.eventType === 'EVALUATION_COMPLETED' ? (
                    <p className="mt-2 line-clamp-2 text-xs text-zinc-500">{event.feedbackText}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}
