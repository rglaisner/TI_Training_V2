import {
  EvaluationJsonSchema,
  normalizeScoreTo100,
  type TICompetency,
} from '@ti-training/shared';

export interface OpenInputEvaluationRequest {
  inputText: string;
  /** Primary competency for scoring payload / UI (multi-competency rubrics still use this as the lead key). */
  targetCompetency: TICompetency;
  /** Full scene the learner saw (after placeholders). */
  sceneContext: string;
  /** Author rubric / evaluator instructions from the scenario node. */
  evaluationRubric: string;
}

export interface EvaluationResult {
  awardedScore: number;
  rawScore: number;
  rawScale: 'zero_to_one' | 'zero_to_one_hundred';
  demonstrated: boolean;
  feedbackText: string;
}

export interface EvaluationEngine {
  evaluateOpenInput(input: OpenInputEvaluationRequest): Promise<EvaluationResult>;
}

export class DeterministicEvaluationEngine implements EvaluationEngine {
  async evaluateOpenInput(input: OpenInputEvaluationRequest): Promise<EvaluationResult> {
    const scored = scoreOpenInputAgainstRubric(input);
    const payload = {
      Score: scored.score,
      Demonstrated: scored.score >= 0.6,
      Feedback: scored.feedback,
    };
    const validation = EvaluationJsonSchema.safeParse(payload);
    if (!validation.success) {
      throw new Error('EVAL_JSON_INVALID');
    }

    const normalized = normalizeScoreTo100(validation.data.Score);
    return {
      awardedScore: normalized.awardedScore,
      rawScore: validation.data.Score,
      rawScale: normalized.rawScale,
      demonstrated: validation.data.Demonstrated,
      feedbackText: validation.data.Feedback,
    };
  }
}

export interface MentorHintRequest {
  sceneText: string;
  userMessage?: string;
  challengeText?: string;
}

export interface MentorHintGenerator {
  generateHint(input: MentorHintRequest): Promise<string>;
}

export class TemplateMentorHintGenerator implements MentorHintGenerator {
  async generateHint(input: MentorHintRequest): Promise<string> {
    const context = buildMentorContext(input);
    const bullets = [
      `- Next move: ${context.nextMove}`,
      `- Evidence anchor: ${context.evidenceAnchor}`,
      `- Boundary to state: ${context.boundary}`,
    ];
    return bullets.join('\n').slice(0, 520);
  }
}

interface DeterministicScoreBreakdown {
  score: number;
  feedback: string;
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function hasAnyToken(text: string, tokens: readonly string[]): boolean {
  return tokens.some((token) => text.includes(token));
}

function extractRubricKeywords(rubric: string): string[] {
  const tokenSet = new Set<string>();
  const normalized = normalizeText(rubric);
  for (const part of normalized.split(/[^a-z0-9_]+/g)) {
    if (part.length >= 5) {
      tokenSet.add(part);
    }
  }
  return [...tokenSet].slice(0, 14);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function scoreOpenInputAgainstRubric(input: OpenInputEvaluationRequest): DeterministicScoreBreakdown {
  const normalizedInput = normalizeText(input.inputText);
  if (normalizedInput.length === 0) {
    return {
      score: 0.05,
      feedback:
        'No decision text was provided. State a concrete recommendation, one evidence point, and one explicit boundary.',
    };
  }

  const decisionClarity = hasAnyToken(normalizedInput, [
    'recommend',
    'decision',
    'i will',
    'we will',
    'first',
    'next',
  ])
    ? 1
    : 0.35;
  const evidencePresence = hasAnyToken(normalizedInput, [
    '%',
    'metric',
    'data',
    'evidence',
    'signal',
    'range',
  ])
    ? 1
    : 0.3;
  const boundaryRisk = hasAnyToken(normalizedInput, [
    'risk',
    'boundary',
    'not',
    'refuse',
    'cannot',
    'will not',
    'nda',
    'legal',
  ])
    ? 1
    : 0.3;
  const stakeholderAction = hasAnyToken(normalizedInput, [
    'chro',
    'legal',
    'finance',
    'stakeholder',
    'owner',
    'align',
    'follow-up',
    'board',
  ])
    ? 1
    : 0.3;

  const rubricKeywords = extractRubricKeywords(input.evaluationRubric);
  const rubricHits =
    rubricKeywords.length > 0
      ? rubricKeywords.filter((keyword) => normalizedInput.includes(keyword)).length /
        rubricKeywords.length
      : 0.6;
  const rubricAlignment = clamp01(rubricHits);

  const weightedScore =
    decisionClarity * 0.22 +
    evidencePresence * 0.22 +
    boundaryRisk * 0.2 +
    stakeholderAction * 0.2 +
    rubricAlignment * 0.16;
  const score = clamp01(weightedScore);

  const missing: string[] = [];
  if (decisionClarity < 0.7) missing.push('clear decision statement');
  if (evidencePresence < 0.7) missing.push('specific evidence/metric');
  if (boundaryRisk < 0.7) missing.push('explicit risk or boundary');
  if (stakeholderAction < 0.7) missing.push('stakeholder action path');
  if (rubricAlignment < 0.5) missing.push('alignment with rubric language');

  const feedback =
    missing.length === 0
      ? `Solid ${input.targetCompetency} signal: recommendation, evidence, and boundaries are all explicit.`
      : `Strengthen ${input.targetCompetency} by adding: ${missing.join(', ')}.`;

  return { score, feedback };
}

interface MentorContext {
  nextMove: string;
  evidenceAnchor: string;
  boundary: string;
}

function firstSentence(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) return '';
  const match = trimmed.match(/^[^.!?\n]+[.!?]?/);
  return (match?.[0] ?? trimmed).slice(0, 180);
}

function pickBoundaryText(scene: string, challenge: string): string {
  const combined = `${scene} ${challenge}`.toLowerCase();
  if (combined.includes('nda') || combined.includes('legal')) {
    return 'Name what cannot be claimed or shared under NDA/legal constraints.';
  }
  if (combined.includes('board') || combined.includes('executive') || combined.includes('chro')) {
    return 'State one claim you will not make without evidence in the room.';
  }
  return 'State one risk line you will not cross while presenting the plan.';
}

function buildMentorContext(input: MentorHintRequest): MentorContext {
  const scene = input.sceneText.trim();
  const challenge = input.challengeText?.trim() ?? '';
  const user = input.userMessage?.trim() ?? '';
  const sceneLead = firstSentence(scene);
  const challengeLead = firstSentence(challenge);
  const userLead = firstSentence(user);

  const nextMove =
    challengeLead.length > 0
      ? `Open with a decision that directly addresses: "${challengeLead}".`
      : sceneLead.length > 0
        ? `Open with a decision tied to the current situation: "${sceneLead}".`
        : 'Open with your concrete recommendation for the next 10 minutes.';

  const evidenceAnchor =
    userLead.length > 0
      ? `Use one verifiable metric and connect it to your draft: "${userLead}".`
      : 'Use one concrete metric or range that supports your recommendation.';

  const boundary = pickBoundaryText(scene, challenge);
  return { nextMove, evidenceAnchor, boundary };
}
