'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useFirebaseAuth, type UseFirebaseAuthResult } from './useFirebaseAuth';

const FirebaseAuthContext = createContext<UseFirebaseAuthResult | null>(null);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const value = useFirebaseAuth();
  return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
}

export function useFirebaseAuthContext(): UseFirebaseAuthResult {
  const ctx = useContext(FirebaseAuthContext);
  if (!ctx) {
    throw new Error('useFirebaseAuthContext must be used within FirebaseAuthProvider');
  }
  return ctx;
}
