import type { CompetencyDetail, ProfileMetrics, TICategory, TICompetency } from '@ti-training/shared';
import { tiCategoryValues, tiCompetencyValues } from '@ti-training/shared';

const defaultCompetency = (): CompetencyDetail => ({
  score: 50,
  evaluations: 0,
  lastDemonstrated: new Date(0).toISOString(),
  trend: 'flat',
});

export function createMockProfileMetrics(params: { totalXP: number; labels?: string[] }): ProfileMetrics {
  const categoryScores = Object.fromEntries(
    tiCategoryValues.map((c) => [c, 0]),
  ) as Record<TICategory, number>;
  const categoryXP = Object.fromEntries(tiCategoryValues.map((c) => [c, 0])) as Record<TICategory, number>;
  const competencies = Object.fromEntries(
    tiCompetencyValues.map((c) => [c, defaultCompetency()]),
  ) as Record<TICompetency, CompetencyDetail>;

  return {
    categoryScores,
    competencies,
    labelsOfExcellence: params.labels ?? [],
    totalXP: params.totalXP,
    categoryXP,
    activeCosmetics: [],
  };
}
