# Landing + Dashboard + Scenario Selection Flows

This doc defines the V2 “front door” user journeys:
- mini opening cinematic
- landing page and sign-in/sign-on/guest entry
- landing dashboard (scenario selection + push/update behavior)
- mission start (connect to backend via `PlatformClient.startMission`)

It aligns with the decoupled stack:
- backend is the source of truth
- UI renders and collects input, then submits through `PlatformClient`

It also aligns with the UI/UX credibility layer:
- `V2_DESIGN_SYSTEM_TOKENS_AND_LAYOUT_RULES.md` (HUD layout regions, typography and motion rules)
- `V2_MICROCOPY_AND_TONE_GUIDE.md` (control/status text vs in-character flavor)
- `V2_UI_VARIATION_CONTRACT.md` (Skin + Frame safety: presentation only)
- `V2_SCENARIO_AMBIENCE_AND_MOOD_SPEC.md` (ambience variations that do not change mission logic)

## Route map (suggested)
- `/` (Base Landing)
- `/auth` (Sign-in/Sign-on)
- `/guest` (Guest entry, if supported)
- `/dashboard` (Landing Dashboard / Scenario Selection)
- `/mission/:sessionId` (Optional, if you want a direct mission route)

If you keep SPA routes:
- Mission entry can be `/dashboard` → in-place mission start.

## Flow 0: Mini opening cinematic (front-end only)
Purpose:
- set tone and “mission control” vibe

Rules:
- no backend calls
- user can skip

Design requirements:
- cinematic must not claim mission evaluation has started
- control/status text must remain consistent with `V2_MICROCOPY_AND_TONE_GUIDE.md`

## Flow 1: Auth Gate (Sign-in / Sign-on / Guest)
User choices:
- Sign-in with authenticated user (preferred)
- Sign-on via enterprise SSO (future V2.1, see blueprint)
- Guest mode (if allowed for prototypes)

Backend coupling:
- authentication creates the Firebase JWT
- UI stores no mission truth

## Flow 2: Landing Dashboard
Dashboard must show scenario selection and scenario “push” content:
- scenario cards grouped by:
  - storyline arc
  - recommended competency level band (if available)
  - whether it is enabled for tenant
- “scenario being pushed” messaging:
  - show new/featured scenarios first
  - optionally show “coming soon” items

Backend coupling:
- scenario enablement list should be tenant-specific and fetched from backend (suggested endpoint: `GET /api/scenarios/available`)

## Flow 3: Scenario Selection → Start Mission
User action:
- click a scenario card

UI steps:
1. call `PlatformClient.startMission({ scenarioId })`
2. store returned `missionState` in Zustand store:
   - `sessionId`
   - `currentNode`
   - `profileMetrics`
   - `isTerminal`
3. navigate to `MissionHUD` renderer

Error handling:
- if scenario is disabled or tenant mismatch:
  - show a user-safe error
  - return to dashboard

## Flow 4: MissionHUD (already conceptually defined)
Even though this doc focuses on landing/dash flows, the mission should use the node-driven UX system:
- render narrative for `currentNode`
- render correct input module:
  - branching choices
  - open input editor for free-text
- render social sequence:
  - Mentor / Crowd / Roaming messages queued by backend logic

Voice mode integration (V2 advanced):
- voice mode should be available after `startMission`
- voice controls must never bypass backend gating

## Success criteria
- Users can reach mission start without manual refresh
- Mission start always results in a valid `MissionState`
- UI never calls Firestore directly
- Terminal sessions show dossier/summary reliably based on `isTerminal`

