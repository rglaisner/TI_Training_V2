'use client';

import { create } from 'zustand';
import type { DecisionRequest, MissionState } from '@ti-training/shared';
import { PlatformClient, PlatformClientError } from './platformClient';

const initialStatusMessage =
  'Click Start Scenario 1 to begin. You will get branching choices or a text box depending on the step — the server sends each scene.';

interface MissionStore {
  missionState: MissionState | null;
  statusMessage: string;
  errorMessage: string;
  openInputText: string;
  isSubmitting: boolean;
  socialQueue: string[];
  /** Clears mission UI when Firebase user changes so sessionId/nodeId cannot drift from the server. */
  resetMission: () => void;
  startMission: (scenarioId: string) => Promise<void>;
  setOpenInputText: (value: string) => void;
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
  isSubmitting: false,
  socialQueue: [],
  resetMission: () =>
    set({
      missionState: null,
      statusMessage: initialStatusMessage,
      errorMessage: '',
      openInputText: '',
      isSubmitting: false,
      socialQueue: [],
    }),
  startMission: async (scenarioId: string) => {
    set({
      isSubmitting: true,
      statusMessage: 'Evaluation running…',
      errorMessage: '',
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
      const missionState = await PlatformClient.submitDecision(request);
      set({
        missionState,
        openInputText: '',
        isSubmitting: false,
        statusMessage: missionState.isTerminal ? 'Scenario complete.' : 'Decision accepted.',
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
      const missionState = await PlatformClient.submitDecision(request);
      set({
        missionState,
        isSubmitting: false,
        statusMessage: missionState.isTerminal ? 'Scenario complete.' : 'Decision accepted.',
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
