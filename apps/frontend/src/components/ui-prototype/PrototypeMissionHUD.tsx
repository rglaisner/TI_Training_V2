'use client';

import type { NodeContext } from '@ti-training/shared';
import { useMemo } from 'react';
import { getMockAvailableScenarios } from '@/lib/ui-prototype/fixtures';
import { usePrototypeMissionStore } from '@/lib/ui-prototype/prototypeMissionStore';
import { InputModule } from '@/components/mission/modules/InputModule';
import { SocialModule } from '@/components/mission/modules/SocialModule';
import { TerminalModule } from '@/components/mission/modules/TerminalModule';
import { TimerModule } from '@/components/mission/modules/TimerModule';
import { ToolsModule } from '@/components/mission/modules/ToolsModule';
import { CoworkerInformalExchange } from '@/components/ui-prototype/CoworkerInformalExchange';

/** Mission HUD wired to ui-prototype store (no PlatformClient). @integration-boundary ui-prototype */
export function PrototypeMissionHUD() {
  const {
    missionState,
    turnCount,
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
    activeScenarioId,
    startMission,
    resetMission,
  } = usePrototypeMissionStore();

  const redoScenarioLabel = useMemo(() => {
    if (!activeScenarioId) {
      return undefined;
    }
    const cards = getMockAvailableScenarios().scenarios;
    return cards.find((c) => c.scenarioId === activeScenarioId)?.label;
  }, [activeScenarioId]);

  const scenarioCard = useMemo(() => {
    if (!activeScenarioId) {
      return undefined;
    }
    return getMockAvailableScenarios().scenarios.find((c) => c.scenarioId === activeScenarioId);
  }, [activeScenarioId]);

  if (!missionState) {
    return null;
  }

  const currentNode: NodeContext = missionState.currentNode;
  const branchingOptions = currentNode.branchingOptions ?? [];
  const isOpenInputNode = currentNode.type === 'open_input';
  const isBranchingNode = currentNode.type === 'branching';
  const isTerminal = missionState.isTerminal === true;
  const missionStepTotal = 4;
  const missionStepIndex = Math.min(Math.max(turnCount, 1), 3);
  const stepLabel = `Step ${missionStepIndex} of ${missionStepTotal}`;

  if (isTerminal) {
    return (
      <div className="mt-4">
        <TerminalModule
          missionState={missionState}
          closingFeedback={lastEvaluationSummary}
          onRedoSameScenario={activeScenarioId ? () => void startMission(activeScenarioId) : undefined}
          redoScenarioLabel={redoScenarioLabel}
          onReturnToScenarioList={() => resetMission()}
        />
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
      <div className="min-w-0 flex-1 space-y-4">
        <article
          data-testid="mission-description-region"
          className="rounded-lg border border-white/10 bg-black/40 p-4 backdrop-blur-md"
        >
          <h2 className="font-medium text-zinc-200">Mission</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{scenarioCard?.label ?? 'Training mission'}</p>
          <p className="mt-2 text-xs text-zinc-500">
            Run context and recap appear in your dossier when you finish — focus on this step for now.
          </p>
        </article>

        <article
          data-testid="tools-region"
          className="rounded-lg border border-white/10 bg-black/40 p-4 backdrop-blur-md"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-300/90" data-testid="mission-step-label">
            {stepLabel}
          </p>
          <p data-testid="status-text" className="mt-2 text-sm text-zinc-400">
            {statusMessage}
          </p>
          <ToolsModule currentNode={currentNode} isTerminal={isTerminal} />
          {lastNpcMessage ? (
            <p className="mt-3 text-sm text-zinc-200" data-testid="npc-message">
              {lastNpcMessage}
            </p>
          ) : null}
          {errorMessage ? (
            <p data-testid="error-banner" className="mt-2 text-sm text-red-300">
              {errorMessage}
            </p>
          ) : null}
          <h3 className="mt-4 text-sm font-medium text-zinc-200">This step</h3>
          <p data-testid="scene-text" className="mt-2 whitespace-pre-line leading-relaxed text-zinc-300">
            {currentNode.sceneText}
          </p>
        </article>

        {isOpenInputNode ? (
          <div className="rounded-lg border border-white/10 bg-black/30 p-4 backdrop-blur-md">
            <TimerModule isActive={!isTerminal && isOpenInputNode} />
          </div>
        ) : null}

        <InputModule
          isSubmitting={isSubmitting}
          isTerminal={isTerminal}
          isOpenInputNode={isOpenInputNode}
          isBranchingNode={isBranchingNode}
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
      </div>

      <aside className="w-full shrink-0 space-y-3 lg:sticky lg:top-4 lg:w-72 lg:max-w-sm" aria-label="Optional mission support">
        <CoworkerInformalExchange layout="aside" />
        <SocialModule
          compact
          isSubmitting={isSubmitting}
          isTerminal={isTerminal}
          mentorUserMessage={mentorUserMessage}
          onMentorUserMessageChange={setMentorUserMessage}
          onInvokeMentor={() => void invokeMentor()}
          socialQueue={socialQueue}
        />
      </aside>
    </div>
  );
}
