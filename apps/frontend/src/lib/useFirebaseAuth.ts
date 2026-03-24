'use client';

import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getFirebaseAuth } from './firebaseClient';
import { isFirebaseWebConfigReady } from './firebaseWebConfig';
import { useMissionStore } from './missionStore';

function isTestAuthBypass(): boolean {
  return process.env.NEXT_PUBLIC_USE_TEST_AUTH === 'true';
}

export interface UseFirebaseAuthResult {
  /** Firebase user when signed in; null when signed out. */
  user: User | null;
  /** True after the first onAuthStateChanged callback (avoids UI flash). */
  authReady: boolean;
  /**
   * True when `NEXT_PUBLIC_FIREBASE_*` were missing or invalid at build time (typical on Vercel
   * until env vars are set). Auth UI should explain deployment configuration, not offer sign-in.
   */
  firebaseConfigInvalid: boolean;
  /** True when API calls can proceed without a Firebase user (E2E / local escape hatch only). */
  apiIdentityBypassed: boolean;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

export function useFirebaseAuth(): UseFirebaseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const authBootstrapped = useRef(false);
  const previousUid = useRef<string | null>(null);
  const firebaseConfigInvalid = !isFirebaseWebConfigReady();

  useEffect(() => {
    if (firebaseConfigInvalid) {
      setAuthReady(true);
      return undefined;
    }
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      const uid = nextUser?.uid ?? null;
      if (!authBootstrapped.current) {
        authBootstrapped.current = true;
        previousUid.current = uid;
        return;
      }
      if (previousUid.current !== uid) {
        previousUid.current = uid;
        useMissionStore.getState().resetMission();
      }
    });
  }, [firebaseConfigInvalid]);

  const signInWithEmailPassword = useCallback(async (email: string, password: string) => {
    if (!isFirebaseWebConfigReady()) {
      throw new Error(
        'Firebase is not configured in this deployment. Set NEXT_PUBLIC_FIREBASE_* on the host (e.g. Vercel env) and redeploy.',
      );
    }
    await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  }, []);

  const signOutUser = useCallback(async () => {
    if (!isFirebaseWebConfigReady()) {
      return;
    }
    await signOut(getFirebaseAuth());
  }, []);

  return useMemo(
    () => ({
      user: firebaseConfigInvalid ? null : user,
      authReady,
      firebaseConfigInvalid,
      apiIdentityBypassed: isTestAuthBypass(),
      signInWithEmailPassword,
      signOutUser,
    }),
    [
      user,
      authReady,
      firebaseConfigInvalid,
      signInWithEmailPassword,
      signOutUser,
    ],
  );
}
