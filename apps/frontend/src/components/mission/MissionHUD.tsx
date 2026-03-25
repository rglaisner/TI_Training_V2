'use client';

import type { NodeContext } from '@ti-training/shared';
import { useMissionStore } from '@/lib/missionStore';
import { InputModule } from './modules/InputModule';
import { SocialModule } from './modules/SocialModule';
import { TerminalModule } from './modules/TerminalModule';
import { TimerModule } from './modules/TimerModule';
import { ToolsModule } from './modules/ToolsModule';

export function MissionHUD() {
  const {
    missionState,
    statusMessage,
    errorMessage,
    openInputText,
    voiceEnabled,
    voicePartialTranscriptText,
    voiceConfirmedTranscriptText,
    mentorUserMessage,
    lastEvaluationSummary,
    lastNpcMessage,
    isSubmitting,
    socialQueue,
    submitOpenInput,
    submitBranchingChoice,
    invokeMentor,
    setOpenInputText,
    setVoiceEnabled,
    setVoicePartialTranscriptText,
    confirmVoiceTranscript,
    setMentorUserMessage,
  } = useMissionStore();

  if (!missionState) {
    return null;
  }

  const currentNode: NodeContext = missionState.currentNode;
  const branchingOptions = currentNode.branchingOptions ?? [];
  const isOpenInputNode = currentNode.type === 'open_input';
  const isBranchingNode = currentNode.type === 'branching';
  const isTerminal = missionState.isTerminal === true;

  return (
    <div>
      <section data-testid="tools-region" className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <p data-testid="status-text" className="text-sm text-zinc-300">
          {statusMessage}
        </p>
        <TimerModule isActive={!isTerminal && isOpenInputNode} />
        <ToolsModule currentNode={currentNode} isTerminal={isTerminal} />
        {missionState.runMetadata ? (
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

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <article data-testid="narrative-region" className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 md:col-span-2">
          <h2 className="font-medium text-zinc-200">Situation</h2>
          <p data-testid="scene-text" className="mt-3 whitespace-pre-line leading-relaxed text-zinc-300">
            {currentNode.sceneText}
          </p>
        </article>

        <SocialModule
          isSubmitting={isSubmitting}
          isTerminal={isTerminal}
          mentorUserMessage={mentorUserMessage}
          onMentorUserMessageChange={setMentorUserMessage}
          onInvokeMentor={() => void invokeMentor()}
          socialQueue={socialQueue}
        />

        <InputModule
          isSubmitting={isSubmitting}
          isTerminal={isTerminal}
          isOpenInputNode={isOpenInputNode}
          isBranchingNode={isBranchingNode}
          currentNode={currentNode}
          branchingOptions={branchingOptions}
          openInputText={openInputText}
          onOpenInputTextChange={setOpenInputText}
          voiceEnabled={voiceEnabled}
          voicePartialTranscriptText={voicePartialTranscriptText}
          voiceConfirmedTranscriptText={voiceConfirmedTranscriptText}
          onSetVoiceEnabled={(next) => setVoiceEnabled(next)}
          onSetVoicePartialTranscriptText={(value) => setVoicePartialTranscriptText(value)}
          onConfirmVoiceTranscript={() => confirmVoiceTranscript()}
          onSubmitOpenInput={() => void submitOpenInput()}
          onSubmitBranchingChoice={(choiceKey) => void submitBranchingChoice(choiceKey)}
        />

        {isTerminal ? <TerminalModule missionState={missionState} /> : null}
      </section>
    </div>
  );
}

