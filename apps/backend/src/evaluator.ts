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
    const score = Math.min(1, Math.max(0.1, input.inputText.trim().length / 220));
    const payload = {
      Score: score,
      Demonstrated: score >= 0.55,
      Feedback: `Heuristic evaluation on ${input.targetCompetency} (no LLM key configured). Add more specific reasoning in-scene to improve signal.`,
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
    const user = input.userMessage?.trim();
    if (user) {
      return [
        'Think about one decision, one metric, and one stakeholder risk before you answer.',
        `You said: “${user.slice(0, 200)}${user.length > 200 ? '…' : ''}”`,
        'Now: what would you do in the next 10 minutes, and what would you refuse to claim?',
      ].join(' ');
    }
    if (input.challengeText?.trim()) {
      return `Lead with your decision, then tie one line to: ${input.challengeText.trim().slice(0, 120)}`;
    }
    return 'Lead with your recommended decision, then defend it with one metric and one explicit risk or boundary.';
  }
}
