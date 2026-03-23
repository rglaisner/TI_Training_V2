'use client';

import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { auth } from './firebaseClient';

function isTestAuthBypass(): boolean {
  return process.env.NEXT_PUBLIC_USE_TEST_AUTH === 'true';
}

export interface UseFirebaseAuthResult {
  /** Firebase user when signed in; null when signed out. */
  user: User | null;
  /** True after the first onAuthStateChanged callback (avoids UI flash). */
  authReady: boolean;
  /** True when API calls can proceed without a Firebase user (E2E / local escape hatch only). */
  apiIdentityBypassed: boolean;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

export function useFirebaseAuth(): UseFirebaseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
  }, []);

  const signInWithEmailPassword = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  return useMemo(
    () => ({
      user,
      authReady,
      apiIdentityBypassed: isTestAuthBypass(),
      signInWithEmailPassword,
      signOutUser,
    }),
    [user, authReady, signInWithEmailPassword, signOutUser],
  );
}
