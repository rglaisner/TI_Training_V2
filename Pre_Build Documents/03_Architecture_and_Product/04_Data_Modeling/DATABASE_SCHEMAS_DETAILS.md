# DATABASED SCHEMAS DETAILS

To make the TIC Trainer V2 a true certification engine rather than just a game, the data layer must rigorously quantify highly subjective, qualitative human skills. 

__This is where the architecture really comes together.__

Since the backend is acting as the single source of truth and persisting state via a partitioned Firestore database, we need to structure ProfileMetrics to capture both the granular competency scores and the overarching qualitative labels (the "Badges").

Below is a mockup for the TypeScript schema design for the Profiles and Events collections, specifically expanded to handle the new categories (Leading & Managing, Creative & Critical Thinking, Thought Leadership).


## The Core Competency Taxonomy (Enum/Types)

First, we define the exact strings the LLM Orchestrator will use when scoring an Open Input node. This ensures the JSON payload {Score, Demonstrated, Feedback} maps perfectly to the database.

```TypeScript
// The overarching pillars of the certification
type TICategory = 
  | 'FOUNDATIONS' 
  | 'INFLUENCE' 
  | 'STRATEGY' 
  | 'CRISIS' 
  | 'ETHICS' 
  | 'LEADING_AND_MANAGING' 
  | 'CREATIVE_AND_CRITICAL_THINKING' 
  | 'THOUGHT_LEADERSHIP';
```

``` TypeScript
// The granular skills evaluated by Gemini 2.5
type TICompetency = 
  // Foundations & Influence
  | 'ti_data_integrity'
  | 'ti_stakeholder_mgmt'
  | 'ti_exec_comms'
  | 'ti_osint_humint'
  // Strategy & Crisis
  | 'ti_workforce_planning'
  | 'ti_risk_modeling' // Tracks ability to run probabilistic/Monte Carlo style scenarios
  | 'ti_crisis_triage'
  // Leading & Managing (NEW)
  | 'ti_cross_functional_leadership'
  | 'ti_capability_assessment'
  | 'ti_data_governance_accountability'
  // Creative & Critical Thinking (NEW)
  | 'ti_lateral_thinking'
  | 'ti_signal_triangulation' // Tracks ability to synthesize unstructured/scraped intel
  | 'ti_org_design'
  // Thought Leadership (NEW)
  | 'ti_strategic_vision'
  | 'ti_opsec_awareness';
```


## The Profile Document Schema (Firestore /profiles Collection)

This document represents the user's persistent, validated state. It separates the "Serious" track (Competencies, Labels) from the "Fun" track (XP, Cosmetics) as mandated by the dual-track value economy.

```TypeScript
interface UserProfile {
  userId: string;
  tenantId: string; (start_span)// Enforces strict enterprise data segregation
  lastUpdated: string; // ISO 8601 Timestamp
  
  // --- THE SERIOUS TRACK ---
  metrics: {
    // Aggregated category mastery (0.0 to 100.0)
    categoryScores: Record<TICategory, number>;
    
    // Granular competency tracking
    competencies: Record<TICompetency, CompetencyDetail>;
    
    // The qualitative validation
    labelsOfExcellence: string[]; // e.g., ['Ethical Guardian', 'Crisis Ready', 'Strategic Architect']
  };

  // --- THE FUN TRACK ---
  engagement: {
    totalXP: number;
    categoryXP: Record<TICategory, number>;
    activeCosmetics: string[]; // e.g., ['virtual_ti_hat']
  };
}

interface CompetencyDetail {
  score: number;       // Rolling average or weighted score (0-100)
  evaluations: number; // Total number of times this skill was tested
  lastDemonstrated: string; // Timestamp
  trend: 'up' | 'down' | 'flat'; // Useful for identifying skill decay over time
}
```


## The Anonymized Event Log (Firestore /events Collection)

To build a persistent record of validated excellence and support the eventual V2.1 Admin Dashboards, every single evaluation must be appended to an immutable event lake. This is where the output from Gemini is stored.

```TypeScript
interface EvaluationEvent {
  eventId: string;
  tenantId: string; // Required for multi-tenant querying
  timestamp: string;
  
  // User identity is stripped; tracked only by an anonymous session or profile hash
  profileHash: string; 
  
  scenarioId: string;
  nodeId: string;
  
  // The raw output from the AI Orchestrator
  evaluation: {
    targetCompetency: TICompetency;
    awardedScore: number; // 0-100 scale for this specific interaction
    demonstrated: boolean; // Did they pass the minimum threshold?
    feedback: string; // The private, synthesized coaching feedback
  };

  metadata: {
    timeTakenSeconds: number;
    usedMentor: boolean;
  };
}
```


## How the Data Drives the Dynamic Gameplay

Because we have separated CompetencyDetail into specific tracks, the Mission Router can dynamically adjust scenarios based on the UserProfile document:

- **Adaptive Difficulty**: If a user has a ti_lateral_thinking score of 95, the Engine modifies the open input configuration for Scenario 18 ("The Proxy Metric"). Instead of the CEO just asking for competitor health, the AI is prompted to actively dismiss the user's first two proxy metric suggestions, forcing them to dig deeper.
- **Cosmetic Injection**: As noted in the blueprint, if engagement.activeCosmetics includes specific items, the buildPersonaPrompt function alters the NPC's system prompt to acknowledge it.
