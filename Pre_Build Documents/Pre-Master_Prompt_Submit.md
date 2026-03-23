## Runnable scaffold built from the plan

- Monorepo workspace: root package.json + tsconfig.base.json
- Shared contracts/types: packages/shared/ (zod + TypeScript types)
- Backend API stub (Fastify): apps/backend/src/server.ts
```
/health
POST /api/missions/start
POST /api/missions/decision
POST /api/missions/mentor
```

- Frontend shell (Next.js + Tailwind): apps/frontend/
- Typed client stub: apps/frontend/src/lib/platformClient.ts
- Environment examples:
```
apps/backend/.env.example
apps/frontend/.env.example
```

---
## Verified:
- npm -ws run typecheck 	passes
- npm -ws run build 		passes
- backend stub endpoints return the expected mission-state shape (smoke test)

---
## Step-by-step: how you launch the project execution (Cursor agents)

- Open a new Cursor instance and open the repo folder: c:\Users\remyg\Projects\TI Traning\TI-training-group
- In the repo root, ensure dependencies are installed (if not already):

```
npm install
```

- Set env files:
	- Copy apps/backend/.env.example to apps/backend/.env
	- Copy apps/frontend/.env.example to apps/frontend/.env (Defaults use backend on http://localhost:4000.)
	- (Recommended) Start the dev servers in two terminals so agents/tests have a live API/UI:
Backend: 

```
npm -w @ti-training/backend run dev
```

- Frontend: 
```
npm -w @ti-training/frontend run dev
``

- Start the autonomous agent run from the kickoff prompt:
	- Open Pre_Build Documents/00_Program_Control/MASTER_KICKOFF_PROMPT.md
	- In Cursor Agent chat, create a fresh autonomous session, paste the prompt, and let it run.

---
##How to “not miss anything” for the first review

- After the first agent batch finishes, before you trust “V2 is close to completion,” you can quickly validate:

```
npm -ws run typecheck
npm -ws run build
```

backend stub/contract behavior still matches the contracts (agents should have expanded beyond stubs by then)