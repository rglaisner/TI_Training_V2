# Prompt Strategy Assessment (LLM vs Non-LLM)

This document implements the attached plan by creating:
- a prompt/LLM-call inventory based on the runtime prompt architecture docs,
- a per-prompt recommendation (Keep / Replace / Hybrid) focused on hallucination risk, structure, speed, and precision,
- a hybrid target architecture that pushes correctness into deterministic code where possible, and
- a phased rollout plan with acceptance metrics.

## Source docs used
- [`LLM_ORCHESTRATOR_PROMPT_ARCHITECTURE.md`](LLM_ORCHESTRATOR_PROMPT_ARCHITECTURE.md)
- [`AGENT_RUNTIME_SPEC.md`](../../02_Contracts/03_Runtime_and_Voice/AGENT_RUNTIME_SPEC.md)
- [`INTERLOCUTOR_DEFINITION_AND_PROTOCOLS.md`](../../02_Contracts/03_Runtime_and_Voice/INTERLOCUTOR_DEFINITION_AND_PROTOCOLS.md)
- [`DYNAMIC_DIFFICULTY_ADJUSTMENT.md`](../02_Product_and_Scenarios/DYNAMIC_DIFFICULTY_ADJUSTMENT.md)
- [`FULL_FINAL_BLUEPRINT.md`](FULL_FINAL_BLUEPRINT.md)
- [`SCENARIOS.md`](../02_Product_and_Scenarios/SCENARIOS.md)
- [`EVALUATION_CONTRACT_VALIDATION_STRATEGY.md`](../../02_Contracts/05_Testing_and_Observability/EVALUATION_CONTRACT_VALIDATION_STRATEGY.md)
- [`API_CONTRACTS_PLATFORMCLIENT.md`](../../02_Contracts/01_API_and_State/API_CONTRACTS_PLATFORMCLIENT.md)
- [`VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md`](../../02_Contracts/03_Runtime_and_Voice/VOICE_TO_EVALUATION_BRIDGE_CONTRACT.md)
- [`OBSERVABILITY_AND_GUARDRAILS.md`](../../02_Contracts/05_Testing_and_Observability/OBSERVABILITY_AND_GUARDRAILS.md)

## Scope note (how to interpret “each time sending a prompt”)
The docs define prompt *assembly* steps (system prompt, context injection, JSON schema) but those are composed into a single LLM call per “evaluation” or “social” action. This inventory therefore records per LLM call type, including the prompt components that are assembled for that call.

---

## 1) Prompt inventory (LLM-call inventory)

### Record A: Open-input competency evaluation (Gemini scoring call)

**Trigger**
- `POST /api/missions/decision` when `openInput` is present (and for voice-confirmed turns via the bridge).

**Where prompt is defined**
- System prompt: persona + guardrails (and cosmetic injection).
- Context injection: scenario narrative + market reality + target competencies + difficulty modifier.
- Scenario-specific evaluation instruction: `openInputConfig.evaluationPrompt`.
- Output contract enforcement: strict JSON `responseSchema`.
- Specialty detection instruction: “passive listening” to append hidden specialty tags.

**Inputs assembled into the prompt**
- `npcPersona` + optional cosmetics (virtual hat poke-fun) from profile state / assembly rules.
- Scenario data:
  - `scenarioData.narrative`
  - `scenarioData.marketData`
  - `scenarioData.targetCompetencies`
  - `openInputConfig.evaluationPrompt` (scenario rubric text)
- Profile metrics used for DDA:
  - example: `ti_stakeholder_mgmt > 0.8` selects a harder, more skeptical stance.

**Expected output shape**
- Strict JSON object:
  - `Score` (number; Gemini may emit `0..1` → backend normalizes to canonical `0..100`)
  - `Demonstrated` (boolean)
  - `Feedback` (string, in-character coaching/critique)

**Downstream consumer(s)**
- Backend validates JSON contract strictly (Zod/schema validator recommended).
- Backend normalizes score scale and applies deterministic profile metric updates.
- Backend writes immutable audit events (`/events`) for success/failure paths.
- Frontend renders:
  - NPC message feedback and (optionally) evaluation details.

**Current determinism controls (already in the docs)**
- “JSON-only” guardrail in system prompt.
- Strict schema validation with no permissive parsing.
- Bounded “repair and re-output” attempt on invalid JSON.
- Score scale normalization to canonical `0..100`.

**Hallucination-sensitive aspects**
- The model must infer whether the user satisfied competency rubrics expressed in natural language (`evaluationPrompt` + scenario context).
- The model may produce “plausible but ungrounded” judgments unless constrained to evidence extraction.

**Confidence**
- High on what is prompted; Medium on how deterministic the judgments are in practice (because rubric content is still natural-language).

---

### Record B: Mentor hint generation (Gemini social call)

**Trigger**
- `POST /api/missions/mentor` from UI, or scheduled mentor moments via node configuration.

**Where prompt is defined**
- `AGENT_RUNTIME_SPEC.md` defines mentor behavior requirements.
- `FULL_FINAL_BLUEPRINT.md` defines `SOFT_GUARDRAIL_PROMPT` intent.
- `INTERLOCUTOR_DEFINITION_AND_PROTOCOLS.md` defines “soft guardrails” behavior for off-brief / low-signal inputs.

**Inputs assembled into the prompt**
- Current mission/node narrative context.
- DDA tier modifiers (style: more supportive vs more resistant/skeptical).
- User’s latest attempt (text or transcript summary if voice is enabled).
- Optional hint metadata (`challengeText`).

**Expected output shape**
- UI-renderable `SocialAgentMessage[]` (or a single mentor hint payload):
  - `text`: short in-character Socratic hint and optional clarification questions
  - optional `hint` metadata for UI

**Downstream consumer(s)**
- Frontend displays queued mentor messages.
- Mentor output may be included in the next evaluation prompt context (per docs), but it must not directly mutate `/profiles`.

**Current determinism controls (already in docs)**
- “Soft guardrails” requirement: stay in character; if user is off-brief, terminate hint segment.
- Backend owns mission progression invariants; LLM output does not mutate state.

**Hallucination-sensitive aspects**
- Mentor text may introduce new facts or overconfident interpretations not grounded in scenario data.
- Off-brief termination decision is currently described as prompt-driven (“must abruptly excuse yourself”), which can be error-prone without a deterministic precheck.

**Confidence**
- Medium (behavior contract is clear; exact prompt text for mentor call is not fully specified in the docs).

---

### Record C: The Crowd dialogue plan generation (Gemini social call)

**Trigger**
- Node configuration requests a Crowd sequence, typically preceding open-input evaluation submission, or during “meeting” behavior.

**Where prompt is defined**
- `AGENT_RUNTIME_SPEC.md` and `INTERLOCUTOR_DEFINITION_AND_PROTOCOLS.md` describe “single LLM call” producing sequential dialogue plan.
- DDA influences hostility/skepticism via prompt modifiers.

**Inputs assembled into the prompt**
- Mission/node narrative context.
- DDA tier (friendly vs skeptical/hostile; may upgrade to OPSEC pressure).
- User’s latest attempt (optional, per “recent social context” continuity rules).

**Expected output shape**
- Ordered dialogue sequence (represented as one LLM output that becomes `SocialAgentMessage[]` in UI order).

**Downstream consumer(s)**
- Frontend renders sequential “pressure” dialogue.
- Crowd dialogue influences the next evaluation prompt context (backend includes it in prompt assembly).

**Current determinism controls**
- Backend keeps state machine deterministic; social output is presentation/continuity.
- DDA selection is deterministic; LLM is responsible only for natural language pressure generation.

**Hallucination-sensitive aspects**
- Crowd may “hallucinate” adversarial premises that weren’t in the scenario context.
- Because the crowd dialogue feeds evaluation prompt context, hallucinated “pressure claims” can indirectly steer evaluation (second-order effect).

**Confidence**
- Medium (the docs define the system-level flow; the exact schema for crowd output is not explicitly specified).

---

### Record D: Office Roaming / ambient intel generation (Gemini social call)

**Trigger**
- Time-based or interaction-based node triggers (e.g., idle for 20 seconds, after first submission, after toggling mentor off).

**Where prompt is defined**
- `AGENT_RUNTIME_SPEC.md` and `INTERLOCUTOR_DEFINITION_AND_PROTOCOLS.md` define roaming behavior:
  - check on-topic vs off-brief
  - provide informal intel if on-topic, otherwise excuse themselves
- “Soft guardrails” intent via `SOFT_GUARDRAIL_PROMPT`.

**Inputs assembled into the prompt**
- Mission/node narrative context.
- User’s latest attempt (or recent transcript summary if voice mode).
- Recent social context continuity (optional: last 1–3 NPC messages).

**Expected output shape**
- `SocialAgentMessage[]` containing in-character informal intel, or an “excuse/terminate” message if off-brief.

**Downstream consumer(s)**
- Frontend displays roaming intel.
- Roaming intel becomes part of the next evaluation prompt context (backend includes it).

**Hallucination-sensitive aspects**
- Same “second-order effect”: roaming invented facts can bias subsequent evaluation prompts.
- On/off-brief termination is described as prompt-driven; deterministic gating could reduce errors.

**Confidence**
- Medium.

---

### Record E: Prompt repair on invalid JSON (Gemini repair call)

**Trigger**
- Evaluation contract validation fails for open-input evaluation (`EVALUATION_JSON_INVALID` path).

**Where prompt is defined**
- `EVALUATION_CONTRACT_VALIDATION_STRATEGY.md` specifies a bounded repair attempt:
  - “send a ‘repair’ prompt to re-output valid JSON”
  - retry at most once

**Inputs assembled into the prompt**
- Original user input (sanitized as needed).
- Original model output (if allowed by the safety policy; docs emphasize not storing raw PII and recording safe diagnostic evidence).
- The required JSON schema (same required keys and types).

**Expected output shape**
- Strict JSON object:
  - `Score` (finite number)
  - `Demonstrated` (boolean)
  - `Feedback` (non-empty string)

**Downstream consumer(s)**
- Same strict schema validation gate as initial evaluation.
- If repair fails, proceed with failure event and abort decision path.

**Hallucination-sensitive aspects**
- Repair attempts can “fill in” missing fields or coerce semantics to satisfy format, which may reduce correctness even if parsing succeeds.
- Mitigations: strict validation, semantic invariants, bounded retries.

**Confidence**
- Medium (repair prompt content is not explicitly written, but the operational behavior is specified).

---

### Voice mode note
- Voice turns do not define new independent LLM prompt types: the voice-to-evaluation bridge maps confirmed `transcriptText` into the same `openInput` evaluation pathway (`DecisionRequest.openInput.inputText`).

---

## 2) Classification of each prompt (task type)

| Record | Prompt type | Task type classification |
|---|---|---|
| A | System+context+schema prompt | Generation + Scoring + Formatting + Hidden classification (specialties) |
| B | Mentor social prompt | Generation + Soft gating (on/off-brief segment) |
| C | Crowd social prompt | Generation + Soft gating (tone/pressure) |
| D | Roaming social prompt | Generation + Soft gating (on/off-brief termination) |
| E | Repair prompt | Formatting recovery (schema-constrained re-generation) |

---

## 3) Keep / Replace / Hybrid decisions per prompt record

### Record A (Open-input competency evaluation): **Hybrid (recommended)**

**Decision**
- Keep an LLM, but restrict it to “evidence extraction + rubric checks,” then move numeric scoring and demonstrated-threshold logic into deterministic code.

**Why not pure deterministic (Replace)**
- The rubric (`openInputConfig.evaluationPrompt`) is natural language and scenario-specific.
- The platform needs nuanced language judgment (“BLUF style,” “executive tone,” “defensiveness vs objectivity,” methodology nuance, OPSEC-aware leak detection).

**How this reduces hallucinations**
- Have the LLM output structured evidence signals (e.g., checklist hits, brief quotes, detected intent) under strict JSON schema.
- Use deterministic code to compute `Score`/`Demonstrated` from those signals and scenario rubrics expressed as machine-readable rules.

**Non-LLM opportunities inside Record A**
- Deterministic rubric implementation becomes feasible if rubrics are re-authored into structured rules (checklists, regex/semantic match targets, required elements).

**Confidence**
- High on the hybrid direction; Medium on feasibility without rubric re-authoring.

---

### Record B (Mentor hint generation): **Keep LLM, add deterministic pre-gating**

**Decision**
- Keep LLM for in-character guidance quality.
- Replace prompt-driven “on/off-brief termination” with deterministic prechecks where possible:
  - conciseness threshold
  - off-brief detection relative to node brief (embedding similarity or classifier)

**Why not replace the entire mentor call**
- The mentor’s main value is natural language Socratic style and persona continuity.

**How this reduces hallucinations**
- Deterministic gating decides “should we call Mentor at all” and “should we terminate early,” so the LLM isn’t forced to infer off-briefness from vague text.
- For the remaining call, constrain the LLM to:
  - “do not introduce new facts”
  - “only refer to scenario-provided context”

**Confidence**
- High for gating; Medium for the exact classifier design (no labeling spec exists in current docs).

---

### Record C (Crowd dialogue plan generation): **Keep LLM, isolate second-order influence**

**Decision**
- Keep LLM for sequential adversarial dialogue generation.
- Hybridize the *impact* on evaluation prompt context:
  - Deterministically filter/normalize crowd outputs before injecting into the next evaluation prompt context.
  - Prefer injecting structured “pressure intents” rather than free-form invented claims.

**Non-LLM opportunities**
- If crowd “beats” can be represented as controlled templates (e.g., `challenge_assumption`, `request_evidence`, `bait OPSEC mistake`), deterministic selection can reduce variability.

**Confidence**
- Medium (docs state crowd influences evaluation prompt context, but do not define injection format).

---

### Record D (Roaming intel): **Hybrid (deterministic intel templates + LLM paraphrase)**

**Decision**
- Replace the core “on-topic vs off-brief” decision with deterministic gating.
- Keep LLM mainly for paraphrasing/voice, but make the content originate from:
  - scenario-provided intel templates, or
  - deterministic retrieval of allowed hints.

**Why not pure replace**
- Ambient intel style is intentionally informal and contextually phrased.

**Confidence**
- Medium-high (gating is well-motivated; deterministic templates require more spec work).

---

### Record E (Prompt repair on invalid JSON): **Keep LLM (bounded), strengthen deterministic validation**

**Decision**
- Keep LLM repair call (format recovery).
- Ensure semantic invariants and strict validation remain the source of truth.

**Non-LLM opportunities**
- Improve “initial” parsing success with deterministic prompt formatting strategies:
  - JSON mode / function calling if the provider supports it.
- Reduce need for repair by enforcing provider-level structured output rather than “prompt-only” JSON-only instruction.

**Confidence**
- High that strict validation + bounded retries are necessary.

---

## 4) Target hybrid architecture (minimize hallucination-sensitive responsibilities)

### Proposed pipeline (high-level)

1. **Deterministic prechecks (before any LLM call)**
   - Node-type routing (`branching` vs `open_input`) is already deterministic.
   - For any “soft guardrails” scenario (Mentor/Roaming/Crowd), run deterministic checks:
     - conciseness threshold
     - off-brief detection relative to scenario brief
     - forbidden-content detection (if OPSEC/ethics constraints exist)
   - If prechecks decide “terminate early,” do not call the social LLM (or force a minimal deterministic terminate message).

2. **LLM evidence extraction (Record A)**
   - Ask the LLM for a structured evidence object under strict schema.
   - Remove (or greatly reduce) any instruction that requests final numeric score in free-form text.
   - Keep `Feedback` generation (in-character coaching) if desired, but make scoring purely deterministic from evidence.

3. **Deterministic scoring**
   - Deterministically compute:
     - `Score` (canonical `0..100`)
     - `Demonstrated`
     - label unlock conditions / DDA influence
   - Scenario rubrics must be expressed as machine-readable rules or validated checklists.

4. **Schema gate + normalization**
   - Strict schema validation (no permissive parsing).
   - Normalize scales, record raw scale and normalized score.

5. **Bounded repair (only for contract failures)**
   - At most one repair attempt for invalid JSON.
   - If repair fails, emit `EVALUATION_JSON_INVALID` event and do not update `/profiles`.

### Rationale vs current design
- Current design already minimizes formatting risk via schema + strict validation.
- The remaining hallucination risk is primarily *semantic correctness* (rubric interpretation and the second-order effects of social NPC outputs).
- The proposed architecture keeps the LLM where open-ended language judgment is valuable, but moves correctness into deterministic computation where precision matters most.

---

## 5) Phased rollout + acceptance metrics

### Migration order (low-risk first)

1. **Strengthen deterministic gating for soft guardrails**
   - Replace prompt-driven off-brief termination for Mentor/Roaming with deterministic prechecks.
   - Keep LLM for in-character messaging only when prechecks indicate on-brief.

2. **Make evaluation deterministic-scoring-capable**
   - Introduce a two-stage evaluation output format:
     - stage 1: LLM evidence signals (strict JSON schema)
     - stage 2: deterministic scorer computes `Score`/`Demonstrated`
   - Keep the current backend normalization and strict JSON gate.

3. **Specialty/passive listening: deterministic-first, LLM-fallback**
   - Implement deterministic detection for likely specialty signals (keywords/templates).
   - Only invoke LLM for uncertain cases or for nuanced inference.

4. **Isolate social output from evaluation context**
   - Determine a structured “pressure intent” representation to inject into evaluation prompts instead of free-form statements.
   - Optionally inject a small controlled set of crowd/roaming “beats” rather than entire NPC dialogue.

5. **Reduce repair frequency**
   - If provider supports it, switch from “prompt-only JSON-only instruction” to provider-level structured output.
   - Maintain bounded repair and strict validation as safety net.

### Acceptance metrics (quantitative)

Track these per endpoint and per prompt record (A–E):

- **Contract reliability**
  - `parseFailureRate` = invalid/repair-failed rates for evaluation calls
  - `repairRate` = fraction of evaluation calls that require repair

- **Hallucination/semantic error proxy metrics**
  - `rubricMismatchRate` (manual/admin audit sampling): evidence says “miss” but deterministic scorer contradicts, or vice versa
  - `offBriefTerminationFalsePositiveRate` for gating (how often on-brief is incorrectly terminated)

- **Precision/stability**
  - `scoreStability`: variance of computed `Score` for repeated identical inputs (idempotency already expected)
  - `demonstratedStability`: consistency of the boolean threshold outcome

- **Performance/cost**
  - `p95Latency` for `/api/missions/decision` and social endpoints
  - LLM token/cost (if provider exposes usage)
  - LLM call counts per decision (should decrease as gating improves)

---

## Residual risks / open questions

1. **Rubric machine-readability**
   - The biggest determinism unlock comes from re-authoring `openInputConfig.evaluationPrompt` into structured rules.
   - Without that, LLM must still interpret natural language rubrics, limiting “precision” gains from non-LLM scoring.

2. **Second-order effects from social dialogue**
   - Crowd/roaming dialogue is included in next evaluation prompt context. If that dialogue contains invented claims, the evaluation can be indirectly biased.
   - The target architecture proposes structured intent injection, but the exact representation isn’t specified in the current docs.

3. **Specialty detection labeling strategy**
   - Deterministic specialty detection needs either:
     - explicit templates/regex patterns, or
     - a lightweight classifier with training labels.

---

## Summary recommendation
- Use LLMs where open-ended language reasoning is required (social flavor + nuanced rubric evaluation).
- Reduce hallucination risk by moving numeric scoring + demonstrated-threshold decisions into deterministic code, and by adding deterministic gating around “soft guardrails.”
- Keep repair bounded and schema-driven; do not treat JSON-valid output as correctness.

