'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import FirebaseAuthPanel from '@/app/FirebaseAuthPanel';
import { useFirebaseAuthContext } from '@/lib/FirebaseAuthContext';
import { PlatformClient, PlatformClientError } from '@/lib/platformClient';

export default function AdminTrackerPage() {
  const { user, authReady, firebaseConfigInvalid, apiIdentityBypassed } = useFirebaseAuthContext();
  const canLoad = apiIdentityBypassed || user !== null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<{ tenantId: string; totalEvents: number; byType: Record<string, number> } | null>(null);
  const [cohorts, setCohorts] = useState<Array<{ profileHash: string; eventCount: number }>>([]);

  useEffect(() => {
    if (!authReady || !canLoad || firebaseConfigInvalid) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void Promise.all([PlatformClient.getAdminTenantOverview(), PlatformClient.getAdminCohorts()])
      .then(([tenantOverview, cohortData]) => {
        if (cancelled) return;
        setOverview(tenantOverview);
        setCohorts(cohortData.cohorts);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof PlatformClientError) {
          setError(err.message);
          return;
        }
        if (err instanceof Error) {
          setError(err.message);
          return;
        }
        setError('Could not load admin tracker.');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, canLoad, firebaseConfigInvalid]);

  const exportCsv = async (): Promise<void> => {
    try {
      const csv = await PlatformClient.getAdminEventsCsv();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tracker-events.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <header className="border-b border-zinc-800 pb-5">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-400/90">Admin tracker</p>
          <h1 className="mt-2 text-2xl font-semibold">Adoption and rollout evidence</h1>
          <p className="mt-2 text-sm text-zinc-400">Tenant-level evidence, cohort signals, and export-ready reporting.</p>
          <div className="mt-4 flex gap-2 text-xs">
            <Link href="/office/hub" className="rounded border border-zinc-700 px-3 py-1.5 hover:bg-zinc-900">Office hub</Link>
            <Link href="/tracker" className="rounded border border-zinc-700 px-3 py-1.5 hover:bg-zinc-900">User tracker</Link>
          </div>
        </header>

        <FirebaseAuthPanel />

        {!canLoad && authReady && !firebaseConfigInvalid ? (
          <p className="mt-6 text-sm text-zinc-400">Sign in as tenant admin to access control-plane analytics.</p>
        ) : null}
        {error ? <p className="mt-6 rounded border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-200">{error}</p> : null}

        {loading ? <p className="mt-6 text-sm text-zinc-500">Loading admin metrics...</p> : null}

        {overview ? (
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
              <button type="button" onClick={() => void exportCsv()} className="mt-2 rounded bg-emerald-700 px-3 py-1.5 text-xs text-white hover:bg-emerald-600">
                Download events CSV
              </button>
            </article>
          </section>
        ) : null}

        {overview ? (
          <section className="mt-8">
            <h2 className="text-sm font-medium text-zinc-300">Event distribution</h2>
            <ul className="mt-3 space-y-2">
              {Object.entries(overview.byType).map(([eventType, count]) => (
                <li key={eventType} className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm">
                  <span className="font-mono text-xs text-zinc-300">{eventType}</span>
                  <span className="text-emerald-200">{count}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-8">
          <h2 className="text-sm font-medium text-zinc-300">Cohorts</h2>
          <ul className="mt-3 space-y-2">
            {cohorts.map((cohort) => (
              <li key={cohort.profileHash} className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm">
                <span className="font-mono text-xs text-zinc-300">{cohort.profileHash}</span>
                <span className="text-zinc-200">{cohort.eventCount} events</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
