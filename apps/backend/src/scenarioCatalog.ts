import { NodeContextSchema, type NodeContext, type TICompetency } from '@ti-training/shared';

const TI_DATA: TICompetency = 'ti_data_integrity';

/**
 * Authoritative narrative + structure per scenario. Add scenarios here (same project ships content until CMS exists).
 */
const SCENARIO_NODES: Record<string, Record<string, NodeContext>> = {
  'scenario-1': {
    'node-1': {
      nodeId: 'node-1',
      type: 'branching',
      sceneText: [
        'Northbridge Labs is freezing external hiring for Q3 while still promising “AI-ready workforce” optics to the board.',
        'You own the Talent Intelligence packet for tomorrow’s CHRO readout. Finance says headcount is flat; your skills graph shows a 14% rise in critical AI-adjacent roles that are mostly contractor-led.',
        'Legal warns that sharing contractor names could breach vendor NDAs. The CEO’s chief of staff pings you: “We need a single slide the CHRO can defend in five minutes.”',
        'What do you do first?',
      ].join('\n\n'),
      branchingOptions: [
        {
          choiceKey: 'option_a',
          label: 'Ship a CHRO slide tonight: contractor signal as indexed ranges only (no names), with one explicit data-risk footnote.',
        },
        {
          choiceKey: 'option_b',
          label: 'Pause the readout until Legal signs off on every metric definition you plan to show.',
        },
      ],
    },
    'node-2': {
      nodeId: 'node-2',
      type: 'open_input',
      sceneText: [
        'The CHRO replies in-thread: “If I walk into the board room with ranges-only, they’ll ask who is leaving and who is exposed. Give me the exact sentence you want me to say—and the one line I must not say.”',
        'Write the CHRO’s spoken line (one or two sentences), then the forbidden line, in plain executive language.',
      ].join('\n\n'),
      openInputConfig: {
        targetCompetencies: [TI_DATA],
        evaluationPrompt: 'Evaluate response using strict JSON contract.',
      },
    },
  },
};

export function isScenarioSupported(scenarioId: string): boolean {
  return Object.prototype.hasOwnProperty.call(SCENARIO_NODES, scenarioId);
}

export function getScenarioNode(scenarioId: string, nodeId: string): NodeContext | null {
  const pack = SCENARIO_NODES[scenarioId];
  if (!pack) {
    return null;
  }
  const node = pack[nodeId];
  return node ? { ...node } : null;
}

export function createTerminalNodeContext(): NodeContext {
  return NodeContextSchema.parse({
    nodeId: 'terminal-1',
    type: 'branching',
    sceneText: [
      'Mission complete.',
      'Your dossier is sealed for this run: decisions, evidence, and evaluation signals are on record for certification review.',
      'When you are ready, start another scenario to stress-test a different stakeholder pattern.',
    ].join('\n\n'),
  });
}
