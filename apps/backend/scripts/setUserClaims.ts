/**
 * Sets Firebase Auth custom claims required by this API: tenantId, role.
 *
 * Prereqs: same GCP project as the Web app; GOOGLE_APPLICATION_CREDENTIALS or gcloud ADC.
 *
 * Usage (from apps/backend):
 *   npx tsx scripts/setUserClaims.ts <firebaseUserUid>
 *
 * Optional env:
 *   TENANT_ID   (default: default-tenant)
 *   ROLE        tenant_user | tenant_admin (default: tenant_user)
 */
import admin from 'firebase-admin';

const uid = process.argv[2];
const tenantId = process.env.TENANT_ID ?? 'default-tenant';
const roleEnv = process.env.ROLE ?? 'tenant_user';
const role = roleEnv === 'tenant_admin' ? 'tenant_admin' : 'tenant_user';

if (!uid || uid.trim() === '') {
  console.error('Usage: npx tsx scripts/setUserClaims.ts <firebaseUserUid>');
  process.exit(1);
}

if (admin.apps.length === 0) {
  admin.initializeApp();
}

await admin.auth().setCustomUserClaims(uid, { tenantId, role });
console.log({ event: 'CUSTOM_CLAIMS_SET', uid, tenantId, role });
