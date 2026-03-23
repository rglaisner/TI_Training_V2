/**
 * Sets Firebase Auth custom claims required by this API: tenantId, role.
 *
 * Run from apps/backend (same folder as .env.local):
 *   npm run set-user-claims -- <firebaseUserUid>
 *
 * Requires in apps/backend/.env.local:
 *   GOOGLE_APPLICATION_CREDENTIALS=<path to service account JSON>
 * (absolute path, or path relative to apps/backend)
 *
 * Optional env:
 *   TENANT_ID   (default: default-tenant)
 *   ROLE        tenant_user | tenant_admin (default: tenant_user)
 */
import { config as loadEnv } from 'dotenv';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';
import { z } from 'zod';

const ServiceAccountJsonSchema = z.object({
  project_id: z.string().min(1),
  client_email: z.string().min(1),
  private_key: z.string().min(1),
});

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

const uid = process.argv[2];
const tenantId = process.env.TENANT_ID ?? 'default-tenant';
const roleEnv = process.env.ROLE ?? 'tenant_user';
const role = roleEnv === 'tenant_admin' ? 'tenant_admin' : 'tenant_user';

if (!uid || uid.trim() === '') {
  console.error('Usage: npm run set-user-claims -- <firebaseUserUid>');
  process.exit(1);
}

const credPathRaw = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
if (!credPathRaw) {
  console.error(
    'Missing GOOGLE_APPLICATION_CREDENTIALS. Add it to apps/backend/.env.local with the full path to your Firebase service account JSON file (Firebase Console → Project settings → Service accounts → Generate new private key).',
  );
  process.exit(1);
}

const credPath = isAbsolute(credPathRaw) ? credPathRaw : resolve(backendRoot, credPathRaw);
if (!existsSync(credPath)) {
  console.error({
    event: 'SERVICE_ACCOUNT_FILE_NOT_FOUND',
    credPath,
  });
  process.exit(1);
}

let serviceAccountRaw: unknown;
try {
  serviceAccountRaw = JSON.parse(readFileSync(credPath, 'utf8')) as unknown;
} catch (error) {
  console.error({
    event: 'SERVICE_ACCOUNT_JSON_READ_FAILED',
    credPath,
    error: error instanceof Error ? error.message : error,
  });
  process.exit(1);
}

const parsedAccount = ServiceAccountJsonSchema.safeParse(serviceAccountRaw);
if (!parsedAccount.success) {
  console.error({
    event: 'SERVICE_ACCOUNT_JSON_INVALID',
    credPath,
    issues: parsedAccount.error.issues,
  });
  process.exit(1);
}

const sa = parsedAccount.data;

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key,
    }),
    projectId: sa.project_id,
  });
}

await admin.auth().setCustomUserClaims(uid, { tenantId, role });
console.log({ event: 'CUSTOM_CLAIMS_SET', uid, tenantId, role });
