import { describe, expect, it } from 'vitest';
import {
  DeterministicEvaluationEngine,
  TemplateMentorHintGenerator,
} from './evaluator';

describe('DeterministicEvaluationEngine', () => {
  const engine = new DeterministicEvaluationEngine();

  it('returns very low score for empty input with actionable feedback', async () => {
    const result = await engine.evaluateOpenInput({
      inputText: '   ',
      targetCompetency: 'ti_data_integrity',
      sceneContext: 'CHRO readout scenario',
      evaluationRubric: 'State recommendation, evidence, and boundary.',
    });
    expect(result.awardedScore).toBeLessThanOrEqual(20);
    expect(result.demonstrated).toBe(false);
    expect(result.feedbackText.toLowerCase()).toContain('decision');
  });

  it('scores stronger responses higher than vague responses', async () => {
    const weak = await engine.evaluateOpenInput({
      inputText: 'I think we should proceed carefully.',
      targetCompetency: 'ti_stakeholder_mgmt',
      sceneContext: 'Cross-functional decision.',
      evaluationRubric: 'Include metric, stakeholder actions, and explicit risk boundary.',
    });
    const strong = await engine.evaluateOpenInput({
      inputText:
        'Recommendation: we publish the range summary now. Evidence: contractor signal rose 14%. I will align Legal and Finance today and will not disclose identifiers or NDA-sensitive details.',
      targetCompetency: 'ti_stakeholder_mgmt',
      sceneContext: 'Cross-functional decision.',
      evaluationRubric: 'Include metric, stakeholder actions, and explicit risk boundary.',
    });
    expect(strong.awardedScore).toBeGreaterThan(weak.awardedScore);
  });
});

describe('TemplateMentorHintGenerator', () => {
  const mentor = new TemplateMentorHintGenerator();

  it('returns concise bullet guidance with next move, evidence, and boundary', async () => {
    const hint = await mentor.generateHint({
      sceneText: 'Board review tomorrow with CHRO and Legal.',
      challengeText: 'Need one defendable recommendation now.',
      userMessage: 'I am unsure how hard to push on ranges.',
    });
    const lines = hint.split('\n');
    expect(lines.length).toBe(3);
    expect(lines[0]?.startsWith('- Next move:')).toBe(true);
    expect(lines[1]?.startsWith('- Evidence anchor:')).toBe(true);
    expect(lines[2]?.startsWith('- Boundary to state:')).toBe(true);
  });

  it('anchors boundary guidance to NDA/legal context when present', async () => {
    const hint = await mentor.generateHint({
      sceneText: 'Legal raised NDA concerns about contractor identity.',
      challengeText: '',
    });
    expect(hint.toLowerCase()).toContain('nda');
    expect(hint.toLowerCase()).toContain('boundary');
  });
});

