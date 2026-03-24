import type { ReactNode } from 'react';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-office-sans',
});

export default function OfficeLayout({ children }: { children: ReactNode }) {
  return <div className={`${dmSans.className} ${dmSans.variable}`}>{children}</div>;
}
