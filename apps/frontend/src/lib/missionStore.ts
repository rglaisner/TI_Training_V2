'use client';

import { create } from 'zustand';
import type { DecisionRequest, DecisionResponse, MissionState } from '@ti-training/shared';
import { PlatformClient, PlatformClientError } from './platformClient';

const initialStatusMessage =
  'Start the scenario to enter a 3-way stance choice, then two open-text beats (including one surprise pressure line). Mentor is optional.';

interface MissionStore {
  missionState: MissionState | null;
  statusMessage: string;
  errorMessage: string;
  openInputText: string;
  mentorUserMessage: string;
  lastEvaluationSummary: string;
  /** Brief in-world reaction from the last decision response (branch or open input). */
  lastNpcMessage: string;
  isSubmitting: boolean;
  socialQueue: string[];
  /** Clears mission UI when Firebase user changes so sessionId/nodeId cannot drift from the server. */
  resetMission: () => void;
  startMission: (scenarioId: string) => Promise<void>;
  setOpenInputText: (value: string) => void;
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

export const useMissionStore = create<MissionStore>((set, get) => ({
  missionState: null,
  statusMessage: initialStatusMessage,
  errorMessage: '',
  openInputText: '',
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
      mentorUserMessage: '',
      lastEvaluationSummary: '',
      lastNpcMessage: '',
      isSubmitting: false,
      socialQueue: [],
    }),
  startMission: async (scenarioId: string) => {
    set({
      isSubmitting: true,
      statusMessage: 'Evaluation running…',
      errorMessage: '',
      lastEvaluationSummary: '',
      lastNpcMessage: '',
    });
    try {
      const missionState = await PlatformClient.startMission({ scenarioId });
      set({
        missionState,
        isSubmitting: false,
        statusMessage: 'Waiting for your decision…',
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
  setMentorUserMessage: (value: string) => set({ mentorUserMessage: value }),
  submitOpenInput: async () => {
    const state = get();
    if (!state.missionState) {
      return;
    }
    set({ isSubmitting: true, statusMessage: 'Evaluation running…', errorMessage: '' });
    const request: DecisionRequest = {
      sessionId: state.missionState.sessionId,
      nodeId: state.missionState.currentNode.nodeId,
      clientSubmissionId: clientSubmissionId(),
      openInput: { inputText: state.openInputText },
    };
    try {
      const payload: DecisionResponse = await PlatformClient.submitDecision(request);
      const evalLine = payload.feedback?.evaluation
        ? `Score ${payload.feedback.evaluation.awardedScore}/100 — ${payload.feedback.evaluation.feedbackText}`
        : '';
      const npc = payload.feedback?.npcMessage?.trim() ?? '';
      set({
        missionState: payload.missionState,
        openInputText: '',
        lastEvaluationSummary: evalLine,
        lastNpcMessage: npc,
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
      set({
        missionState: payload.missionState,
        lastNpcMessage: npc,
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
      });
      set({
        missionState: response.missionState,
        socialQueue: response.mentorHint?.message
          ? [...state.socialQueue, response.mentorHint.message]
          : state.socialQueue,
        isSubmitting: false,
        statusMessage: 'Waiting for your decision…',
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
