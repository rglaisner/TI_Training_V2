import type {
  CompetencyDetail,
  ProfileMetrics,
  ProfileTrend,
  TICategory,
  TICompetency,
} from '@ti-training/shared';
import { tiCategoryValues, tiCompetencyValues } from '@ti-training/shared';

export const DEFAULT_SCENARIO_ID = 'scenario-1';

export function createDefaultCompetencyDetail(): CompetencyDetail {
  return {
    score: 0,
    evaluations: 0,
    lastDemonstrated: new Date(0).toISOString(),
    trend: 'flat',
  };
}

export function createDefaultProfileMetrics(): ProfileMetrics {
  const categoryScores = Object.fromEntries(
    tiCategoryValues.map((category) => [category, 0]),
  ) as Record<TICategory, number>;

  const competencies = Object.fromEntries(
    tiCompetencyValues.map((competency) => [
      competency,
      createDefaultCompetencyDetail(),
    ]),
  ) as Record<TICompetency, CompetencyDetail>;

  const categoryXP = Object.fromEntries(
    tiCategoryValues.map((category) => [category, 0]),
  ) as Record<TICategory, number>;

  return {
    categoryScores,
    competencies,
    labelsOfExcellence: [],
    totalXP: 0,
    categoryXP,
    activeCosmetics: [],
  };
}

/**
 * Blends each target competency's rolling score with this turn's awarded score (0–100).
 * Does not mutate `profile`.
 */
export function mergeProfileAfterOpenInputEvaluation(params: {
  profile: ProfileMetrics;
  targetCompetencies: TICompetency[];
  awardedScore: number;
  demonstrated: boolean;
  evaluatedAtIso: string;
}): ProfileMetrics {
  const competencies = { ...params.profile.competencies };
  const uniqueTargets = [...new Set(params.targetCompetencies)];
  for (const key of uniqueTargets) {
    const prev = competencies[key];
    const nextEvaluations = prev.evaluations + 1;
    const blended = Math.round(
      (prev.score * prev.evaluations + params.awardedScore) / nextEvaluations,
    );
    const score = Math.min(100, Math.max(0, blended));
    let trend: ProfileTrend = 'flat';
    if (score > prev.score) {
      trend = 'up';
    } else if (score < prev.score) {
      trend = 'down';
    }
    competencies[key] = {
      score,
      evaluations: nextEvaluations,
      lastDemonstrated: params.demonstrated
        ? params.evaluatedAtIso
        : prev.lastDemonstrated,
      trend,
    };
  }
  return { ...params.profile, competencies };
}
