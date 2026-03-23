'use client';

import FirebaseAuthPanel from './FirebaseAuthPanel';
import { useFirebaseAuthContext } from '../lib/FirebaseAuthContext';
import { useMissionStore } from '../lib/missionStore';

export default function HomePage() {
  const { user, authReady, apiIdentityBypassed } = useFirebaseAuthContext();
  const {
    missionState,
    statusMessage,
    errorMessage,
    openInputText,
    isSubmitting,
    socialQueue,
    startMission,
    setOpenInputText,
    submitOpenInput,
    submitBranchingChoice,
    invokeMentor,
  } = useMissionStore();

  const isOpenInputNode = missionState?.currentNode.type === 'open_input';
  const isBranchingNode = missionState?.currentNode.type === 'branching';
  const isTerminal = missionState?.isTerminal === true;

  const canCallMissionApi = apiIdentityBypassed || user !== null;
  const startDisabled =
    isSubmitting || !authReady || !canCallMissionApi;

  return (
    <main className="mx-auto max-w-5xl p-6 text-zinc-100">
      <h1 className="text-2xl font-semibold">TIC Trainer V2</h1>
      <FirebaseAuthPanel />
      <section className="mt-4 rounded border border-zinc-700 p-4">
        <h2 className="text-lg font-medium">Scenario Selection</h2>
        <button
          data-testid="scenario-card"
          className="mt-3 rounded bg-blue-700 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => void startMission('scenario-1')}
          disabled={startDisabled}
        >
          Start Scenario 1
        </button>
        {authReady && !canCallMissionApi ? (
          <p className="mt-2 text-sm text-zinc-400">Sign in with Firebase to start a mission.</p>
        ) : null}
      </section>

      <section data-testid="tools-region" className="mt-4 rounded border border-zinc-700 p-4">
        <p data-testid="status-text">{statusMessage}</p>
        {errorMessage ? (
          <p data-testid="error-banner" className="mt-2 text-red-300">
            {errorMessage}
          </p>
        ) : null}
      </section>

      {missionState ? (
        <section className="mt-4 grid gap-4 md:grid-cols-2">
          <article data-testid="narrative-region" className="rounded border border-zinc-700 p-4">
            <h2 className="font-medium">Narrative</h2>
            <p data-testid="scene-text" className="mt-2 whitespace-pre-line">
              {missionState.currentNode.sceneText}
            </p>
          </article>

          <article data-testid="social-region" className="rounded border border-zinc-700 p-4">
            <h2 className="font-medium">Social Feed</h2>
            <button
              data-testid="mentor-button"
              onClick={() => void invokeMentor()}
              className="mt-2 rounded border border-zinc-400 px-2 py-1"
              disabled={isSubmitting}
            >
              Invoke Mentor
            </button>
            <ul className="mt-3 space-y-2">
              {socialQueue.map((message, index) => (
                <li data-testid="mentor-hint-region" key={`${index}-${message}`}>
                  {message}
                </li>
              ))}
            </ul>
          </article>

          <article data-testid="input-region" className="rounded border border-zinc-700 p-4 md:col-span-2">
            <h2 className="font-medium">Input</h2>
            {isTerminal ? (
              <p className="mt-2 text-sm text-zinc-400">This scenario is complete — see the dossier below.</p>
            ) : isOpenInputNode ? (
              <>
                <textarea
                  data-testid="open-input"
                  value={openInputText}
                  onChange={(event) => setOpenInputText(event.target.value)}
                  className="mt-2 w-full rounded bg-zinc-900 p-2"
                  rows={4}
                  disabled={isSubmitting}
                />
                <button
                  data-testid="submit-button"
                  className="mt-2 rounded bg-green-700 px-4 py-2"
                  onClick={() => void submitOpenInput()}
                  disabled={isSubmitting}
                >
                  Submit Decision
                </button>
              </>
            ) : isBranchingNode ? (
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {(missionState.currentNode.branchingOptions ?? [
                  { choiceKey: 'option_a', label: 'Option A' },
                  { choiceKey: 'option_b', label: 'Option B' },
                ]).map((opt) => (
                  <button
                    key={opt.choiceKey}
                    data-testid={`choice-${opt.choiceKey}`}
                    type="button"
                    className="rounded bg-green-700 px-3 py-2 text-left text-sm sm:max-w-md"
                    onClick={() => void submitBranchingChoice(opt.choiceKey)}
                    disabled={isSubmitting}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : null}
          </article>

          {isTerminal ? (
            <article data-testid="terminal-dossier" className="rounded border border-zinc-700 p-4 md:col-span-2">
              <h2 className="font-medium">Terminal Dossier</h2>
              <p>Scenario complete. Review your dossier and evidence.</p>
            </article>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}

