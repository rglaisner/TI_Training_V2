import {
  EvaluationJsonSchema,
  normalizeScoreTo100,
  type TICompetency,
} from '@ti-training/shared';

export interface EvaluationResult {
  awardedScore: number;
  rawScore: number;
  rawScale: 'zero_to_one' | 'zero_to_one_hundred';
  demonstrated: boolean;
  feedbackText: string;
}

export interface EvaluationEngine {
  evaluateOpenInput(input: {
    inputText: string;
    targetCompetency: TICompetency;
  }): Promise<EvaluationResult>;
}

export class DeterministicEvaluationEngine implements EvaluationEngine {
  async evaluateOpenInput(input: {
    inputText: string;
    targetCompetency: TICompetency;
  }): Promise<EvaluationResult> {
    const score = Math.min(1, Math.max(0.1, input.inputText.trim().length / 200));
    const payload = {
      Score: score,
      Demonstrated: score >= 0.6,
      Feedback: `Evaluation against ${input.targetCompetency} complete.`,
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
