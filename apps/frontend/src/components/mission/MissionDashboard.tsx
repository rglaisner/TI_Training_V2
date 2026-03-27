'use client';

import Link from 'next/link';
import FirebaseAuthPanel from '@/app/FirebaseAuthPanel';
import { useFirebaseAuthContext } from '@/lib/FirebaseAuthContext';
import { useMissionStore } from '@/lib/missionStore';
import { MissionHUD } from './MissionHUD';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PlatformClient, PlatformClientError } from '@/lib/platformClient';
import type { ScenarioCard } from '@ti-training/shared';
import { trackFirstSessionEvent } from '@/lib/firstSessionTelemetry';

const FALLBACK_SCENARIOS: readonly ScenarioCard[] = [
  {
    scenarioId: 'scenario-1',
    label: 'NDA Pressure Readout (CHRO) — Mission 1',
    enabled: true,
    featured: true,
    pushRank: 1,
  },
  {
    scenarioId: 'scenario-1-exec-shock',
    label: 'Exec Escalation Hot Seat (CFO) — Mission 1B',
    enabled: true,
    featured: true,
    pushRank: 2,
  },
];

const ORIENTATION_STORAGE_KEY = 'ti.firstSession.orientation.dismissed';

interface ScenarioPresentationMeta {
  headline: string;
  skills: string;
  estimatedTime: string;
  difficulty: 'Foundational' | 'Intermediate';
}

const SCENARIO_PRESENTATION: Record<string, ScenarioPresentationMeta> = {
  'scenario-1': {
    headline: 'Lead a CHRO readout under NDA and contractor-pressure tension.',
    skills: 'Data integrity, stakeholder alignment, executive clarity',
    estimatedTime: '8-10 min',
    difficulty: 'Foundational',
  },
  'scenario-1-exec-shock': {
    headline: 'Handle CFO escalation with speed while protecting compliance boundaries.',
    skills: 'Crisis framing, trade-off communication, escalation control',
    estimatedTime: '9-12 min',
    difficulty: 'Intermediate',
  },
};

const PERSONA_TARGETS = [
  { persona: 'Junior TI Pro', target: '>= 4.6/5 delight + smooth onboarding' },
  { persona: 'TI Expert Reviewer', target: '>= 4.5/5 realism + clear scoring rationale' },
  { persona: 'UI/Game Designer', target: '>= 4.6/5 first-session polish and pacing' },
] as const;

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
  const [showOrientation, setShowOrientation] = useState(false);
  const [firstInteractionTracked, setFirstInteractionTracked] = useState(false);
  const firstSessionStartMs = useRef<number>(0);

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const dismissed = window.localStorage.getItem(ORIENTATION_STORAGE_KEY);
    setShowOrientation(dismissed !== 'true');
    firstSessionStartMs.current = Date.now();
    trackFirstSessionEvent({ event: 'first_session_loaded' });
  }, []);

  const orderedScenarios = useMemo(() => {
    const withVariant = (() => {
      const hasPrimary = scenarios.some((item) => item.scenarioId === 'scenario-1');
      const hasVariant = scenarios.some((item) => item.scenarioId === 'scenario-1-exec-shock');
      if (hasPrimary && !hasVariant) {
        return [
          ...scenarios,
          {
            scenarioId: 'scenario-1-exec-shock',
            label: 'Exec Escalation Hot Seat (CFO) — Mission 1B',
            enabled: true,
            featured: true,
            pushRank: 2,
          },
        ] as const;
      }
      return scenarios;
    })();
    const enabled = withVariant.filter((s) => s.enabled);
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

  const startScenario = (scenarioId: string): void => {
    if (!firstInteractionTracked) {
      setFirstInteractionTracked(true);
      const elapsedSeconds = Math.max(0, Math.round((Date.now() - firstSessionStartMs.current) / 1000));
      trackFirstSessionEvent({ event: 'first_interaction', missionId: scenarioId, value: elapsedSeconds });
    }
    trackFirstSessionEvent({ event: 'scenario_start_clicked', missionId: scenarioId });
    void startMission(scenarioId);
  };

  const dismissOrientation = (): void => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ORIENTATION_STORAGE_KEY, 'true');
    }
    setShowOrientation(false);
  };

  const envStateLabel = firebaseConfigInvalid
    ? 'Setup required'
    : apiIdentityBypassed
      ? 'Test mode'
      : user
        ? 'Live mode'
        : 'Sign-in required';

  return (
    <div className="bg-zinc-950 p-4 text-zinc-100 sm:p-5">
      <header className="border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">TIC Trainer V2</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Mini-world scenario: three real stances, two open-text beats, one surprise pressure — then dossier.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1 text-xs text-zinc-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span data-testid="environment-status-chip">{envStateLabel}</span>
        </div>
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
      {showOrientation ? (
        <section
          className="mt-4 rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-4"
          data-testid="first-run-orientation"
        >
          <h2 className="text-lg font-medium text-emerald-100">First mission quickstart</h2>
          <p className="mt-2 text-sm text-zinc-300">
            Expect one focused run in about 10 minutes: pick a route, respond to pressure, and finish with a dossier
            showing what you did well and what to improve next.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-zinc-200">
            {PERSONA_TARGETS.map((item) => (
              <li key={item.persona} data-testid="persona-target-line">
                {item.persona}: {item.target}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            onClick={dismissOrientation}
            data-testid="orientation-continue"
          >
            Got it, start mission
          </button>
        </section>
      ) : null}

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
                  className="rounded-md border border-blue-400/40 bg-blue-950/45 px-4 py-3 text-left hover:bg-blue-900/55 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => startScenario(s.scenarioId)}
                  disabled={startDisabled}
                >
                  <p className="text-sm font-semibold text-white">{s.label}</p>
                  <p className="mt-1 text-xs text-blue-100/95">
                    {(SCENARIO_PRESENTATION[s.scenarioId]?.headline ?? 'Guided scenario run with scored dossier.')}
                  </p>
                  <p className="mt-1 text-[11px] text-blue-200/85">
                    {SCENARIO_PRESENTATION[s.scenarioId]?.difficulty ?? 'Foundational'} ·{' '}
                    {SCENARIO_PRESENTATION[s.scenarioId]?.estimatedTime ?? '8-10 min'} ·{' '}
                    {SCENARIO_PRESENTATION[s.scenarioId]?.skills ?? 'Core TI competencies'}
                  </p>
                  {s.featured ? <span className="mt-2 inline-block text-[11px] text-amber-200">Featured path</span> : null}
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
