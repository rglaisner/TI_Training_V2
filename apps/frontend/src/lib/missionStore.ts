'use client';

import { create } from 'zustand';
import type { DecisionRequest, DecisionResponse, MissionState } from '@ti-training/shared';
import { PlatformClient, PlatformClientError } from './platformClient';

export type SocialMessageSource = 'npc' | 'mentor';

export interface SocialQueueItem {
  id: string;
  text: string;
  source: SocialMessageSource;
}

const initialStatusMessage =
  'Start the scenario to enter a 3-way stance choice, then two open-text beats (including one surprise pressure line). Mentor is optional.';

interface MissionStore {
  missionState: MissionState | null;
  statusMessage: string;
  errorMessage: string;
  openInputText: string;
  voiceEnabled: boolean;
  voicePartialTranscriptText: string;
  voiceConfirmedTranscriptText: string;
  mentorUserMessage: string;
  lastEvaluationSummary: string;
  /** Brief in-world reaction from the last decision response (branch or open input). */
  lastNpcMessage: string;
  isSubmitting: boolean;
  socialQueue: SocialQueueItem[];
  /** Clears mission UI when Firebase user changes so sessionId/nodeId cannot drift from the server. */
  resetMission: () => void;
  startMission: (scenarioId: string) => Promise<void>;
  setOpenInputText: (value: string) => void;
  setVoiceEnabled: (next: boolean) => void;
  setVoicePartialTranscriptText: (value: string) => void;
  confirmVoiceTranscript: () => void;
  setMentorUserMessage: (value: string) => void;
  submitOpenInput: () => Promise<void>;
  submitBranchingChoice: (choiceKey: string) => Promise<void>;
  invokeMentor: () => Promise<void>;
}

function clientSubmissionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function uiMessage(error: unknown): string {
  if (error instanceof PlatformClientError) {
    return error.message;
  }
  return 'We could not evaluate that turn. Try again. The scene did not move.';
}

function socialMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function mentorChallengeText(state: MissionStore): string {
  const activeNode = state.missionState?.currentNode;
  if (!activeNode) {
    return '';
  }
  const lines: string[] = [
    `Current node: ${activeNode.nodeId} (${activeNode.type})`,
    `Scene: ${activeNode.sceneText}`,
  ];
  if (state.lastEvaluationSummary.trim().length > 0) {
    lines.push(`Last evaluation: ${state.lastEvaluationSummary}`);
  }
  if (state.lastNpcMessage.trim().length > 0) {
    lines.push(`Latest world reaction: ${state.lastNpcMessage}`);
  }
  return lines.join('\n');
}

export const useMissionStore = create<MissionStore>((set, get) => ({
  missionState: null,
  statusMessage: initialStatusMessage,
  errorMessage: '',
  openInputText: '',
  voiceEnabled: false,
  voicePartialTranscriptText: '',
  voiceConfirmedTranscriptText: '',
  mentorUserMessage: '',
  lastEvaluationSummary: '',
  lastNpcMessage: '',
  isSubmitting: false,
  socialQueue: [],
  resetMission: () =>
    set({
      missionState: null,
      statusMessage: initialStatusMessage,
      errorMessage: '',
      openInputText: '',
      voiceEnabled: false,
      voicePartialTranscriptText: '',
      voiceConfirmedTranscriptText: '',
      mentorUserMessage: '',
      lastEvaluationSummary: '',
      lastNpcMessage: '',
      isSubmitting: false,
      socialQueue: [],
    }),
  startMission: async (scenarioId: string) => {
    set({
      isSubmitting: true,
      statusMessage: 'Loading scenario…',
      errorMessage: '',
      lastEvaluationSummary: '',
      lastNpcMessage: '',
      openInputText: '',
      voiceEnabled: false,
      voicePartialTranscriptText: '',
      voiceConfirmedTranscriptText: '',
      mentorUserMessage: '',
      socialQueue: [],
    });
    try {
      const missionState = await PlatformClient.startMission({ scenarioId });
      set({
        missionState,
        isSubmitting: false,
        statusMessage: 'Scenario live. Choose your first move.',
      });
    } catch (error) {
      set({
        isSubmitting: false,
        errorMessage: uiMessage(error),
        statusMessage: 'We could not evaluate that turn.',
      });
    }
  },
  setOpenInputText: (value: string) => set({ openInputText: value }),
  setVoiceEnabled: (next: boolean) =>
    set({
      voiceEnabled: next,
      voicePartialTranscriptText: next ? get().voicePartialTranscriptText : '',
      voiceConfirmedTranscriptText: next ? get().voiceConfirmedTranscriptText : '',
    }),
  setVoicePartialTranscriptText: (value: string) =>
    set({
      voicePartialTranscriptText: value,
      // Partial edits invalidate the last confirmed transcript; users must confirm again.
      voiceConfirmedTranscriptText: '',
      openInputText: value.trim(),
    }),
  confirmVoiceTranscript: () => {
    const state = get();
    const confirmed = state.voicePartialTranscriptText.trim();
    set({
      voiceConfirmedTranscriptText: confirmed,
      openInputText: confirmed,
    });
  },
  setMentorUserMessage: (value: string) => set({ mentorUserMessage: value }),
  submitOpenInput: async () => {
    const state = get();
    if (!state.missionState) {
      return;
    }
    if (state.openInputText.trim().length === 0) {
      set({
        errorMessage: 'Your response is empty. Add your decision before submitting.',
        statusMessage: 'Waiting for your decision…',
      });
      return;
    }
    set({ isSubmitting: true, statusMessage: 'Evaluation running…', errorMessage: '' });
    const voice =
      state.voiceEnabled && state.voiceConfirmedTranscriptText.trim()
        ? { transcriptText: state.voiceConfirmedTranscriptText.trim() }
        : undefined;
    const request: DecisionRequest = {
      sessionId: state.missionState.sessionId,
      nodeId: state.missionState.currentNode.nodeId,
      clientSubmissionId: clientSubmissionId(),
      openInput: { inputText: state.openInputText },
      ...(voice ? { voice } : {}),
    };
    try {
      const payload: DecisionResponse = await PlatformClient.submitDecision(request);
      const evalLine = payload.feedback?.evaluation
        ? `Score ${payload.feedback.evaluation.awardedScore}/100 — ${payload.feedback.evaluation.feedbackText}`
        : '';
      const npc = payload.feedback?.npcMessage?.trim() ?? '';
      const nextSocialQueue = npc
        ? [
            ...state.socialQueue,
            {
              id: socialMessageId(),
              text: npc,
              source: 'npc' as const,
            },
          ]
        : state.socialQueue;
      set({
        missionState: payload.missionState,
        openInputText: '',
        voiceEnabled: false,
        voicePartialTranscriptText: '',
        voiceConfirmedTranscriptText: '',
        lastEvaluationSummary: evalLine,
        lastNpcMessage: npc,
        socialQueue: nextSocialQueue,
        isSubmitting: false,
        statusMessage: payload.missionState.isTerminal
          ? 'Scenario complete.'
          : 'Decision accepted.',
      });
    } catch (error) {
      set({
        isSubmitting: false,
        errorMessage: uiMessage(error),
        statusMessage: 'We could not evaluate that turn.',
      });
    }
  },
  submitBranchingChoice: async (choiceKey: string) => {
    const state = get();
    if (!state.missionState) {
      return;
    }
    set({ isSubmitting: true, statusMessage: 'Evaluation running…', errorMessage: '' });
    const request: DecisionRequest = {
      sessionId: state.missionState.sessionId,
      nodeId: state.missionState.currentNode.nodeId,
      clientSubmissionId: clientSubmissionId(),
      branchingChoice: { choiceKey },
    };
    try {
      const payload: DecisionResponse = await PlatformClient.submitDecision(request);
      const npc = payload.feedback?.npcMessage?.trim() ?? '';
      const nextSocialQueue = npc
        ? [
            ...state.socialQueue,
            {
              id: socialMessageId(),
              text: npc,
              source: 'npc' as const,
            },
          ]
        : state.socialQueue;
      set({
        missionState: payload.missionState,
        lastNpcMessage: npc,
        socialQueue: nextSocialQueue,
        voiceEnabled: false,
        voicePartialTranscriptText: '',
        voiceConfirmedTranscriptText: '',
        isSubmitting: false,
        statusMessage: payload.missionState.isTerminal
          ? 'Scenario complete.'
          : 'Decision accepted.',
      });
    } catch (error) {
      set({
        isSubmitting: false,
        errorMessage: uiMessage(error),
        statusMessage: 'We could not evaluate that turn.',
      });
    }
  },
  invokeMentor: async () => {
    const state = get();
    if (!state.missionState) {
      return;
    }
    set({ isSubmitting: true, statusMessage: 'Evaluation running…', errorMessage: '' });
    try {
      const response = await PlatformClient.invokeMentor({
        sessionId: state.missionState.sessionId,
        nodeId: state.missionState.currentNode.nodeId,
        clientSubmissionId: clientSubmissionId(),
        userMessage: state.mentorUserMessage.trim() || undefined,
        challengeText: mentorChallengeText(state),
      });
      const mentorText = response.mentorHint?.message?.trim() ?? '';
      set({
        missionState: response.missionState,
        socialQueue: mentorText
          ? [
              ...state.socialQueue,
              {
                id: socialMessageId(),
                text: mentorText,
                source: 'mentor' as const,
              },
            ]
          : state.socialQueue,
        voiceEnabled: false,
        voicePartialTranscriptText: '',
        voiceConfirmedTranscriptText: '',
        isSubmitting: false,
        statusMessage: 'Mentor reply added. Node unchanged until you submit a decision.',
      });
    } catch (error) {
      set({
        isSubmitting: false,
        errorMessage: uiMessage(error),
        statusMessage: 'We could not evaluate that turn.',
      });
    }
  },
}));
