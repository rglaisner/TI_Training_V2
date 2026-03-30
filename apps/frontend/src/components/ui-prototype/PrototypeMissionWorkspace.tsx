'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { ScenarioCard } from '@ti-training/shared';
import { getMockAvailableScenarios } from '@/lib/ui-prototype/fixtures';
import { usePrototypeAuth } from '@/lib/ui-prototype/PrototypeAuthContext';
import { usePrototypeMissionStore } from '@/lib/ui-prototype/prototypeMissionStore';
import { officePathForMoment, suggestedMomentFromSocial } from '@/lib/ui-prototype/sceneRouting';
import { MissionCancelControl } from '@/components/ui-prototype/MissionCancelControl';
import { PrototypeMissionHUD } from '@/components/ui-prototype/PrototypeMissionHUD';
import { PrototypeSignInPanel } from '@/components/ui-prototype/PrototypeSignInPanel';

const ORIENTATION_STORAGE_KEY = 'ti.prototype.orientation.dismissed';

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

const FIRST_SESSION_OUTCOMES = [
  'You will practice executive-ready framing under time pressure.',
  'You will see how scored feedback appears after the system confirms evaluation (prototype uses sample scores).',
  'You will leave with a dossier you can compare on the next run.',
] as const;

function orderedScenarios(scenarios: readonly ScenarioCard[]): ScenarioCard[] {
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
}

export function PrototypeMissionWorkspace() {
  const pathname = usePathname() ?? '';
  const { viewerRole, user } = usePrototypeAuth();
  const {
    missionState,
    isSubmitting,
    startMission,
    statusMessage,
    errorMessage,
    socialQueue,
    resetMission,
    replayCountByScenario,
  } = usePrototypeMissionStore();

  const canUseMissions = user !== null && viewerRole === 'learner';
  const startDisabled = isSubmitting || !canUseMissions || missionState !== null;

  const scenarios = useMemo(() => orderedScenarios(getMockAvailableScenarios().scenarios), []);
  const [showOrientation, setShowOrientation] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const dismissed = window.localStorage.getItem(ORIENTATION_STORAGE_KEY);
    setShowOrientation(dismissed !== 'true');
  }, []);

  useEffect(() => {
    if (!user) {
      resetMission({ clearReplayHistory: true });
    }
  }, [user, resetMission]);

  const dismissOrientation = (): void => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ORIENTATION_STORAGE_KEY, 'true');
    }
    setShowOrientation(false);
  };

  const suggestedMoment = useMemo(() => {
    if (socialQueue.length === 0) {
      return null;
    }
    return suggestedMomentFromSocial(socialQueue);
  }, [socialQueue]);

  const envLabel = !user
    ? 'Sign-in required'
    : viewerRole === 'tenant_admin'
      ? 'Admin demo (use Missions as learner from Home or sign out / learner)'
      : 'Prototype mode';

  const missionNavLocked = missionState !== null && !missionState.isTerminal;
  const isOfficeRoute = pathname.startsWith('/office');

  return (
    <div className="bg-zinc-950/40 p-4 text-zinc-100 backdrop-blur-md sm:p-5">
      <header className="border-b border-white/10 pb-4">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Missions</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Scenario runs — branching, open text, mentor, and dossier. Replay the <strong className="font-medium text-zinc-300">same scenario</strong> anytime: the platform starts a <strong className="font-medium text-zinc-300">new branch and variant</strong> each run (prototype rotates sample flavor; production follows server branching).
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1 text-xs text-zinc-200">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span data-testid="environment-status-chip">{envLabel}</span>
        </div>
        {missionNavLocked && isOfficeRoute ? (
          <div className="mt-3 flex flex-wrap items-center gap-3" data-testid="mission-in-progress-strip">
            <span className="text-xs font-medium text-amber-200/95">Mission in progress</span>
            <MissionCancelControl variant="workspace" />
          </div>
        ) : missionNavLocked ? null : (
          <p className="mt-3 text-xs text-zinc-500">
            <Link href="/home" className="text-emerald-500 hover:text-emerald-400">
              Home
            </Link>
            {' · '}
            <Link href="/progress" className="text-emerald-500 hover:text-emerald-400">
              Progress
            </Link>
            {' · '}
            <Link href="/office/hub" className="text-emerald-500 hover:text-emerald-400">
              Office map
            </Link>
          </p>
        )}
      </header>

      <PrototypeSignInPanel className="mt-4" />

      {suggestedMoment && missionState && !missionState.isTerminal ? (
        <section className="mt-4 rounded-lg border border-indigo-400/20 bg-black/35 p-3 backdrop-blur-md">
          <p className="text-xs font-medium text-indigo-200">Suggested immersion backdrop</p>
          <p className="mt-1 text-xs text-zinc-400">
            Plates follow SCENARIOS.md moments (mentor chat, coworker chat, board readout, …). Optional — does not
            change scoring.
          </p>
          <Link
            href={officePathForMoment(suggestedMoment)}
            className="mt-2 inline-flex text-sm text-indigo-300 underline-offset-2 hover:text-indigo-200 hover:underline"
            data-testid="prototype-immersion-link"
          >
            Open office scene for this moment →
          </Link>
        </section>
      ) : null}

      {!canUseMissions ? (
        <p className="mt-4 text-sm text-zinc-400">Sign in as a demo learner to start a mission.</p>
      ) : null}

      {canUseMissions && showOrientation ? (
        <section
          className="mt-4 rounded-lg border border-emerald-500/25 bg-black/35 p-4 backdrop-blur-md"
          data-testid="first-run-orientation"
        >
          <h2 className="text-lg font-medium text-emerald-100">First mission quickstart</h2>
          <p className="mt-2 text-sm text-zinc-300">
            Expect one focused run: pick a route, respond to pressure, then review the dossier. In prototype mode,
            evaluation is simulated — copy still follows the design authority (no fake “official” cert language).
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-zinc-200">
            <li>Choose your scenario route.</li>
            <li>Respond with evidence and explicit boundaries.</li>
            <li>Review your dossier and next-step targets.</li>
          </ol>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-zinc-200">
            {FIRST_SESSION_OUTCOMES.map((line) => (
              <li key={line} data-testid="first-session-outcome-line">
                {line}
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

      {missionState === null && canUseMissions ? (
        <section
          data-office-focus="tasks"
          tabIndex={-1}
          className="mt-4 rounded-lg border border-white/10 bg-black/35 p-4 outline-none backdrop-blur-md focus-visible:ring-2 focus-visible:ring-emerald-500/70"
        >
          <h2 className="text-lg font-medium text-zinc-200">Scenario</h2>
          <div className="mt-3 flex flex-col gap-3" data-testid="scenario-card-list">
            {scenarios.map((s) => {
              const runs = replayCountByScenario[s.scenarioId] ?? 0;
              return (
                <div
                  key={s.scenarioId}
                  className="flex flex-col overflow-hidden rounded-md border border-blue-400/40 bg-blue-950/45"
                >
                  <button
                    data-testid="scenario-card"
                    type="button"
                    className="px-4 py-3 text-left hover:bg-blue-900/55 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => void startMission(s.scenarioId)}
                    disabled={startDisabled}
                  >
                    <p className="text-sm font-semibold text-white">{s.label}</p>
                    <p className="mt-1 text-xs text-blue-100/95">
                      {SCENARIO_PRESENTATION[s.scenarioId]?.headline ?? 'Guided scenario run with scored dossier.'}
                    </p>
                    <p className="mt-1 text-[11px] text-blue-200/85">
                      {SCENARIO_PRESENTATION[s.scenarioId]?.difficulty ?? 'Foundational'} ·{' '}
                      {SCENARIO_PRESENTATION[s.scenarioId]?.estimatedTime ?? '8-10 min'} ·{' '}
                      {SCENARIO_PRESENTATION[s.scenarioId]?.skills ?? 'Core TI competencies'}
                    </p>
                    {s.featured ? (
                      <span className="mt-2 inline-block text-[11px] text-amber-200">Featured path</span>
                    ) : null}
                  </button>
                  <div className="flex flex-wrap items-center gap-2 border-t border-blue-500/25 bg-black/20 px-3 py-2">
                    <button
                      type="button"
                      data-testid="scenario-run-again"
                      className="rounded-md border border-emerald-600/50 bg-emerald-950/35 px-2.5 py-1 text-xs font-medium text-emerald-100 hover:bg-emerald-900/40 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={startDisabled}
                      onClick={() => void startMission(s.scenarioId)}
                    >
                      Run again — new branch
                    </button>
                    {runs > 0 ? (
                      <span className="text-[10px] text-zinc-500">
                        Started {runs}× this session · next run uses the next variant in line
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">
                        Replays use the same scenario with a fresh branch (see dossier run context each time)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
      ) : null}

      {missionState !== null && canUseMissions ? <PrototypeMissionHUD /> : null}
    </div>
  );
}
