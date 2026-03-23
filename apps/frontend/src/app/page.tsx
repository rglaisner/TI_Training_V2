'use client';

import { useMissionStore } from '../lib/missionStore';

export default function HomePage() {
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
  const isTerminal = missionState?.isTerminal === true;

  return (
    <main className="mx-auto max-w-5xl p-6 text-zinc-100">
      <h1 className="text-2xl font-semibold">TIC Trainer V2</h1>
      <section className="mt-4 rounded border border-zinc-700 p-4">
        <h2 className="text-lg font-medium">Scenario Selection</h2>
        <button
          data-testid="scenario-card"
          className="mt-3 rounded bg-blue-700 px-4 py-2"
          onClick={() => void startMission('scenario-1')}
          disabled={isSubmitting}
        >
          Start Scenario 1
        </button>
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
            <p data-testid="scene-text" className="mt-2">
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
            {isOpenInputNode ? (
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
            ) : (
              <div className="mt-2 flex gap-2">
                <button
                  data-testid="choice-option-a"
                  className="rounded bg-green-700 px-3 py-2"
                  onClick={() => void submitBranchingChoice('option_a')}
                  disabled={isSubmitting}
                >
                  Option A
                </button>
                <button
                  data-testid="choice-option-b"
                  className="rounded bg-zinc-700 px-3 py-2"
                  onClick={() => void submitBranchingChoice('option_b')}
                  disabled={isSubmitting}
                >
                  Option B
                </button>
              </div>
            )}
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

