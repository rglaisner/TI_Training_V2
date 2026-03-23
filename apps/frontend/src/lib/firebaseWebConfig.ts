import { z } from 'zod';

const FirebaseWebConfigSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1),
  storageBucket: z.string().min(1),
  messagingSenderId: z.string().min(1),
  appId: z.string().min(1),
});

export type FirebaseWebConfig = z.infer<typeof FirebaseWebConfigSchema>;

/**
 * Reads and validates Firebase Web SDK config from NEXT_PUBLIC_* env (browser bundle).
 * On failure: logs Zod issues and throws so the UI does not silently misconfigure Auth.
 */
export function getFirebaseWebConfig(): FirebaseWebConfig {
  const raw = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const parsed = FirebaseWebConfigSchema.safeParse(raw);
  if (!parsed.success) {
    console.error({
      event: 'FIREBASE_WEB_CONFIG_INVALID',
      issues: parsed.error.issues,
    });
    throw new Error(
      'Firebase web config failed validation. Set all NEXT_PUBLIC_FIREBASE_* values in apps/frontend/.env.local.',
    );
  }
  return parsed.data;
}
