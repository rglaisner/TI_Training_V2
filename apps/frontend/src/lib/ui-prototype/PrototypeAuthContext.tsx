'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type PrototypeViewerRole = 'signed_out' | 'learner' | 'tenant_admin';

export interface PrototypeUser {
  id: string;
  email: string;
  displayName: string;
}

interface PrototypeAuthContextValue {
  viewerRole: PrototypeViewerRole;
  user: PrototypeUser | null;
  authReady: boolean;
  signInDemoLearner: () => void;
  signInDemoAdmin: () => void;
  signOut: () => void;
}

const PrototypeAuthContext = createContext<PrototypeAuthContextValue | null>(null);

export function PrototypeAuthProvider({ children }: { children: ReactNode }) {
  const [viewerRole, setViewerRole] = useState<PrototypeViewerRole>('signed_out');
  const [user, setUser] = useState<PrototypeUser | null>(null);

  const signInDemoLearner = useCallback(() => {
    setViewerRole('learner');
    setUser({
      id: 'demo-learner-1',
      email: 'learner.demo@example.com',
      displayName: 'Demo learner',
    });
  }, []);

  const signInDemoAdmin = useCallback(() => {
    setViewerRole('tenant_admin');
    setUser({
      id: 'demo-admin-1',
      email: 'admin.demo@example.com',
      displayName: 'Demo tenant admin',
    });
  }, []);

  const signOut = useCallback(() => {
    setViewerRole('signed_out');
    setUser(null);
  }, []);

  const value = useMemo(
    (): PrototypeAuthContextValue => ({
      viewerRole,
      user,
      authReady: true,
      signInDemoLearner,
      signInDemoAdmin,
      signOut,
    }),
    [viewerRole, user, signInDemoAdmin, signInDemoLearner, signOut],
  );

  return <PrototypeAuthContext.Provider value={value}>{children}</PrototypeAuthContext.Provider>;
}

export function usePrototypeAuth(): PrototypeAuthContextValue {
  const ctx = useContext(PrototypeAuthContext);
  if (!ctx) {
    throw new Error('usePrototypeAuth must be used within PrototypeAuthProvider');
  }
  return ctx;
}
