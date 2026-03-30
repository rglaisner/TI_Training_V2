import type { TICompetency, TICategory } from '@ti-training/shared';

/** Learner-facing labels — avoid raw `ti_*` keys in UI. */
export const COMPETENCY_DISPLAY_NAME: Record<TICompetency, string> = {
  ti_data_integrity: 'Data integrity',
  ti_stakeholder_mgmt: 'Stakeholder management',
  ti_exec_comms: 'Executive communication',
  ti_osint_humint: 'OSINT & HUMINT',
  ti_workforce_planning: 'Workforce planning',
  ti_risk_modeling: 'Risk modeling',
  ti_crisis_triage: 'Crisis triage',
  ti_cross_functional_leadership: 'Cross-functional leadership',
  ti_capability_assessment: 'Capability assessment',
  ti_data_governance_accountability: 'Data governance',
  ti_lateral_thinking: 'Lateral thinking',
  ti_signal_triangulation: 'Signal triangulation',
  ti_org_design: 'Organization design',
  ti_strategic_vision: 'Strategic vision',
  ti_opsec_awareness: 'Operational security',
};

export const CATEGORY_DISPLAY_NAME: Record<TICategory, string> = {
  FOUNDATIONS: 'Foundations',
  INFLUENCE: 'Influence',
  STRATEGY: 'Strategy',
  CRISIS: 'Crisis',
  ETHICS: 'Ethics',
  LEADING_AND_MANAGING: 'Leading & managing',
  CREATIVE_AND_CRITICAL_THINKING: 'Creative & critical thinking',
  THOUGHT_LEADERSHIP: 'Thought leadership',
};

export function competencyLabel(id: TICompetency): string {
  return COMPETENCY_DISPLAY_NAME[id] ?? id;
}

export function categoryLabel(id: TICategory): string {
  return CATEGORY_DISPLAY_NAME[id] ?? id;
}
