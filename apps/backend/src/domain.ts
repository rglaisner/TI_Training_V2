import type {
  CompetencyDetail,
  ProfileMetrics,
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
