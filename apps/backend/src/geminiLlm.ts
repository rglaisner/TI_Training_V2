import { EvaluationJsonSchema, normalizeScoreTo100, type TICompetency } from '@ti-training/shared';
import type {
  EvaluationEngine,
  EvaluationResult,
  MentorHintGenerator,
  MentorHintRequest,
  OpenInputEvaluationRequest,
} from './evaluator';

export interface GeminiLlmConfig {
  apiKey: string;
  /** e.g. gemini-2.0-flash */
  model: string;
}

function extractTextFromGeminiResponse(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const root = data as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const part = root.candidates?.[0]?.content?.parts?.[0];
  const text = part?.text;
  return typeof text === 'string' && text.trim().length > 0 ? text.trim() : null;
}

async function callGeminiText(params: {
  apiKey: string;
  model: string;
  prompt: string;
  responseMimeType?: 'application/json' | 'text/plain';
}): Promise<{ ok: true; text: string } | { ok: false; status: number; bodySnippet: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${encodeURIComponent(params.apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
      generationConfig: {
        temperature: 0.35,
        ...(params.responseMimeType ? { responseMimeType: params.responseMimeType } : {}),
      },
    }),
  });
  const rawText = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText) as unknown;
  } catch {
    return { ok: false, status: res.status, bodySnippet: rawText.slice(0, 200) };
  }
  if (!res.ok) {
    const errMsg =
      typeof parsed === 'object' && parsed !== null && 'error' in parsed
        ? JSON.stringify((parsed as { error?: unknown }).error)
        : rawText.slice(0, 200);
    return { ok: false, status: res.status, bodySnippet: errMsg };
  }
  const text = extractTextFromGeminiResponse(parsed);
  if (!text) {
    return { ok: false, status: res.status, bodySnippet: 'empty_model_text' };
  }
  return { ok: true, text };
}

function parseJsonEvaluation(raw: string): { score: number; demonstrated: boolean; feedback: string } {
  const trimmed = raw.trim();
  const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const data = JSON.parse(withoutFence) as unknown;
  const parsed = EvaluationJsonSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`EVAL_JSON_INVALID: ${parsed.error.message}`);
  }
  return {
    score: parsed.data.Score,
    demonstrated: parsed.data.Demonstrated,
    feedback: parsed.data.Feedback,
  };
}

export class GeminiEvaluationEngine implements EvaluationEngine {
  constructor(private readonly config: GeminiLlmConfig) {}

  async evaluateOpenInput(input: OpenInputEvaluationRequest): Promise<EvaluationResult> {
    const prompt = [
      'You are a strict talent-intelligence simulation grader.',
      'Read the scenario context and the learner response.',
      'Apply the rubric. Do not invent facts about the company.',
      '',
      '[SCENE CONTEXT]',
      input.sceneContext,
      '',
      '[RUBRIC]',
      input.evaluationRubric,
      '',
      '[LEARNER RESPONSE]',
      input.inputText,
      '',
      'Reply with ONLY valid JSON matching: {"Score": number between 0 and 1, "Demonstrated": boolean, "Feedback": string}',
    ].join('\n');

    const result = await callGeminiText({
      apiKey: this.config.apiKey,
      model: this.config.model,
      prompt,
      responseMimeType: 'application/json',
    });
    if (!result.ok) {
      throw new Error(`GEMINI_EVAL_FAILED: ${result.status} ${result.bodySnippet}`);
    }

    const ev = parseJsonEvaluation(result.text);
    const normalized = normalizeScoreTo100(ev.score);
    return {
      awardedScore: normalized.awardedScore,
      rawScore: ev.score,
      rawScale: normalized.rawScale,
      demonstrated: ev.demonstrated,
      feedbackText: ev.feedback,
    };
  }
}

export class GeminiMentorHintGenerator implements MentorHintGenerator {
  constructor(private readonly config: GeminiLlmConfig) {}

  async generateHint(input: MentorHintRequest): Promise<string> {
    const prompt = [
      'You are a senior Talent Intelligence mentor inside a corporate simulation.',
      'Stay grounded in the scenario. No jokes. No fake names. Max 120 words.',
      'Give Socratic guidance: 1–2 questions, optionally one hint—never the full answer.',
      '',
      '[CURRENT SCENE]',
      input.sceneText,
      input.userMessage?.trim()
        ? `\n[LEARNER MESSAGE]\n${input.userMessage.trim()}`
        : '',
      input.challengeText?.trim()
        ? `\n[FOCUS]\n${input.challengeText.trim()}`
        : '',
    ].join('\n');

    const result = await callGeminiText({
      apiKey: this.config.apiKey,
      model: this.config.model,
      prompt,
    });
    if (!result.ok) {
      throw new Error(`GEMINI_MENTOR_FAILED: ${result.status} ${result.bodySnippet}`);
    }
    return result.text;
  }
}

export function primaryTargetCompetency(targets: TICompetency[]): TICompetency {
  return targets[0] ?? 'ti_data_integrity';
}

export class ResilientGeminiMentorHintGenerator implements MentorHintGenerator {
  constructor(
    private readonly inner: GeminiMentorHintGenerator,
    private readonly fallback: MentorHintGenerator,
  ) {}

  async generateHint(input: MentorHintRequest): Promise<string> {
    try {
      return await this.inner.generateHint(input);
    } catch {
      return this.fallback.generateHint(input);
    }
  }
}
