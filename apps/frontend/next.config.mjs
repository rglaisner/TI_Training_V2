/**
 * On Vercel, NEXT_PUBLIC_* are inlined at build time. We only **warn** here so a missing dashboard
 * config does not block deploy; the client still shows `FirebaseAuthPanel` instructions when Firebase
 * vars are absent. For a working production app, set all listed keys and redeploy.
 *
 * Note: Redeploying an old failed Vercel deployment reuses that deployment’s Git SHA. After changing
 * this file, deploy from the latest `main` (new commit or “Deploy” from branch), not “Redeploy” on a stale build.
 */
function warnVercelPublicEnv() {
  if (process.env.VERCEL !== '1') {
    return;
  }
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_API_BASE_URL',
  ];
  const missing = required.filter((key) => !String(process.env[key] ?? '').trim());
  if (missing.length > 0) {
    console.warn(
      `[ti-training] Vercel build: missing or empty env: ${missing.join(', ')}. ` +
        'Build continues; add these under Project → Settings → Environment Variables and redeploy for live Firebase + API. See docs/deployment.md.',
    );
  }
}

warnVercelPublicEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;

