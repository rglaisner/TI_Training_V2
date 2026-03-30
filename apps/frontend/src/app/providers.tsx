'use client';

import type { ReactNode } from 'react';
import { FirebaseAuthProvider } from '../lib/FirebaseAuthContext';
import { PrototypeAuthProvider } from '@/lib/ui-prototype/PrototypeAuthContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseAuthProvider>
      <PrototypeAuthProvider>{children}</PrototypeAuthProvider>
    </FirebaseAuthProvider>
  );
}