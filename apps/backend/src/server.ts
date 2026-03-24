import { config as loadEnv } from 'dotenv';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';

/** Load apps/backend/.env then apps/backend/.env.local (local wins). Node does not read these files by itself. */
const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const relativeName of ['.env', '.env.local'] as const) {
  const envPath = resolve(backendRoot, relativeName);
  if (existsSync(envPath)) {
    loadEnv({
      path: envPath,
      override: relativeName === '.env.local',
    });
  }
}
import type { DecodedIdToken } from 'firebase-admin/auth';
import { createApp } from './app';
import { FirebaseAuthResolver, TestAuthResolver } from './auth';
import { DeterministicEvaluationEngine, TemplateMentorHintGenerator } from './evaluator';
import {
  GeminiEvaluationEngine,
  GeminiMentorHintGenerator,
  ResilientGeminiMentorHintGenerator,
} from './geminiLlm';
import { FirestorePersistence } from './firestorePersistence';
import { InMemoryPersistence } from './persistence';

const useTestAuth = process.env.USE_TEST_AUTH === 'true';
const useInMemoryPersistence = process.env.USE_IN_MEMORY_PERSISTENCE === 'true';

if (!useInMemoryPersistence && admin.apps.length === 0) {
  admin.initializeApp();
}

const authResolver = useTestAuth
  ? new TestAuthResolver()
  : new FirebaseAuthResolver({
      verifyIdToken: async (token: string) => {
        const decoded: DecodedIdToken = await admin.auth().verifyIdToken(token);
        return {
          uid: decoded.uid,
          tenantId: typeof decoded.tenantId === 'string' ? decoded.tenantId : decoded.tenant_id,
          role: decoded.role,
        };
      },
    });

const persistence = useInMemoryPersistence
  ? new InMemoryPersistence()
  : new FirestorePersistence(admin.firestore());

const geminiKey = process.env.GEMINI_API_KEY?.trim();
const geminiModel = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';

const templateMentor = new TemplateMentorHintGenerator();

const evaluator = geminiKey
  ? new GeminiEvaluationEngine({ apiKey: geminiKey, model: geminiModel })
  : new DeterministicEvaluationEngine();

const mentorHintGenerator = geminiKey
  ? new ResilientGeminiMentorHintGenerator(
      new GeminiMentorHintGenerator({ apiKey: geminiKey, model: geminiModel }),
      templateMentor,
    )
  : templateMentor;

const app = createApp({
  authResolver,
  persistence,
  evaluator,
  mentorHintGenerator,
  evaluationModelId: geminiKey ? geminiModel : 'deterministic-heuristic',
});

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

await app.listen({ port, host });
