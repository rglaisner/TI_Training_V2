import admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { createApp } from './app';
import { FirebaseAuthResolver, TestAuthResolver } from './auth';
import { DeterministicEvaluationEngine } from './evaluator';
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

const app = createApp({
  authResolver,
  persistence,
  evaluator: new DeterministicEvaluationEngine(),
});

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

await app.listen({ port, host });

