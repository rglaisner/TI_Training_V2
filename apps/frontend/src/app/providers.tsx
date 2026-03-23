'use client';

import '@/lib/firebaseClient';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}