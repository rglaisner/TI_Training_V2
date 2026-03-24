import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirebaseWebConfig } from './firebaseWebConfig';

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

/**
 * Lazily initializes Firebase so `next build` / prerender does not require
 * NEXT_PUBLIC_FIREBASE_* (those are injected at build time on Vercel once set).
 */
export function getFirebaseAuth(): Auth {
  if (cachedAuth) {
    return cachedAuth;
  }
  const firebaseConfig = getFirebaseWebConfig();
  cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  cachedAuth = getAuth(cachedApp);
  return cachedAuth;
}
