import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'TIC Trainer V2',
  description: 'Mission Control for TI certification',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-50">
        {children}
      </body>
    </html>
  );
}

