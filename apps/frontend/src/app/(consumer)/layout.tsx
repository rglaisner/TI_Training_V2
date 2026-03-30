import type { ReactNode } from 'react';
import { AppShell } from '@/components/ui-prototype/AppShell';

export default function ConsumerLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
