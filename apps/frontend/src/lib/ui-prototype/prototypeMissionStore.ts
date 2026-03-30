'use client';

import { create } from 'zustand';
import type { DecisionResponse, MissionRunMetadata, MissionState, NodeContext } from '@ti-training/shared';
import { createMockProfileMetrics } from '@/lib/ui-prototype/mockProfileMetrics';

export type SocialMessageSource = 'npc' | 'mentor';

export interface SocialQueueItem {
  id: string;
  text: string;
  source: SocialMessageSource;
}

const initialStatusMessage =
  'Prototype mode: no backend calls. Start a scenario to practice the HUD (branching → open input → dossier).';

/** Rotating copy to mimic backend “same spine, new branch” on each replay. */
const SCENARIO_RUN_VARIANTS: Record<string, readonly string[]> = {
  'scenario-1': [
    'Northbridge • contractor signal +14%',
    'Northbridge • legal review pacing',
    'Northbridge • comms draft hold',
    'Northbridge • amended CHRO timeline',
  ],
  'scenario-1-exec-shock': [
    'CFO flash • liquidity bridge',
    'CFO flash • board prep squeeze',
    'CFO flash • vendor payment gate',
  ],
};

const DEFAULT_RUN_VARIANTS = [
  'Run • branch variation A',
  'Run • branch variation B',
  'Run • branch variation C',
  'Run • branch variation D',
] as const;

const OPENING_SCENE_ROTATIONS = [
  'Northbridge Labs hiring freeze — choose your first move.',
  'Northbridge update: the CHRO wants a tighter readout before the offsite — choose your first move.',
  'Northbridge: staffing signal shifted overnight — choose your first move.',
  'Northbridge: exec inbox reprioritized your lane — choose your first move.',
] as const;

function runVariantForReplay(scenarioId: string, runNumber: number): MissionRunMetadata {
  const list = SCENARIO_RUN_VARIANTS[scenarioId] ?? DEFAULT_RUN_VARIANTS;
  const idx = (runNumber - 1) % list.length;
  return {
    sessionSeed: Math.floor(Math.random() * 1_000_000),
    variantLabel: list[idx],
  };
}

function branchingStartNode(flavorIndex: number): NodeContext {
  const sceneText = OPENING_SCENE_ROTATIONS[flavorIndex % OPENING_SCENE_ROTATIONS.length];
  return {
    nodeId: 'node-1',
    type: 'branching',
    sceneText,
    branchingOptions: [
      {
        choiceKey: 'route_legal_first',
        label: 'Route through Legal first',
        nextNodeId: 'node-open-legal',
      },
      {
        choiceKey: 'route_pragmatic_ship',
        label: 'Ship ranges tonight; align Legal tomorrow',
        nextNodeId: 'node-open-legal',
      },
      {
        choiceKey: 'route_huddle',
        label: 'Force a leadership huddle now',
        nextNodeId: 'node-open-legal',
      },
    ],
  };
}

const openInputNode: NodeContext = {
  nodeId: 'node-open-legal',
  type: 'open_input',
  sceneText: 'Legal replies: tighten your note before the CHRO readout.',
  nextNodeId: 'terminal-1',
  openInputConfig: {
    targetCompetencies: ['ti_data_integrity'],
    evaluationPrompt: 'Evaluate using strict JSON contract.',
  },
};

function initialMissionState(
  sessionId: string,
  scenarioId: string,
  runNumber: number,
): MissionState {
  const flavorIndex = runNumber - 1;
  return {
    sessionId,
    currentNode: branchingStartNode(flavorIndex),
    profileMetrics: createMockProfileMetrics({ totalXP: 0 }),
    isTerminal: false,
    runMetadata: runVariantForReplay(scenarioId, runNumber),
  };
}

function socialMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readSimulateOpenInputFailure(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  const flag = document.body.dataset.tiPrototypeSimulateOpenInput422;
  if (flag === '1') {
    document.body.dataset.tiPrototypeSimulateOpenInput422 = '';
    return true;
  }
  return false;
}

export interface ResetMissionOptions {
  clearReplayHistory?: boolean;
}

interface PrototypeMissionStoreState {
  missionState: MissionState | null;
  /** Scenario id for the current or last started run (for redo from dossier). */
  activeScenarioId: string | null;
  /** Number of times each scenario was started in this session (for copy / prototype variant rotation). */
  replayCountByScenario: Record<string, number>;
  turnCount: number;
  statusMessage: string;
  errorMessage: string;
  openInputText: string;
  voiceEnabled: boolean;
  voicePartialTranscriptText: string;
  voiceConfirmedTranscriptText: string;
  mentorUserMessage: string;
  lastEvaluationSummary: string;
  lastNpcMessage: string;
  isSubmitting: boolean;
  socialQueue: SocialQueueItem[];
  resetMission: (options?: ResetMissionOptions) => void;
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

export const usePrototypeMissionStore = create<PrototypeMissionStoreState>((set, get) => ({
  missionState: null,
  activeScenarioId: null,
  replayCountByScenario: {},
  turnCount: 0,
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
  resetMission: (options?: ResetMissionOptions) => {
    const clearReplayHistory = options?.clearReplayHistory ?? false;
    set({
      missionState: null,
      activeScenarioId: null,
      replayCountByScenario: clearReplayHistory ? {} : get().replayCountByScenario,
      turnCount: 0,
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
    });
  },
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
    await new Promise((r) => {
      window.setTimeout(r, 120);
    });
    const prevCounts = get().replayCountByScenario;
    const runNumber = (prevCounts[scenarioId] ?? 0) + 1;
    const replayCountByScenario = { ...prevCounts, [scenarioId]: runNumber };
    const sessionId = `prototype-${scenarioId}-${Date.now()}`;
    set({
      missionState: initialMissionState(sessionId, scenarioId, runNumber),
      activeScenarioId: scenarioId,
      replayCountByScenario,
      turnCount: 1,
      isSubmitting: false,
      statusMessage: 'Scenario live. Choose your first move.',
    });
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
      voiceConfirmedTranscriptText: '',
      openInputText: value.trim(),
    }),
  confirmVoiceTranscript: () => {
    const confirmed = get().voicePartialTranscriptText.trim();
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
    if (readSimulateOpenInputFailure()) {
      set({
        isSubmitting: false,
        errorMessage: 'We could not evaluate that turn',
        statusMessage: 'We could not evaluate that turn.',
      });
      return;
    }
    set({ isSubmitting: true, statusMessage: 'Evaluation running…', errorMessage: '' });
    await new Promise((r) => {
      window.setTimeout(r, 150);
    });
    const voice =
      state.voiceEnabled && state.voiceConfirmedTranscriptText.trim()
        ? { transcriptText: state.voiceConfirmedTranscriptText.trim() }
        : undefined;
    void voice;
    const evalLine = 'Score 78/100 — Calm boundary-setting; tighten evidence citations.';
    const npc = 'The CHRO holds on your last line, waiting for the measurable claim.';
    const prev = state.missionState;
    const payload: DecisionResponse = {
      missionState: {
        ...prev,
        isTerminal: true,
        profileMetrics: createMockProfileMetrics({ totalXP: prev.profileMetrics.totalXP + 150 }),
        currentNode: {
          nodeId: 'terminal-1',
          type: 'branching',
          sceneText: 'Terminal scene',
        },
      },
      feedback: {
        npcMessage: npc,
        evaluation: {
          targetCompetency: 'ti_data_integrity',
          awardedScore: 78,
          demonstrated: true,
          feedbackText: 'Calm boundary-setting; tighten evidence citations.',
        },
      },
    };
    set({
      missionState: payload.missionState,
      turnCount: state.turnCount + 1,
      openInputText: '',
      voiceEnabled: false,
      voicePartialTranscriptText: '',
      voiceConfirmedTranscriptText: '',
      lastEvaluationSummary: evalLine,
      lastNpcMessage: npc,
      socialQueue: [
        ...state.socialQueue,
        { id: socialMessageId(), text: npc, source: 'npc' as const },
      ],
      isSubmitting: false,
      statusMessage: 'Scenario complete.',
    });
  },
  submitBranchingChoice: async (choiceKey: string) => {
    const state = get();
    if (!state.missionState) {
      return;
    }
    void choiceKey;
    set({ isSubmitting: true, statusMessage: 'Evaluation running…', errorMessage: '' });
    await new Promise((r) => {
      window.setTimeout(r, 120);
    });
    const prev = state.missionState;
    set({
      missionState: {
        ...prev,
        currentNode: openInputNode,
        isTerminal: false,
      },
      turnCount: state.turnCount + 1,
      lastNpcMessage: '',
      voiceEnabled: false,
      voicePartialTranscriptText: '',
      voiceConfirmedTranscriptText: '',
      isSubmitting: false,
      statusMessage: 'Decision accepted.',
    });
  },
  invokeMentor: async () => {
    const state = get();
    if (!state.missionState) {
      return;
    }
    set({ isSubmitting: true, statusMessage: 'Evaluation running…', errorMessage: '' });
    await new Promise((r) => {
      window.setTimeout(r, 100);
    });
    const mentorText =
      state.mentorUserMessage.trim().length > 0
        ? `Mentor: "${state.mentorUserMessage.trim()}" — anchor on stakeholder trade-offs, not tone.`
        : 'Mentor hint message';
    set({
      socialQueue: [
        ...state.socialQueue,
        {
          id: socialMessageId(),
          text: mentorText,
          source: 'mentor' as const,
        },
      ],
      isSubmitting: false,
      statusMessage: 'Mentor reply added. Node unchanged until you submit a decision.',
      mentorUserMessage: '',
    });
  },
}));
