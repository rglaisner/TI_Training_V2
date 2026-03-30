'use client';

import type { BranchingOption } from '@ti-training/shared';

export interface InputModuleProps {
  isSubmitting: boolean;
  isTerminal: boolean;
  isOpenInputNode: boolean;
  isBranchingNode: boolean;
  branchingOptions: readonly BranchingOption[];
  openInputText: string;
  onOpenInputTextChange: (value: string) => void;
  voiceEnabled: boolean;
  voicePartialTranscriptText: string;
  voiceConfirmedTranscriptText: string;
  onSetVoiceEnabled: (next: boolean) => void;
  onSetVoicePartialTranscriptText: (value: string) => void;
  onConfirmVoiceTranscript: () => void;
  onSubmitOpenInput: () => void;
  onSubmitBranchingChoice: (choiceKey: string) => void;
}

export function InputModule({
  isSubmitting,
  isTerminal,
  isOpenInputNode,
  isBranchingNode,
  branchingOptions,
  openInputText,
  onOpenInputTextChange,
  voiceEnabled,
  voicePartialTranscriptText,
  voiceConfirmedTranscriptText,
  onSetVoiceEnabled,
  onSetVoicePartialTranscriptText,
  onConfirmVoiceTranscript,
  onSubmitOpenInput,
  onSubmitBranchingChoice,
}: InputModuleProps) {
  const canSubmitOpenInput =
    openInputText.trim().length > 0 &&
    (!voiceEnabled || voiceConfirmedTranscriptText.trim().length > 0);

  return (
    <article data-testid="input-region" className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <h2 className="font-medium text-zinc-200">Your move</h2>
      {isTerminal ? (
        <p className="mt-2 text-sm text-zinc-400">Scenario complete — dossier below.</p>
      ) : isOpenInputNode ? (
        <>
          <div className="mt-2 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-200">
              <input
                data-testid="voice-mode-toggle"
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => onSetVoiceEnabled(e.target.checked)}
                disabled={isSubmitting}
              />
              Voice transcript mode
            </label>
            {voiceEnabled ? (
              <span className="text-xs text-amber-300">Confirm transcript before submitting</span>
            ) : null}
          </div>
          <textarea
            data-testid="open-input"
            value={openInputText}
            onChange={(event) => onOpenInputTextChange(event.target.value)}
            className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 p-2 text-sm"
            rows={6}
            disabled={isSubmitting || voiceEnabled}
            placeholder="Write your decision, boundaries, and evidence in clear business language."
          />
          {voiceEnabled ? (
            <div className="mt-3 rounded-lg border border-zinc-800 bg-black/20 p-3">
              <div className="text-xs font-medium text-zinc-200">Transcript (partial)</div>
              <textarea
                data-testid="voice-transcript-partial"
                value={voicePartialTranscriptText}
                onChange={(e) => onSetVoicePartialTranscriptText(e.target.value)}
                className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-200"
                rows={4}
                disabled={isSubmitting}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <p data-testid="voice-confirmation-status" className="text-xs text-zinc-400">
                  {voiceConfirmedTranscriptText.trim().length > 0
                    ? 'Transcript confirmed (scoring is allowed)'
                    : 'Not confirmed yet (scoring is disabled)'}
                </p>
                <button
                  data-testid="voice-confirm-transcript"
                  type="button"
                  className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => onConfirmVoiceTranscript()}
                  disabled={isSubmitting || !voicePartialTranscriptText.trim().length}
                >
                  Confirm transcript
                </button>
              </div>
            </div>
          ) : null}
          <button
            data-testid="submit-button"
            className="mt-3 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => onSubmitOpenInput()}
            disabled={isSubmitting || !canSubmitOpenInput}
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
                onClick={() => onSubmitBranchingChoice(opt.choiceKey)}
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
  );
}

