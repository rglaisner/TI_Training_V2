'use client';

import Link from 'next/link';
import { usePrototypeAuth } from '@/lib/ui-prototype/PrototypeAuthContext';
import { PrototypeSignInPanel } from '@/components/ui-prototype/PrototypeSignInPanel';

export default function HomePage() {
  const { user, viewerRole } = usePrototypeAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Home</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Resume training, jump to missions, or review evidence. This shell uses in-memory demo identity only.
        </p>
      </div>

      <PrototypeSignInPanel />

      {!user ? (
        <p className="text-sm text-zinc-500">Use “Continue as demo learner” to unlock the mission picker and progress.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          <li>
            <Link
              href="/missions"
              className="block rounded-xl border border-emerald-800/50 bg-emerald-950/25 p-4 text-sm text-emerald-100 hover:border-emerald-600/60"
            >
              <span className="font-medium">Start or continue missions</span>
              <span className="mt-1 block text-xs text-emerald-200/80">Scenario catalog · prototype HUD</span>
            </Link>
          </li>
          <li>
            <Link
              href="/progress"
              className="block rounded-xl border border-zinc-700 bg-zinc-900/40 p-4 text-sm text-zinc-200 hover:border-zinc-500"
            >
              <span className="font-medium">View progress</span>
              <span className="mt-1 block text-xs text-zinc-500">Mock tracker & evidence trail</span>
            </Link>
          </li>
          <li>
            <Link
              href="/program"
              className="block rounded-xl border border-zinc-700 bg-zinc-900/40 p-4 text-sm text-zinc-200 hover:border-zinc-500"
            >
              <span className="font-medium">Program overview</span>
              <span className="mt-1 block text-xs text-zinc-500">For HR / L&D evaluators</span>
            </Link>
          </li>
          {viewerRole === 'tenant_admin' ? (
            <li>
              <Link
                href="/admin/tracker"
                className="block rounded-xl border border-violet-800/50 bg-violet-950/25 p-4 text-sm text-violet-100 hover:border-violet-600/60"
              >
                <span className="font-medium">Admin · rollout & exports</span>
                <span className="mt-1 block text-xs text-violet-200/80">Mock control plane</span>
              </Link>
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
