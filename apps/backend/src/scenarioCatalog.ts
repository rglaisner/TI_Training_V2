import { NodeContextSchema, type NodeContext, type TICompetency } from '@ti-training/shared';

const TI_DATA: TICompetency = 'ti_data_integrity';
const TI_STAKE: TICompetency = 'ti_stakeholder_mgmt';
const TI_EXEC: TICompetency = 'ti_exec_comms';

/**
 * Raw templates use {{company}}, {{metric}}, {{beat}} where noted.
 * Branching uses ≥3 options; each route leads to a distinct open-input beat before a shared pressure finale.
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
      nextNodeId: 'node-pressure',
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
      nextNodeId: 'node-pressure',
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
      nextNodeId: 'node-pressure',
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
    'node-pressure': {
      nodeId: 'node-pressure',
      type: 'open_input',
      nextNodeId: 'terminal-1',
      sceneText: [
        '{{beat}}',
        'You still owe the CHRO a crisp closing move before the readout.',
        'In 3–6 sentences: name the decision you recommend, the evidence you will show, the explicit “we will not say,” and how you will handle follow-up questions live.',
      ].join('\n\n'),
      openInputConfig: {
        targetCompetencies: [TI_DATA, TI_EXEC, TI_STAKE],
        evaluationPrompt: [
          'Score holistically on ti_data_integrity, ti_exec_comms, and ti_stakeholder_mgmt.',
          'Look for: decision clarity, evidence discipline, explicit boundaries, and live-Q&A poise referencing the surprise event without inventing fake data.',
          'Return ONLY JSON: {"Score": number 0-1, "Demonstrated": boolean, "Feedback": string}',
        ].join(' '),
      },
    },
  },
};

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
