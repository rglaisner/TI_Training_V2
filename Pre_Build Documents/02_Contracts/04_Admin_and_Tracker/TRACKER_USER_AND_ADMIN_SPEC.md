# Tracker Spec (User + Admin)

This doc defines the “Tracker” product surface:
- what end users need to understand their progression
- what tenant admins need for audit + cohort analytics

Data sources must respect:
- backend-owned state (`profiles` as persistent truth)
- immutable evaluation evidence (`events` as audit lake)

## User Tracker (end-user experience)

### User objectives
- see how far they are in the current certification level (0–6)
- see which competencies improved (and which need work)
- see earned labels of excellence
- see evidence summary without requiring deep audit knowledge

### Recommended user tracker data slices

1) Certification overview
- current level band (0–6)
- current medal tier for latest completed scenario (Distinction/Merit/Pass)

2) Competency progress (serious track)
- per `TICompetency`:
  - current score (rolling average / weighted score)
  - evaluations count
  - lastDemonstrated and trend direction (up/down/flat)

3) Fun track (engagement)
- total XP
- cosmetics/perks currently active (as they can influence simulation prompts)

4) Evidence highlights
- last N evaluations with:
  - scenarioId/nodeId
  - demonstrated boolean
  - awarded score
  - short summary of feedback (avoid dumping full sensitive content in standard UI)

### User tracker API endpoints (suggested)
These are planning-level endpoints; implement in backend:
- `GET /api/missions/tracker/summary`
  - returns only the resolved `profiles`-derived slices (no event raw access)

## Admin Tracker (tenant-wide analytics)

### Admin objectives
- audit “why” decisions were made using event lake evidence
- monitor scenario quality and user progression trends
- detect systemic failure modes (frequent JSON invalid, high LLM error rates)

### Admin tracker data slices

1) Tenant overview
- evaluation volume by time window
- scenario completion rate by scenarioId
- failure rate breakdown:
  - `EVALUATION_JSON_INVALID`
  - `EVALUATION_LLM_ERROR`
  - `DECISION_REJECTED`

2) Cohort analytics
- certification distribution across levels 0–6
- “top competencies” by evaluation volume and pass rate
- optionally: heatmaps by competency category and scenarioId

3) Drill-down audit inspection
- filter events by:
  - scenarioId
  - nodeId
  - time range
  - anonymized profileHash

Admin view must:
- show the awardedScore and demonstrated status when evaluation succeeded
- show safe error reason when evaluation failed (from event type)

### Admin tracker API endpoints (suggested)
- `GET /api/admin/tracker/tenant-overview`
- `GET /api/admin/tracker/cohorts`
- `GET /api/admin/tracker/events?profileHash=&scenarioId=&nodeId=&from=&to=`

## Security rules for tracker data
- End users:
  - can only query their own profile slices
  - must not be able to query arbitrary profileHash values
- Admins:
  - can only query within their resolved tenantId
  - event inspection remains anonymized (profileHash only)

