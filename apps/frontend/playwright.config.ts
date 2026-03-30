import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    // Match baseURL so reuse detection works when something is already listening on :3000.
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 120000,
    // E2E mocks the API; use test-auth headers + placeholder web config (not for real Firebase).
    env: {
      NEXT_PUBLIC_USE_TEST_AUTH: 'true',
      NEXT_PUBLIC_TEST_TENANT_ID: 'e2e-tenant',
      NEXT_PUBLIC_TEST_USER_ID: 'e2e-user',
      // Desk should run the UI prototype so tests can use the demo identity button.
      // Staging tests are phase-gated/skip-controlled in `mission.spec.ts`.
      NEXT_PUBLIC_USE_PLATFORM_MISSIONS: process.env.E2E_TARGET === 'staging' ? 'true' : 'false',
      // Relative `/api/...` fetches match page.route by pathname (works with any host:port).
      NEXT_PUBLIC_API_BASE_URL: process.env.E2E_API_BASE_URL ?? '',
      NEXT_PUBLIC_FIREBASE_API_KEY: 'playwright-e2e-placeholder',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'playwright-e2e.local',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'playwright-e2e',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'playwright-e2e.appspot.com',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
      NEXT_PUBLIC_FIREBASE_APP_ID: '1:000000000000:web:0000000000000000000000',
    },
  },
});
