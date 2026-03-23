import { describe, expect, it } from 'vitest';
import {
  DecisionRequestSchema,
  EvaluationJsonSchema,
  MissionEventSchema,
  NodeContextSchema,
  normalizeScoreTo100,
} from './contracts';

describe('NodeContextSchema', () => {
  it('accepts terminal branching summary without choice labels', () => {
    const parsed = NodeContextSchema.safeParse({
      nodeId: 'terminal-1',
      type: 'branching',
      sceneText: 'Done.',
    });
    expect(parsed.success).toBe(true);
  });

  it('requires branchingOptions for non-terminal branching nodes', () => {
    const parsed = NodeContextSchema.safeParse({
      nodeId: 'node-1',
      type: 'branching',
      sceneText: 'Choose',
    });
    expect(parsed.success).toBe(false);
  });

  it('requires openInputConfig for open_input nodes', () => {
    const parsed = NodeContextSchema.safeParse({
      nodeId: 'node-2',
      type: 'open_input',
      sceneText: 'Type',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('DecisionRequestSchema', () => {
  it('accepts branching choice payload', () => {
    const parsed = DecisionRequestSchema.safeParse({
      sessionId: 's1',
      nodeId: 'n1',
      clientSubmissionId: 'c1',
      branchingChoice: { choiceKey: 'option_a' },
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts open input payload', () => {
    const parsed = DecisionRequestSchema.safeParse({
      sessionId: 's1',
      nodeId: 'n1',
      clientSubmissionId: 'c1',
      openInput: { inputText: 'My response' },
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects payload with both branching and open input', () => {
    const parsed = DecisionRequestSchema.safeParse({
      sessionId: 's1',
      nodeId: 'n1',
      clientSubmissionId: 'c1',
      branchingChoice: { choiceKey: 'option_a' },
      openInput: { inputText: 'My response' },
    });
    expect(parsed.success).toBe(false);
  });
});

describe('EvaluationJsonSchema', () => {
  it('rejects unknown keys in strict contract', () => {
    const parsed = EvaluationJsonSchema.safeParse({
      Score: 0.82,
      Demonstrated: true,
      Feedback: 'Good work',
      Extra: 'not allowed',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('normalizeScoreTo100', () => {
  it('normalizes from 0..1 scale', () => {
    const result = normalizeScoreTo100(0.73);
    expect(result.awardedScore).toBe(73);
    expect(result.rawScale).toBe('zero_to_one');
  });

  it('keeps 0..100 scale', () => {
    const result = normalizeScoreTo100(73);
    expect(result.awardedScore).toBe(73);
    expect(result.rawScale).toBe('zero_to_one_hundred');
  });

  it('throws for out-of-range score', () => {
    expect(() => normalizeScoreTo100(121)).toThrowError();
  });
});

describe('MissionEventSchema', () => {
  it('validates EVALUATION_COMPLETED event shape', () => {
    const parsed = MissionEventSchema.safeParse({
      eventId: 'evt-1',
      eventType: 'EVALUATION_COMPLETED',
      tenantId: 'tenant-a',
      timestamp: new Date().toISOString(),
      profileHash: 'profile-hash',
      sessionId: 's1',
      nodeId: 'n1',
      turnId: 1,
      correlationId: 'corr-1',
      scenarioId: 'scenario-1',
      awardedScore: 78,
      rawScore: 0.78,
      rawScale: 'zero_to_one',
      demonstrated: true,
      feedbackText: 'Good reasoning',
      promptVersion: 'v1',
      scoringVersion: 'v1',
      retryAttempted: false,
    });
    expect(parsed.success).toBe(true);
  });
});
