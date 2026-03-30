'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { usePrototypeAuth } from '@/lib/ui-prototype/PrototypeAuthContext';
import { MissionCancelControl } from '@/components/ui-prototype/MissionCancelControl';
import { useMissionNavLocked } from '@/lib/useMissionNavLocked';

const nav = [
  { href: '/home', label: 'Home' },
  { href: '/missions', label: 'Missions' },
  { href: '/progress', label: 'Progress' },
  { href: '/program', label: 'Program' },
  { href: '/office/hub', label: 'Office' },
  { href: '/help', label: 'Help' },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { viewerRole } = usePrototypeAuth();
  const missionNavLocked = useMissionNavLocked();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/95">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {missionNavLocked ? (
              <p className="text-sm font-semibold tracking-tight text-white">
                TI Training <span className="text-zinc-500">·</span> prototype shell
              </p>
            ) : (
              <Link href="/home" className="text-sm font-semibold tracking-tight text-white hover:text-emerald-200">
                TI Training <span className="text-zinc-500">·</span> prototype shell
              </Link>
            )}
            <p className="text-[11px] text-zinc-500">Consumer IA — ui-prototype / mock data only</p>
          </div>
          {missionNavLocked ? (
            <nav className="flex flex-wrap items-center gap-2 sm:justify-end" aria-label="Mission in progress">
              <span className="text-xs font-medium text-amber-200/95">Mission in progress</span>
              <MissionCancelControl variant="header" />
            </nav>
          ) : (
            <nav className="flex flex-wrap gap-1.5" aria-label="Primary">
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      active
                        ? 'bg-emerald-900/50 text-emerald-100'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {viewerRole === 'tenant_admin' ? (
                <Link
                  href="/admin/tracker"
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    pathname.startsWith('/admin')
                      ? 'bg-violet-900/50 text-violet-100'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                  }`}
                >
                  Admin
                </Link>
              ) : null}
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
