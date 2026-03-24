'use client';

import type { ReactNode } from 'react';
import { FirebaseAuthProvider } from '../lib/FirebaseAuthContext';

export default function Providers({ children }: { children: ReactNode }) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}