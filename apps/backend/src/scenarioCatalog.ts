import {
  NodeContextSchema,
  type NodeContext,
  type TICompetency,
  type ScenarioCard,
} from '@ti-training/shared';

const TI_DATA: TICompetency = 'ti_data_integrity';
const TI_STAKE: TICompetency = 'ti_stakeholder_mgmt';
const TI_EXEC: TICompetency = 'ti_exec_comms';

/**
 * Raw templates use {{company}}, {{metric}}, {{beat}} where noted.
 * Branching uses >=3 options and now maintains divergence longer so consequences are visible.
 */
const SCENARIO_NODES: Record<string, Record<string, NodeContext>> = {
  'scenario-1': {
    'node-1': {
      nodeId: 'node-1',
      type: 'branching',
      sceneText: [
        '{{company}} is freezing external hiring for Q3 while still promising an “AI-ready workforce” story to the board.',
        'You own the Talent Intelligence packet for tomorrow’s CHRO readout. Finance says headcount is flat; your skills graph shows a {{metric}}% rise in critical AI-adjacent roles that are mostly contractor-led.',
        'Legal warns that sharing contractor names could breach vendor NDAs. The CEO’s chief of staff pings you: “We need a single storyline the CHRO can defend in five minutes.”',
        'What is your first move?',
      ].join('\n\n'),
      branchingOptions: [
        {
          choiceKey: 'route_legal_first',
          label:
            'Route everything through Legal first: no external-facing numbers until definitions and NDA boundaries are signed in writing.',
          nextNodeId: 'node-open-legal',
        },
        {
          choiceKey: 'route_pragmatic_ship',
          label:
            'Ship a defensible interim packet tonight (ranges and cohorts, no individual identifiers) and schedule Legal + Finance for a hard alignment block tomorrow.',
          nextNodeId: 'node-open-pragmatic',
        },
        {
          choiceKey: 'route_huddle',
          label:
            'Force a short leadership huddle now (CHRO + Legal + Finance + you) to lock narrative, risks, and what will not be claimed.',
          nextNodeId: 'node-open-huddle',
        },
      ],
    },
    'node-open-legal': {
      nodeId: 'node-open-legal',
      type: 'open_input',
      nextNodeId: 'node-pressure-legal',
      sceneText: [
        'Legal replies: “We can sign off on ranges, but we will not bless language that implies headcount stability if contractors are material.”',
        'Draft the exact note you send back: (1) what you will show, (2) what you refuse to imply, (3) one question you need answered before the CHRO steps on stage.',
      ].join('\n\n'),
      openInputConfig: {
        targetCompetencies: [TI_DATA, TI_STAKE],
        evaluationPrompt: [
          'Score the learner on ti_data_integrity and ti_stakeholder_mgmt.',
          'Look for: explicit boundary on identifiers/NDAs, honest framing of contractor materiality, and a concrete question that unblocks Legal without bullying them.',
          'Return ONLY JSON: {"Score": number 0-1, "Demonstrated": boolean, "Feedback": string}',
        ].join(' '),
      },
    },
    'node-open-pragmatic': {
      nodeId: 'node-open-pragmatic',
      type: 'open_input',
      nextNodeId: 'node-pressure-pragmatic',
      sceneText: [
        'You chose speed with guardrails. Finance asks for one paragraph they can paste to the CFO: what changed, what stayed flat, and where contractors sit.',
        'Write that paragraph. Then add a single sentence that states a reputational or compliance risk you are not hiding.',
      ].join('\n\n'),
      openInputConfig: {
        targetCompetencies: [TI_EXEC, TI_DATA],
        evaluationPrompt: [
          'Score on ti_exec_comms and ti_data_integrity.',
          'Look for: executive-plain language, numerate honesty (no overclaim), explicit contractor signal without leaking identifiers, and a credible risk line.',
          'Return ONLY JSON: {"Score": number 0-1, "Demonstrated": boolean, "Feedback": string}',
        ].join(' '),
      },
    },
    'node-open-huddle': {
      nodeId: 'node-open-huddle',
      type: 'open_input',
      nextNodeId: 'node-pressure-huddle',
      sceneText: [
        'In the huddle, the CHRO pushes: “If we sound flat on headcount while AI roles spike, the board will torch us. Give me the one-sentence truth and the one-sentence hope.”',
        'Write both sentences. Then list two stakeholders whose buy-in you still need after the huddle, and what you need from each.',
      ].join('\n\n'),
      openInputConfig: {
        targetCompetencies: [TI_STAKE, TI_EXEC],
        evaluationPrompt: [
          'Score on ti_stakeholder_mgmt and ti_exec_comms.',
          'Look for: tension held between truth and aspiration without lying, stakeholder-specific asks, and operational clarity.',
          'Return ONLY JSON: {"Score": number 0-1, "Demonstrated": boolean, "Feedback": string}',
        ].join(' '),
      },
    },
    'node-pressure-legal': {
      nodeId: 'node-pressure-legal',
      type: 'open_input',
      nextNodeId: 'node-finale-legal',
      sceneText: [
        '{{beat}}',
        'Because you chose a legal-first route, the CHRO now asks for language that keeps legal confidence while still sounding decisive.',
        'In 3-6 sentences: name your final recommendation, evidence line, what you still refuse to imply, and the legal-safe close you will use in live Q&A.',
      ].join('\n\n'),
      openInputConfig: {
        targetCompetencies: [TI_DATA, TI_EXEC, TI_STAKE],
        evaluationPrompt: [
          'Score holistically on ti_data_integrity, ti_exec_comms, and ti_stakeholder_mgmt.',
          'Look for: decision clarity, evidence discipline, explicit legal boundaries, and live-Q&A poise referencing the surprise event without inventing fake data.',
          'Return ONLY JSON: {"Score": number 0-1, "Demonstrated": boolean, "Feedback": string}',
        ].join(' '),
      },
    },
    'node-pressure-pragmatic': {
      nodeId: 'node-pressure-pragmatic',
      type: 'open_input',
      nextNodeId: 'node-finale-pragmatic',
      sceneText: [
        '{{beat}}',
        'Because you chose speed-first delivery, Finance now asks for a confidence-rated close they can defend if challenged by the board.',
        'In 3-6 sentences: give your recommendation, confidence level, evidence line, and the one risk line you will explicitly own live.',
      ].join('\n\n'),
      openInputConfig: {
        targetCompetencies: [TI_DATA, TI_EXEC, TI_STAKE],
        evaluationPrompt: [
          'Score holistically on ti_data_integrity, ti_exec_comms, and ti_stakeholder_mgmt.',
          'Look for: explicit confidence framing, evidence discipline, transparent risk ownership, and live-Q&A poise without overclaiming.',
          'Return ONLY JSON: {"Score": number 0-1, "Demonstrated": boolean, "Feedback": string}',
        ].join(' '),
      },
    },
    'node-pressure-huddle': {
      nodeId: 'node-pressure-huddle',
      type: 'open_input',
      nextNodeId: 'node-finale-huddle',
      sceneText: [
        '{{beat}}',
        'Because you convened leadership early, the CHRO expects a unified close that includes explicit owner-by-owner commitments.',
        'In 3-6 sentences: give your recommendation, evidence line, what you will not claim, and who owns each immediate follow-up in the room.',
      ].join('\n\n'),
      openInputConfig: {
        targetCompetencies: [TI_DATA, TI_EXEC, TI_STAKE],
        evaluationPrompt: [
          'Score holistically on ti_data_integrity, ti_exec_comms, and ti_stakeholder_mgmt.',
          'Look for: decision clarity, evidence discipline, explicit boundaries, and named stakeholder ownership under pressure.',
          'Return ONLY JSON: {"Score": number 0-1, "Demonstrated": boolean, "Feedback": string}',
        ].join(' '),
      },
    },
    'node-finale-legal': {
      nodeId: 'node-finale-legal',
      type: 'branching',
      sceneText:
        'Final pressure route: Legal-safe closer. Choose the closing posture you will use in the board room right now.',
      branchingOptions: [
        {
          choiceKey: 'close_legal_risk_guardrail',
          label: 'Lead with risk guardrail first, then evidence.',
          nextNodeId: 'terminal-1',
        },
        {
          choiceKey: 'close_legal_balance',
          label: 'Balance evidence and legal constraints in one concise statement.',
          nextNodeId: 'terminal-1',
        },
        {
          choiceKey: 'close_legal_owner_matrix',
          label: 'Close with a stakeholder owner matrix and legal-safe wording.',
          nextNodeId: 'terminal-1',
        },
      ],
    },
    'node-finale-pragmatic': {
      nodeId: 'node-finale-pragmatic',
      type: 'branching',
      sceneText:
        'Final pressure route: Speed-with-accountability closer. Choose your final executive stance before readout.',
      branchingOptions: [
        {
          choiceKey: 'close_speed_confidence_call',
          label: 'Commit with confidence range and explicit assumptions.',
          nextNodeId: 'terminal-1',
        },
        {
          choiceKey: 'close_speed_safeguard',
          label: 'Commit now with follow-up safeguard check at 24 hours.',
          nextNodeId: 'terminal-1',
        },
        {
          choiceKey: 'close_speed_board_escalation',
          label: 'Escalate one uncertainty to board with mitigation plan.',
          nextNodeId: 'terminal-1',
        },
      ],
    },
    'node-finale-huddle': {
      nodeId: 'node-finale-huddle',
      type: 'branching',
      sceneText:
        'Final pressure route: Alignment-first closer. Choose the synthesis posture you will use in the room.',
      branchingOptions: [
        {
          choiceKey: 'close_huddle_truth_first',
          label: 'Lead with hard truth, then aligned action commitments.',
          nextNodeId: 'terminal-1',
        },
        {
          choiceKey: 'close_huddle_conflict_explicit',
          label: 'Name unresolved tension explicitly and assign owners.',
          nextNodeId: 'terminal-1',
        },
        {
          choiceKey: 'close_huddle_board_safe',
          label: 'Use a board-safe narrative with strict evidence boundaries.',
          nextNodeId: 'terminal-1',
        },
      ],
    },
  },
  'scenario-2': {
    'node-1': {
      nodeId: 'node-1',
      type: 'branching',
      sceneText: [
        '{{company}} faces a board challenge: your workforce capability deck claims AI readiness while internal delivery logs show delayed execution.',
        'You are asked to prepare a same-day correction strategy before the CEO town hall.',
        'What is your opening move?',
      ].join('\n\n'),
      branchingOptions: [
        {
          choiceKey: 'route_exec_brief',
          label: 'Brief the CEO and CHRO with a correction narrative before wider communication.',
          nextNodeId: 'node-open-exec',
        },
        {
          choiceKey: 'route_data_audit',
          label: 'Launch a rapid data audit first, then publish corrected claims.',
          nextNodeId: 'node-open-audit',
        },
        {
          choiceKey: 'route_cross_func_sync',
          label: 'Run cross-functional sync (Finance, Delivery, HR) and lock one truth set.',
          nextNodeId: 'node-open-sync',
        },
      ],
    },
    'node-open-exec': {
      nodeId: 'node-open-exec',
      type: 'open_input',
      nextNodeId: 'node-pressure-exec',
      sceneText:
        'Draft the executive brief in 3-5 sentences: correction plan, evidence boundary, and one risk you will state publicly.',
      openInputConfig: {
        targetCompetencies: [TI_EXEC, TI_DATA],
        evaluationPrompt:
          'Score on ti_exec_comms and ti_data_integrity. Look for a clear correction plan, evidence boundary, and explicit risk ownership. Return ONLY JSON: {"Score": number 0-1, "Demonstrated": boolean, "Feedback": string}',
      },
    },
    'node-open-audit': {
      nodeId: 'node-open-audit',
      type: 'open_input',
      nextNodeId: 'node-pressure-audit',
      sceneText:
        'Draft the audit-first stakeholder note in 3-5 sentences: what is frozen, what is still valid, and what decision timeline you commit to.',
      openInputConfig: {
        targetCompetencies: [TI_DATA, TI_STAKE],
        evaluationPrompt:
          'Score on ti_data_integrity and ti_stakeholder_mgmt. Look for decision timeline, evidence caution, and stakeholder clarity. Return ONLY JSON: {"Score": number 0-1, "Demonstrated": boolean, "Feedback": string}',
      },
    },
    'node-open-sync': {
      nodeId: 'node-open-sync',
      type: 'open_input',
      nextNodeId: 'node-pressure-sync',
      sceneText:
        'Write the sync agenda and close message in 3-5 sentences: who decides what, how conflict is resolved, and what reaches the board.',
      openInputConfig: {
        targetCompetencies: [TI_STAKE, TI_EXEC],
        evaluationPrompt:
          'Score on ti_stakeholder_mgmt and ti_exec_comms. Look for owner clarity, conflict resolution, and board-safe communication. Return ONLY JSON: {"Score": number 0-1, "Demonstrated": boolean, "Feedback": string}',
      },
    },
    'node-pressure-exec': {
      nodeId: 'node-pressure-exec',
      type: 'branching',
      sceneText: '{{beat}}\n\nChoose your final town-hall communication posture.',
      branchingOptions: [
        { choiceKey: 'close_exec_truth', label: 'Lead with correction truth and action timeline.', nextNodeId: 'terminal-1' },
        { choiceKey: 'close_exec_risk', label: 'Lead with risk control and mitigation ownership.', nextNodeId: 'terminal-1' },
        { choiceKey: 'close_exec_alignment', label: 'Lead with aligned executive commitment statement.', nextNodeId: 'terminal-1' },
      ],
    },
    'node-pressure-audit': {
      nodeId: 'node-pressure-audit',
      type: 'branching',
      sceneText: '{{beat}}\n\nChoose your final evidence-first communication posture.',
      branchingOptions: [
        { choiceKey: 'close_audit_boundary', label: 'Lead with evidence boundary and decision date.', nextNodeId: 'terminal-1' },
        { choiceKey: 'close_audit_owner', label: 'Lead with audit owner model and escalation path.', nextNodeId: 'terminal-1' },
        { choiceKey: 'close_audit_board', label: 'Lead with board-safe correction narrative.', nextNodeId: 'terminal-1' },
      ],
    },
    'node-pressure-sync': {
      nodeId: 'node-pressure-sync',
      type: 'branching',
      sceneText: '{{beat}}\n\nChoose your final alignment-first communication posture.',
      branchingOptions: [
        { choiceKey: 'close_sync_truth', label: 'Lead with conflict truth and alignment decision.', nextNodeId: 'terminal-1' },
        { choiceKey: 'close_sync_roles', label: 'Lead with role accountability matrix.', nextNodeId: 'terminal-1' },
        { choiceKey: 'close_sync_qna', label: 'Lead with Q&A discipline and boundary language.', nextNodeId: 'terminal-1' },
      ],
    },
  },
  'scenario-3': {
    'node-1': {
      nodeId: 'node-1',
      type: 'branching',
      sceneText: [
        '{{company}} is preparing an AI operating-model shift. Finance wants productivity proof, Legal wants policy guardrails, and HR wants capability confidence.',
        'You need to frame go/no-go criteria before a committee decision.',
        'What do you do first?',
      ].join('\n\n'),
      branchingOptions: [
        {
          choiceKey: 'route_metric_thresholds',
          label: 'Define go/no-go metric thresholds first and align owners.',
          nextNodeId: 'node-open-thresholds',
        },
        {
          choiceKey: 'route_risk_guardrails',
          label: 'Define risk and policy guardrails first, then discuss upside.',
          nextNodeId: 'node-open-guardrails',
        },
        {
          choiceKey: 'route_change_story',
          label: 'Draft one change story balancing outcome, risk, and capability gaps.',
          nextNodeId: 'node-open-story',
        },
      ],
    },
    'node-open-thresholds': {
      nodeId: 'node-open-thresholds',
      type: 'open_input',
      nextNodeId: 'node-pressure-thresholds',
      sceneText:
        'Write your threshold brief in 3-6 sentences: success metric, stop metric, and who owns each signal.',
      openInputConfig: {
        targetCompetencies: [TI_DATA, TI_STAKE],
        evaluationPrompt:
          'Score on ti_data_integrity and ti_stakeholder_mgmt. Look for measurable thresholds, stop conditions, and owner clarity. Return ONLY JSON: {"Score": number 0-1, "Demonstrated": boolean, "Feedback": string}',
      },
    },
    'node-open-guardrails': {
      nodeId: 'node-open-guardrails',
      type: 'open_input',
      nextNodeId: 'node-pressure-guardrails',
      sceneText:
        'Write your guardrails note in 3-6 sentences: what is allowed, what is blocked, and how exceptions are handled.',
      openInputConfig: {
        targetCompetencies: [TI_DATA, TI_EXEC],
        evaluationPrompt:
          'Score on ti_data_integrity and ti_exec_comms. Look for explicit boundaries, exception handling, and practical communication. Return ONLY JSON: {"Score": number 0-1, "Demonstrated": boolean, "Feedback": string}',
      },
    },
    'node-open-story': {
      nodeId: 'node-open-story',
      type: 'open_input',
      nextNodeId: 'node-pressure-story',
      sceneText:
        'Write your change story in 3-6 sentences: business value, risk boundary, and capability plan for frontline teams.',
      openInputConfig: {
        targetCompetencies: [TI_EXEC, TI_STAKE],
        evaluationPrompt:
          'Score on ti_exec_comms and ti_stakeholder_mgmt. Look for balanced story, explicit risk boundary, and capability ownership. Return ONLY JSON: {"Score": number 0-1, "Demonstrated": boolean, "Feedback": string}',
      },
    },
    'node-pressure-thresholds': {
      nodeId: 'node-pressure-thresholds',
      type: 'branching',
      sceneText: '{{beat}}\n\nChoose your final committee recommendation posture.',
      branchingOptions: [
        { choiceKey: 'close_thresholds_go', label: 'Proceed with conditional go and strict checkpoints.', nextNodeId: 'terminal-1' },
        { choiceKey: 'close_thresholds_pause', label: 'Pause until one critical threshold is met.', nextNodeId: 'terminal-1' },
        { choiceKey: 'close_thresholds_pilot', label: 'Pilot with narrow scope and measured escalation.', nextNodeId: 'terminal-1' },
      ],
    },
    'node-pressure-guardrails': {
      nodeId: 'node-pressure-guardrails',
      type: 'branching',
      sceneText: '{{beat}}\n\nChoose your final policy-first recommendation posture.',
      branchingOptions: [
        { choiceKey: 'close_guardrails_go', label: 'Proceed with mandatory policy controls.', nextNodeId: 'terminal-1' },
        { choiceKey: 'close_guardrails_pause', label: 'Pause until legal confidence is restored.', nextNodeId: 'terminal-1' },
        { choiceKey: 'close_guardrails_pilot', label: 'Pilot only in low-risk environments first.', nextNodeId: 'terminal-1' },
      ],
    },
    'node-pressure-story': {
      nodeId: 'node-pressure-story',
      type: 'branching',
      sceneText: '{{beat}}\n\nChoose your final narrative-first recommendation posture.',
      branchingOptions: [
        { choiceKey: 'close_story_truth', label: 'Lead with balanced truth and phased outcomes.', nextNodeId: 'terminal-1' },
        { choiceKey: 'close_story_owner', label: 'Lead with owner commitments and risk boundaries.', nextNodeId: 'terminal-1' },
        { choiceKey: 'close_story_reframe', label: 'Reframe as capability investment with clear limits.', nextNodeId: 'terminal-1' },
      ],
    },
  },
};

const SCENARIO_CARDS: Record<string, Omit<ScenarioCard, 'scenarioId'>> = {
  'scenario-1': {
    label: 'NDA Pressure Readout (CHRO) — Mission 1',
    enabled: true,
    featured: true,
    pushRank: 1,
  },
  'scenario-2': {
    label: 'Board Deck Integrity Crisis — Mission 2',
    enabled: true,
    featured: true,
    pushRank: 2,
  },
  'scenario-3': {
    label: 'AI Go/No-Go Committee Call — Mission 3',
    enabled: true,
    featured: false,
    pushRank: 3,
  },
};

export function listSupportedScenarios(): ScenarioCard[] {
  const ids = Object.keys(SCENARIO_NODES);
  return ids
    .map((scenarioId): ScenarioCard | null => {
      const card = SCENARIO_CARDS[scenarioId];
      if (!card) return null;
      return { scenarioId, ...card };
    })
    .filter((v): v is ScenarioCard => v !== null)
    .sort((a, b) => (a.pushRank ?? 0) - (b.pushRank ?? 0));
}

const VARIANT_TABLE = [
  { company: 'Northbridge Labs', metric: 14, label: 'Northbridge • contractor signal +14%' },
  { company: 'Helix Biometrics', metric: 18, label: 'Helix • contractor signal +18%' },
  { company: 'Cedar Systems', metric: 11, label: 'Cedar • contractor signal +11%' },
] as const;

const BEAT_TABLE = [
  'Unexpected: a draft slide with contractor ranges is screenshotted and shared in an internal channel you do not control.',
  'Unexpected: Finance publishes a revised file mid-day; the contractor share shifts enough to change the headline.',
  'Unexpected: the CHRO forwards a competitor article implying your firm masks contingent labor risk.',
  'Unexpected: an executive asks you to “just name three contractor firms” to reassure the board.',
  'Unexpected: Legal escalates—vendor counsel alleges your wording could breach a master NDA if any cohort is identifiable.',
] as const;

export interface SessionVariantContext {
  sessionSeed: number;
}

function pickVariant(seed: number): (typeof VARIANT_TABLE)[number] {
  const idx = Math.abs(seed) % VARIANT_TABLE.length;
  return VARIANT_TABLE[idx]!;
}

function pickBeat(seed: number): string {
  const idx = Math.abs(seed ^ (seed << 5)) % BEAT_TABLE.length;
  return BEAT_TABLE[idx]!;
}

function applyPlaceholders(text: string, seed: number): string {
  const v = pickVariant(seed);
  const beat = pickBeat(seed);
  return text.replace(/\{\{company\}\}/g, v.company).replace(/\{\{metric\}\}/g, String(v.metric)).replace(/\{\{beat\}\}/g, beat);
}

export function variantLabelForSeed(seed: number): string {
  return pickVariant(seed).label;
}

export function runMetadataForSeed(seed: number): { sessionSeed: number; variantLabel: string } {
  return { sessionSeed: seed, variantLabel: variantLabelForSeed(seed) };
}

export function isScenarioSupported(scenarioId: string): boolean {
  return Object.prototype.hasOwnProperty.call(SCENARIO_NODES, scenarioId);
}

/**
 * Returns a deep copy of the node with session-specific placeholders resolved.
 */
export function getScenarioNode(
  scenarioId: string,
  nodeId: string,
  variant?: SessionVariantContext,
): NodeContext | null {
  const pack = SCENARIO_NODES[scenarioId];
  if (!pack) {
    return null;
  }
  const node = pack[nodeId];
  if (!node) {
    return null;
  }
  const seed = variant?.sessionSeed ?? 0;
  const sceneText = applyPlaceholders(node.sceneText, seed);
  const branchingOptions = node.branchingOptions?.map((opt) => ({
    ...opt,
    label: applyPlaceholders(opt.label, seed),
  }));
  const cloned: NodeContext = { ...node, sceneText, branchingOptions };
  return NodeContextSchema.parse(cloned);
}

export function createTerminalNodeContext(): NodeContext {
  return NodeContextSchema.parse({
    nodeId: 'terminal-1',
    type: 'branching',
    sceneText: [
      'Mission complete.',
      'This run is on record: your route, open-input evaluations, and how you handled the late pressure.',
      'Start another session to see a different company variant or surprise beat.',
    ].join('\n\n'),
  });
}
