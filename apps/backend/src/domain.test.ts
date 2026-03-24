import { describe, expect, it } from 'vitest';
import {
  createDefaultProfileMetrics,
  mergeProfileAfterOpenInputEvaluation,
} from './domain';

describe('mergeProfileAfterOpenInputEvaluation', () => {
  it('blends awarded score into each target competency', () => {
    const base = createDefaultProfileMetrics();
    const out = mergeProfileAfterOpenInputEvaluation({
      profile: base,
      targetCompetencies: ['ti_data_integrity', 'ti_exec_comms'],
      awardedScore: 80,
      demonstrated: true,
      evaluatedAtIso: '2025-01-01T00:00:00.000Z',
    });
    expect(out.competencies.ti_data_integrity.score).toBe(80);
    expect(out.competencies.ti_data_integrity.evaluations).toBe(1);
    expect(out.competencies.ti_data_integrity.lastDemonstrated).toBe('2025-01-01T00:00:00.000Z');
    expect(out.competencies.ti_exec_comms.score).toBe(80);
    expect(out.totalXP).toBe(base.totalXP);
  });

  it('dedupes repeated competency keys', () => {
    const base = createDefaultProfileMetrics();
    const out = mergeProfileAfterOpenInputEvaluation({
      profile: base,
      targetCompetencies: ['ti_data_integrity', 'ti_data_integrity'],
      awardedScore: 50,
      demonstrated: false,
      evaluatedAtIso: '2025-01-02T00:00:00.000Z',
    });
    expect(out.competencies.ti_data_integrity.evaluations).toBe(1);
  });
});
