'use client';

import Link from 'next/link';
import FirebaseAuthPanel from '@/app/FirebaseAuthPanel';
import { useFirebaseAuthContext } from '@/lib/FirebaseAuthContext';
import { useMissionStore } from '@/lib/missionStore';
import { MissionHUD } from './MissionHUD';
import { useEffect, useMemo, useState } from 'react';
import { PlatformClient, PlatformClientError } from '@/lib/platformClient';
import type { ScenarioCard } from '@ti-training/shared';

const FALLBACK_SCENARIOS: readonly ScenarioCard[] = [
  {
    scenarioId: 'scenario-1',
    label: 'NDA Pressure Readout (CHRO) — Mission 1',
    enabled: true,
    featured: true,
    pushRank: 1,
  },
];

export default function MissionDashboard() {
  const { user, authReady, firebaseConfigInvalid, apiIdentityBypassed } = useFirebaseAuthContext();
  const {
    missionState,
    isSubmitting,
    startMission,
    statusMessage,
    errorMessage,
  } = useMissionStore();

  const canCallMissionApi = apiIdentityBypassed || user !== null;
  const startDisabled =
    isSubmitting || !authReady || !canCallMissionApi || firebaseConfigInvalid || missionState !== null;

  const [scenarios, setScenarios] = useState<readonly ScenarioCard[]>([]);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [scenariosError, setScenariosError] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady || !canCallMissionApi || firebaseConfigInvalid) {
      return;
    }

    let cancelled = false;
    setScenariosLoading(true);
    setScenariosError(null);

    void PlatformClient.getAvailableScenarios()
      .then((res) => {
        if (cancelled) return;
        setScenarios(res.scenarios);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof PlatformClientError) {
          setScenariosError(err.message);
          setScenarios(FALLBACK_SCENARIOS);
          return;
        }
        if (err instanceof Error) {
          setScenariosError(err.message);
          setScenarios(FALLBACK_SCENARIOS);
          return;
        }
        setScenariosError('Could not load scenarios.');
        setScenarios(FALLBACK_SCENARIOS);
      })
      .finally(() => {
        if (cancelled) return;
        setScenariosLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, canCallMissionApi, firebaseConfigInvalid]);

  const orderedScenarios = useMemo(() => {
    const enabled = scenarios.filter((s) => s.enabled);
    const featured = enabled
      .filter((s) => s.featured)
      .slice()
      .sort((a, b) => (a.pushRank ?? 0) - (b.pushRank ?? 0));
    const rest = enabled
      .filter((s) => !s.featured)
      .slice()
      .sort((a, b) => (a.pushRank ?? 0) - (b.pushRank ?? 0));
    return [...featured, ...rest];
  }, [scenarios]);

  return (
    <div className="bg-zinc-950 p-4 text-zinc-100 sm:p-5">
      <header className="border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">TIC Trainer V2</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Mini-world scenario: three real stances, two open-text beats, one surprise pressure — then dossier.
        </p>
        <p className="mt-3 text-xs text-zinc-500">
          <Link href="/office/hub" className="text-emerald-500 hover:text-emerald-400">
            Office hub
          </Link>
          {' · '}
          <Link href="/tracker" className="text-emerald-500 hover:text-emerald-400">
            Tracker
          </Link>
          {' · '}
          <Link href="/experience" className="text-emerald-500 hover:text-emerald-400">
            Experience lab
          </Link>
        </p>
      </header>
      <FirebaseAuthPanel />

      {missionState === null ? (
        <section
          data-office-focus="tasks"
          tabIndex={-1}
          className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
        >
          <h2 className="text-lg font-medium text-zinc-200">Scenario</h2>
          {scenariosLoading ? (
            <p className="mt-3 text-sm text-zinc-400">Loading scenarios…</p>
          ) : scenariosError ? (
            <p className="mt-3 text-sm text-red-300" data-testid="scenario-error">
              {scenariosError}
            </p>
          ) : null}

          {orderedScenarios.length ? (
            <div className="mt-3 flex flex-col gap-2" data-testid="scenario-card-list">
              {orderedScenarios.map((s) => (
                <button
                  key={s.scenarioId}
                  data-testid="scenario-card"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => void startMission(s.scenarioId)}
                  disabled={startDisabled}
                >
                  {s.label}
                  {s.featured ? ' · Featured' : null}
                </button>
              ))}
            </div>
          ) : null}
          {authReady && !canCallMissionApi ? (
            <p className="mt-2 text-sm text-zinc-400">Sign in with Firebase to start a mission.</p>
          ) : null}

          {statusMessage && isSubmitting ? (
            <p className="mt-2 text-xs text-zinc-400" data-testid="mission-start-status">
              {statusMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="mt-2 text-sm text-red-300" data-testid="mission-start-error">
              {errorMessage}
            </p>
          ) : null}
        </section>
      ) : (
        <MissionHUD />
      )}
    </div>
  );
}
