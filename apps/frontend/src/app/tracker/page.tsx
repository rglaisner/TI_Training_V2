'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { MissionEvent } from '@ti-training/shared';
import FirebaseAuthPanel from '@/app/FirebaseAuthPanel';
import { useFirebaseAuthContext } from '@/lib/FirebaseAuthContext';
import { PlatformClient, PlatformClientError } from '@/lib/platformClient';

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

export default function TrackerPage() {
  const { user, authReady, firebaseConfigInvalid, apiIdentityBypassed } = useFirebaseAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [levelBand, setLevelBand] = useState<number | null>(null);
  const [totalXp, setTotalXp] = useState<number | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [evidence, setEvidence] = useState<MissionEvent[]>([]);

  const canLoad = apiIdentityBypassed || user !== null;

  const load = useCallback(async () => {
    if (!canLoad || firebaseConfigInvalid) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const summary = await PlatformClient.getTrackerSummary();
      setLevelBand(summary.levelBand);
      setTotalXp(summary.profileMetrics.totalXP);
      setLabels(summary.profileMetrics.labelsOfExcellence);
      setEvidence(summary.recentEvidence);
    } catch (err) {
      if (err instanceof PlatformClientError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Could not load tracker.');
      }
    } finally {
      setLoading(false);
    }
  }, [canLoad, firebaseConfigInvalid]);

  useEffect(() => {
    if (authReady && canLoad && !firebaseConfigInvalid) {
      void load();
    }
  }, [authReady, canLoad, firebaseConfigInvalid, load]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-emerald-950/20 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <header className="border-b border-emerald-900/40 pb-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400/90">Personal tracker</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your certification arc
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Progress, competencies, and recent evidence — aligned with the tracker spec. Data comes from your profile
            and immutable mission events on the platform API.
          </p>
          <nav className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link
              href="/office/desk"
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:border-emerald-700/60 hover:text-white"
            >
              ← Desk / missions
            </Link>
            <Link
              href="/office/hub"
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:border-emerald-700/60 hover:text-white"
            >
              Office hub
            </Link>
            <Link
              href="/experience"
              className="rounded-md border border-emerald-800/50 bg-emerald-950/30 px-3 py-1.5 text-emerald-100 hover:bg-emerald-900/40"
            >
              Experience lab
            </Link>
          </nav>
        </header>

        <FirebaseAuthPanel />

        {authReady && !firebaseConfigInvalid && !canLoad ? (
          <p className="mt-6 text-sm text-zinc-400">Sign in to load your tracker summary.</p>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {canLoad && !firebaseConfigInvalid ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-lg shadow-black/20">
              <p className="font-mono text-xs text-zinc-500">Level band</p>
              <p className="mt-2 text-3xl font-semibold text-white tabular-nums">
                {loading ? '…' : levelBand ?? '—'}
              </p>
              <p className="mt-1 text-xs text-zinc-500">Roadmap placeholder · 0–6 scale in spec</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-lg shadow-black/20">
              <p className="font-mono text-xs text-zinc-500">Total XP</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-300 tabular-nums">
                {loading ? '…' : totalXp ?? '—'}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-lg shadow-black/20">
              <p className="font-mono text-xs text-zinc-500">Labels of excellence</p>
              <p className="mt-2 text-lg font-medium text-amber-100/90">
                {loading ? '…' : labels.length ? `${labels.length} earned` : 'None yet'}
              </p>
            </div>
          </div>
        ) : null}

        {labels.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-sm font-medium text-zinc-300">Badges & labels</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {labels.map((label) => (
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
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-medium text-zinc-300">Recent evidence</h2>
            {canLoad && !firebaseConfigInvalid ? (
              <button
                type="button"
                onClick={() => void load()}
                disabled={loading}
                className="rounded-md border border-zinc-600 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
              >
                Refresh
              </button>
            ) : null}
          </div>
          {loading && evidence.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">Loading event trail…</p>
          ) : null}
          {!loading && evidence.length === 0 && canLoad ? (
            <p className="mt-4 text-sm text-zinc-500">
              No events yet — complete a scenario at your desk to populate this trail.
            </p>
          ) : null}
          <ul className="mt-4 space-y-2">
            {evidence.map((event) => (
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
      </div>
    </div>
  );
}
