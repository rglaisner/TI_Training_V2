'use client';

import type { ScenarioCard, ScenarioRolloutEntry } from '@ti-training/shared';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  getMockAdminCohorts,
  getMockAdminOverview,
  getMockAvailableScenarios,
} from '@/lib/ui-prototype/fixtures';
import { usePrototypeAuth } from '@/lib/ui-prototype/PrototypeAuthContext';
import { PrototypeSignInPanel } from '@/components/ui-prototype/PrototypeSignInPanel';

export default function AdminTrackerPage() {
  const { viewerRole, user } = usePrototypeAuth();
  const canView = user !== null && viewerRole === 'tenant_admin';
  const [overview, setOverview] = useState<
    { tenantId: string; totalEvents: number; byType: Record<string, number> } | null
  >(null);
  const [cohorts, setCohorts] = useState<Array<{ profileHash: string; eventCount: number }>>([]);
  const [scenarioCards, setScenarioCards] = useState<readonly ScenarioCard[]>([]);
  const [rolloutDraft, setRolloutDraft] = useState<Record<string, ScenarioRolloutEntry>>({});
  const [rolloutSaving, setRolloutSaving] = useState(false);
  const [rolloutMessage, setRolloutMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!canView) {
      return;
    }
    const tenantOverview = getMockAdminOverview();
    const cohortData = getMockAdminCohorts();
    const available = getMockAvailableScenarios();
    setOverview(tenantOverview);
    setCohorts(cohortData.cohorts);
    setScenarioCards(available.scenarios);
    const draft: Record<string, ScenarioRolloutEntry> = {};
    for (const s of available.scenarios) {
      const entry: ScenarioRolloutEntry = { enabled: s.enabled, featured: s.featured };
      if (s.pushRank !== undefined) {
        entry.pushRank = s.pushRank;
      }
      draft[s.scenarioId] = entry;
    }
    setRolloutDraft(draft);
  }, [canView]);

  const patchRollout = (scenarioId: string, patch: Partial<ScenarioRolloutEntry>): void => {
    setRolloutDraft((prev) => {
      const current = prev[scenarioId];
      if (!current) {
        return prev;
      }
      return { ...prev, [scenarioId]: { ...current, ...patch } };
    });
  };

  const saveRolloutConfig = async (): Promise<void> => {
    setRolloutSaving(true);
    setRolloutMessage(null);
    await new Promise((r) => {
      window.setTimeout(r, 180);
    });
    setRolloutMessage('Prototype: rollout saved in memory only — PlatformClient save arrives post-chunk approval.');
    setRolloutSaving(false);
  };

  const exportCsv = async (): Promise<void> => {
    const header = 'eventId,eventType,scenarioId\n';
    const row = 'ev-mock-1,EVALUATION_COMPLETED,scenario-1\n';
    const csv = `${header}${row}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tracker-events-prototype.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <header className="border-b border-zinc-800 pb-5">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-400/90">Admin · prototype</p>
          <h1 className="mt-2 text-2xl font-semibold">Adoption and rollout evidence</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Control which missions learners can start, what you highlight for pilots, and in what order featured rows
            appear. Everything below uses mock tenant data until the real control plane is wired.
          </p>
          <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-900/50 p-3 text-xs leading-relaxed text-zinc-400">
            <p className="font-medium text-zinc-200">Scenario rollout (canary controls)</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>
                <strong className="text-zinc-300">Enabled</strong> — learners can see and launch this scenario. Turn off
                to hide it during pilots or incidents.
              </li>
              <li>
                <strong className="text-zinc-300">Featured</strong> — shows in the “recommended / highlighted” band
                (must stay enabled).
              </li>
              <li>
                <strong className="text-zinc-300">Push rank</strong> — sort order among <em>featured</em> scenarios:
                lower numbers surface first (e.g. 0 before 5). Tie-break when two rows share the same rank is
                implementation-defined; keep ranks unique for predictable ordering.
              </li>
            </ul>
          </div>
          <div className="mt-4 flex gap-2 text-xs">
            <Link href="/office/hub" className="rounded border border-zinc-700 px-3 py-1.5 hover:bg-zinc-900">
              Office hub
            </Link>
            <Link href="/progress" className="rounded border border-zinc-700 px-3 py-1.5 hover:bg-zinc-900">
              Progress
            </Link>
          </div>
        </header>

        <PrototypeSignInPanel className="mt-6" />

        {user && !canView ? (
          <p className="mt-6 text-sm text-amber-200/90">
            Sign in as <strong>demo admin</strong> to view this surface — or open /missions as a learner.
          </p>
        ) : null}

        {!canView ? null : overview && scenarioCards.length > 0 ? (
          <section className="mt-8 rounded border border-zinc-800 bg-zinc-900/30 p-4" data-testid="admin-scenario-rollout">
            <h2 className="text-sm font-medium text-zinc-200">Adjust flags per scenario</h2>
            <p className="mt-2 text-xs text-zinc-500">
              Match toggles to your pilot: few enabled items first, then expand. Featured + push rank only affect ordering
              inside the highlighted set.
            </p>
            <ul className="mt-4 space-y-3">
              {scenarioCards.map((card) => {
                const row = rolloutDraft[card.scenarioId];
                if (!row) {
                  return null;
                }
                return (
                  <li
                    key={card.scenarioId}
                    className="flex flex-col gap-2 rounded border border-zinc-800 bg-zinc-950/40 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-zinc-400">{card.scenarioId}</p>
                      <p className="text-sm text-zinc-200">{card.label}</p>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-zinc-300">
                      <input
                        type="checkbox"
                        checked={row.enabled}
                        onChange={(ev) => patchRollout(card.scenarioId, { enabled: ev.target.checked })}
                      />
                      Enabled
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-300">
                      <input
                        type="checkbox"
                        checked={row.featured ?? false}
                        disabled={!row.enabled}
                        onChange={(ev) => patchRollout(card.scenarioId, { featured: ev.target.checked })}
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-300">
                      <span className="text-zinc-500">Push rank</span>
                      <input
                        type="number"
                        className="w-16 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100"
                        value={row.pushRank ?? 0}
                        disabled={!row.enabled}
                        onChange={(ev) => {
                          const n = Number(ev.target.value);
                          if (!Number.isFinite(n)) {
                            return;
                          }
                          patchRollout(card.scenarioId, { pushRank: Math.round(n) });
                        }}
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              className="mt-4 rounded bg-emerald-800 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              disabled={rolloutSaving || Object.keys(rolloutDraft).length === 0}
              onClick={() => void saveRolloutConfig()}
            >
              {rolloutSaving ? 'Saving…' : 'Save rollout (prototype)'}
            </button>
          </section>
        ) : null}

        {canView && rolloutMessage ? (
          <p className="mt-6 rounded border border-emerald-900/50 bg-emerald-950/25 p-3 text-sm text-emerald-100">
            {rolloutMessage}
          </p>
        ) : null}

        {canView && overview ? (
          <section className="mt-8 grid gap-3 sm:grid-cols-3">
            <article className="rounded border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs text-zinc-500">Tenant</p>
              <p className="mt-1 text-sm text-zinc-200">{overview.tenantId}</p>
            </article>
            <article className="rounded border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs text-zinc-500">Total events</p>
              <p className="mt-1 text-2xl text-emerald-200">{overview.totalEvents}</p>
            </article>
            <article className="rounded border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs text-zinc-500">CSV export</p>
              <button
                type="button"
                onClick={() => void exportCsv()}
                className="mt-2 rounded bg-emerald-700 px-3 py-1.5 text-xs text-white hover:bg-emerald-600"
              >
                Download sample CSV
              </button>
            </article>
          </section>
        ) : null}

        {canView && overview ? (
          <section className="mt-8">
            <h2 className="text-sm font-medium text-zinc-300">Event distribution</h2>
            <ul className="mt-3 space-y-2">
              {Object.entries(overview.byType).map(([eventType, count]) => (
                <li
                  key={eventType}
                  className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm"
                >
                  <span className="font-mono text-xs text-zinc-300">{eventType}</span>
                  <span className="text-emerald-200">{count}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {canView ? (
          <section className="mt-8">
            <h2 className="text-sm font-medium text-zinc-300">Cohorts</h2>
            <ul className="mt-3 space-y-2">
              {cohorts.map((cohort) => (
                <li
                  key={cohort.profileHash}
                  className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm"
                >
                  <span className="font-mono text-xs text-zinc-300">{cohort.profileHash}</span>
                  <span className="text-zinc-200">{cohort.eventCount} events</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
