### The LLM Orchestrator: Prompt Architecture

When a user submits a free-text decision to `/api/missions/decision`, the backend compiles a multi-part prompt. It injects the active scenario context, the current NPC persona, the target competencies, and the user's historical profile metrics to adapt difficulty.

#### 1. The Core System Prompt (Persona and Guardrails)
This sets the rules of engagement for the AI and enforces behavior constraints for the NPC.

```typescript
// System instruction injected into Gemini.
const buildSystemPrompt = (npcPersona: string, hasCosmetic: boolean) => `
You are an advanced simulation evaluator for a Talent Intelligence platform.
Currently, you are roleplaying as: ${npcPersona}.

CRITICAL GUARDRAILS:
1. Stay strictly in character. If the user's input lacks conciseness or strays from the data, abruptly but professionally end the conversation.
2. Evaluate the user's input against the provided target competencies.
3. You must respond EXCLUSIVELY with a valid JSON payload. No markdown formatting outside the JSON block.

${hasCosmetic ? "Note: The user is wearing a ridiculous virtual hat. Casually poke fun at it once in your feedback." : ""}
`;
```

#### 2. Context and Dynamic Difficulty Injection
This reads the user `profiles` document from Firestore. If the user is already strong in a skill, the LLM is instructed to push back harder.

```typescript
// Context string appended to the user prompt.
const buildContextInjection = (scenarioData: any, userProfile: any) => {
  let difficultyModifier = "Standard evaluation.";

  // Example: Dynamic Difficulty Adjustment for Stakeholder Management.
  if (userProfile.competencies.ti_stakeholder_mgmt > 0.8) {
    difficultyModifier =
      "The user is highly skilled in stakeholder management. The NPC should be exceptionally resistant, highly skeptical of the data, and demand deeper strategic justification.";
  }

  return `
[SCENARIO CONTEXT]
Brief: ${scenarioData.narrative}
Market Reality: ${scenarioData.marketData}

[EVALUATION PARAMETERS]
Target Competencies: ${scenarioData.targetCompetencies.join(", ")}
Difficulty Setting: ${difficultyModifier}
  `;
};
```

#### 3. Enforced JSON Output Schema
To ensure the Render backend can parse the response reliably and update Firestore `events` and `profiles`, Gemini is constrained with a strict `responseSchema`.

```typescript
// Expected structure for the LLM response.
const responseSchema = {
  type: "object",
  properties: {
    Score: {
      type: "number",
      description:
        "A float between 0.0 and 1.0 representing how well the user demonstrated the target competencies."
    },
    Demonstrated: {
      type: "boolean",
      description:
        "True if the user successfully navigated the primary challenge, false if they failed or triggered a negative guardrail."
    },
    Feedback: {
      type: "string",
      description:
        "In-character feedback from the NPC detailing why the input succeeded or failed."
    }
  },
  required: ["Score", "Demonstrated", "Feedback"]
};
```

Normalization note (critical):
- Gemini may output `Score` on a `0.0..1.0` scale, but the backend MUST normalize to the canonical internal scale used for persistence (recommended `0..100`) before updating `/profiles` and writing `/events`. See [`EVALUATION_CONTRACT_VALIDATION_STRATEGY.md`](../../02_Contracts/05_Testing_and_Observability/EVALUATION_CONTRACT_VALIDATION_STRATEGY.md).

### Execution Flow in the Backend
1. **Extract:** Pull `sessionId` and `input` from the request.
2. **Retrieve:** Fetch the active `sessions` doc and the `profiles` doc from Firestore.
3. **Assemble:** Build the prompt using the templates above.
4. **Execute:** Call the Gemini 2.5 API with the strict JSON schema.
5. **Calculate:** Apply the returned `Score` to the relevant `competencyTarget` in the profile.
6. **Persist:** Update `sessions`, update `profiles`, and log the anonymous interaction to `events`.
7. **Respond:** Send updated `NodeContext` and NPC `Feedback` back to the React UI.
