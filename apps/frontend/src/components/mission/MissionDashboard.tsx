'use client';

import FirebaseAuthPanel from '@/app/FirebaseAuthPanel';
import { useFirebaseAuthContext } from '@/lib/FirebaseAuthContext';
import { useMissionStore } from '@/lib/missionStore';

export default function MissionDashboard() {
  const { user, authReady, apiIdentityBypassed } = useFirebaseAuthContext();
  const {
    missionState,
    statusMessage,
    errorMessage,
    openInputText,
    mentorUserMessage,
    lastEvaluationSummary,
    lastNpcMessage,
    isSubmitting,
    socialQueue,
    startMission,
    setOpenInputText,
    setMentorUserMessage,
    submitOpenInput,
    submitBranchingChoice,
    invokeMentor,
  } = useMissionStore();

  const isOpenInputNode = missionState?.currentNode.type === 'open_input';
  const isBranchingNode = missionState?.currentNode.type === 'branching';
  const isTerminal = missionState?.isTerminal === true;
  const branchingOptions = missionState?.currentNode.branchingOptions ?? [];

  const canCallMissionApi = apiIdentityBypassed || user !== null;
  const startDisabled = isSubmitting || !authReady || !canCallMissionApi;

  return (
    <div className="bg-zinc-950 p-4 text-zinc-100 sm:p-5">
      <header className="border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">TIC Trainer V2</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Mini-world scenario: three real stances, two open-text beats, one surprise pressure — then dossier.
        </p>
      </header>
      <FirebaseAuthPanel />
      <section
        data-office-focus="tasks"
        tabIndex={-1}
        className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
      >
        <h2 className="text-lg font-medium text-zinc-200">Scenario</h2>
        <button
          data-testid="scenario-card"
          className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => void startMission('scenario-1')}
          disabled={startDisabled}
        >
          Start Scenario 1 — CHRO readout under NDA pressure
        </button>
        {authReady && !canCallMissionApi ? (
          <p className="mt-2 text-sm text-zinc-400">Sign in with Firebase to start a mission.</p>
        ) : null}
      </section>

      <section data-testid="tools-region" className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <p data-testid="status-text" className="text-sm text-zinc-300">
          {statusMessage}
        </p>
        {missionState?.runMetadata ? (
          <p className="mt-2 text-xs text-amber-200/90" data-testid="run-variant">
            Session variant: {missionState.runMetadata.variantLabel}
          </p>
        ) : null}
        {lastNpcMessage ? (
          <p className="mt-2 text-sm text-zinc-200" data-testid="npc-message">
            {lastNpcMessage}
          </p>
        ) : null}
        {lastEvaluationSummary ? (
          <p className="mt-2 text-sm text-emerald-200/90" data-testid="last-evaluation">
            {lastEvaluationSummary}
          </p>
        ) : null}
        {missionState ? (
          <p className="mt-2 text-xs text-zinc-500" data-testid="profile-snapshot">
            XP {missionState.profileMetrics.totalXP} · Foundations XP{' '}
            {missionState.profileMetrics.categoryXP.FOUNDATIONS}
          </p>
        ) : null}
        {errorMessage ? (
          <p data-testid="error-banner" className="mt-2 text-sm text-red-300">
            {errorMessage}
          </p>
        ) : null}
      </section>

      {missionState ? (
        <section className="mt-4 grid gap-4 md:grid-cols-2">
          <article data-testid="narrative-region" className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 md:col-span-2">
            <h2 className="font-medium text-zinc-200">Situation</h2>
            <p data-testid="scene-text" className="mt-3 whitespace-pre-line leading-relaxed text-zinc-300">
              {missionState.currentNode.sceneText}
            </p>
          </article>

          <article data-testid="social-region" className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="font-medium text-zinc-200">Mentor</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Optional: add context or a question, then invoke — answers stay short and Socratic.
            </p>
            <textarea
              data-testid="mentor-user-message"
              value={mentorUserMessage}
              onChange={(e) => setMentorUserMessage(e.target.value)}
              placeholder="What are you stuck on?"
              className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-200"
              rows={2}
              disabled={isSubmitting || isTerminal}
            />
            <button
              data-testid="mentor-button"
              onClick={() => void invokeMentor()}
              className="mt-2 rounded-md border border-violet-500/60 bg-violet-950/40 px-3 py-1.5 text-sm text-violet-100 hover:bg-violet-900/50"
              disabled={isSubmitting || isTerminal}
            >
              Invoke mentor
            </button>
            <ul className="mt-3 space-y-2">
              {socialQueue.map((message, index) => (
                <li
                  data-testid="mentor-hint-region"
                  key={`${index}-${message.slice(0, 24)}`}
                  className="rounded-md border border-zinc-800 bg-black/30 p-2 text-sm text-zinc-300"
                >
                  {message}
                </li>
              ))}
            </ul>
          </article>

          <article data-testid="input-region" className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="font-medium text-zinc-200">Your move</h2>
            {isTerminal ? (
              <p className="mt-2 text-sm text-zinc-400">Scenario complete — dossier below.</p>
            ) : isOpenInputNode ? (
              <>
                <textarea
                  data-testid="open-input"
                  value={openInputText}
                  onChange={(event) => setOpenInputText(event.target.value)}
                  className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 p-2 text-sm"
                  rows={6}
                  disabled={isSubmitting}
                />
                <button
                  data-testid="submit-button"
                  className="mt-3 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium hover:bg-emerald-600"
                  onClick={() => void submitOpenInput()}
                  disabled={isSubmitting}
                >
                  Submit response
                </button>
              </>
            ) : isBranchingNode ? (
              branchingOptions.length > 0 ? (
                <div className="mt-3 flex flex-col gap-2">
                  {branchingOptions.map((opt) => (
                    <button
                      key={opt.choiceKey}
                      data-testid={`choice-${opt.choiceKey}`}
                      type="button"
                      className="rounded-md border border-emerald-900/80 bg-emerald-950/30 px-3 py-3 text-left text-sm text-zinc-200 hover:border-emerald-700/80"
                      onClick={() => void submitBranchingChoice(opt.choiceKey)}
                      disabled={isSubmitting}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-amber-300">No choices on this node — check scenario config.</p>
              )
            ) : null}
          </article>

          {isTerminal ? (
            <article
              data-testid="terminal-dossier"
              className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-4 md:col-span-2"
            >
              <h2 className="font-medium text-emerald-100">Dossier</h2>
              <p className="mt-2 text-sm text-zinc-300">
                Run closed. Your route, open-text evaluations, and mentor touches are logged for review.
              </p>
            </article>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
