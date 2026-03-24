/**
 * On Vercel, NEXT_PUBLIC_* must be present at build time (inlined into the client bundle).
 * Failing here avoids shipping a production bundle that throws only at runtime in the browser.
 */
function assertVercelPublicEnv() {
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
    throw new Error(
      `[Vercel] Missing or empty environment variables: ${missing.join(
        ', ',
      )}. Add them in the Vercel project → Settings → Environment Variables, then trigger a new deployment. See docs/deployment.md.`,
    );
  }
}

assertVercelPublicEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;

