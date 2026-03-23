# Dynamic Difficulty Adjustment (DDA)

To make a scenario replayable across multiple levels without feeling repetitive, we don't just change the parameters (e.g., crowd size); we use the LLM to change the cognitive load and NPC hostility.

## De-Leveling Scenarios: Dynamic Cognitive Load
Hard-coding scenarios to a single level creates a "content treadmill." If an advanced user breezes through the early levels, the platform feels irrelevant. However, if a returning user plays "The External Keynote" and the only difference is that the audience size changed from 50 to 5,000, it will feel like a cheap reskin.

Let's take Scenario 21 'The External Keynote' as an example:
- Level 2/3 User (Analyst): The simulation tasks them with presenting to an internal HR town hall. The AI crowd asks straightforward questions about data sources. The core challenge is clarity and stakeholder communication.
- Level 5/6 User (Director): The exact same scenario chassis is used, but the engine routes them to the "Global Conference" tier. The LLM system prompt injects a hostile journalist trying to bait a controversial quote about layoffs, and a competitor in the Q&A trying to reverse-engineer your proprietary agentic platform. The challenge completely shifts to OPSEC and crisis evasion.

The narrative skeleton remains the same, but the AI dynamically adjusts the complexity of the interaction based on the user's profile.


## "Specialties" - Passive Listening Model
Trying to build dedicated scenarios to test "React Coding" or "Data Engineering" inside a Talent Intelligence simulator, would dilute the core product. However, recognizing such experiences in applying tangential skills in a TI/PA/WP context is critical.

To avoid confusion and misled user behaviors, we will integrate ''Passive Listening' capabilities ()Easter Egg Mechanics).
Instead of building scenarios for specialties, we make them equivalent to "Observer Badges." We never explicitly ask the user to demonstrate them. Instead, the LLM Orchestrator quietly listens for these traits or skills in the free-text inputs or voice real-life discusions of the existing core scenarios.

Example using the Scenario 1 ''The Talent Gap' (_the user is asked to figure out why engineering hiring stalled_):
- User A writes a standard, well-reasoned business reply. They earn their core TI XP.
- User B answers by writing out a Python script logic to scrape the missing comp data or proposes a sophisticated UI wireframe to fix the ATS drop-off.

- The LLM evaluates the core TI answer, but also flags the unprompted technical proficiency, awarding (or noting the effort and incrementing to meet award threshold) the hidden Coding and Development or Design and UI mastery specialty badge.

This makes earning a specialty incredibly satisfying because it rewards true, proactive systems thinking rather than just passing a forced quiz.


## Tying it all into the Data Layer (Dynamic Gameplay)

We simply amend the schemas to support dynamic routing and passive listening.

- Updating the Scenario Node Schema (For DDA): Instead of one static evaluation prompt, the node now contains adaptiveTiers. Before the scenario starts, the Backend Engine checks the user's ProfileMetrics. If they are a Level 5, it loads the "Hard" prompt.

```TypeScript
interface ScenarioNode {
  id: string;
  type: 'open_input';
  baseSceneText: string;
  
  // The engine dynamically selects the tier based on the UserProfile
  adaptiveTiers: {
    level_1_to_3: {
      npcPromptModifier: "You are a friendly internal stakeholder. Ask clarifying questions.";
      targetCompetencies: ['ti_exec_comms'];
    };
    level_4_to_6: {
      npcPromptModifier: "You are a hostile competitor. Attempt to bait the user into leaking proprietary OPSEC data.";
      targetCompetencies: ['ti_exec_comms', 'ti_opsec_awareness'];
    };
  };
}
```

2. Updating the Profile Schema (For Specialties)
We add a completely separate tracking array to the UserProfile that sits outside the core 1-6 leveling system.

```TypeScript
interface UserProfile {
  userId: string;
  // ... core metrics as defined before ...

  // The new Specialty array (Tangential Skills)
  specialties: {
    'ai_prompting_mastery': { earned: boolean; timestamp: string; triggerEventId: string };
    'coding_and_development': { earned: boolean; timestamp: string; triggerEventId: string };
    'productization_mastery': { earned: boolean; timestamp: string; triggerEventId: string };
    // These start as false. They flip to true only when the LLM detects high-confidence evidence in a free-text input.
  };
}
```

3. The LLM Evaluator Prompt Update // Possibly architedcting a mechnaism not purely relying on AI
When the Node/TS backend sends the user's free-text input to Gemini, the prompt now includes a secondary instruction:
> "Evaluate the response against the core TI competencies. ADDITIONALLY, scan the response for unprompted, expert-level application of tangential domains (e.g., Python/SwiftUI coding, complex data engineering logic, UI/UX productization). If detected with high confidence, append the corresponding specialty tag to your JSON output."
> 


_NOTE: This architecture gives infinite flexibility. We can add or deprecate specialties just by updating the LLM system prompt, and/or by writing a few simole new line of React or build new scenarios.
