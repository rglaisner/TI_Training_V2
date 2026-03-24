# Gemini and mission evaluation

## Backend environment

In `apps/backend/.env.local` (never commit real keys):

- `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/apikey). Enables rubric-based scoring and LLM mentor replies.
- `GEMINI_MODEL` — optional, default `gemini-2.0-flash`. Use another model name if your key’s region or quota requires it.

If `GEMINI_API_KEY` is unset, missions still run: open-text turns use a **deterministic length heuristic** and the mentor uses **template** hints.

## Flow

1. **Start** — server assigns a `sessionSeed` (stored on the session). It drives company name, contractor %, and which **surprise** line appears on the final pressure beat.
2. **Branching** — three stance options; each routes to a **different** open-text prompt (same graph depth, different copy and rubric emphasis).
3. **Open input** — evaluator receives full **scene text** + **rubric** from the scenario catalog. JSON scores are validated with Zod before XP and **competency rolling averages** update.
4. **Terminal** — dossier view; profile metrics in the API response reflect cumulative updates.

## Troubleshooting

- **503 `EVALUATION_UNAVAILABLE`** — Gemini HTTP error or empty response. Check key, model name, and quota; retry.
- **422 `EVAL_JSON_INVALID`** — model returned non-conforming JSON. Logs include the issue path; try again or switch model.
