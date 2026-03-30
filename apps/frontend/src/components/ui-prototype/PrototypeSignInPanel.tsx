'use client';

import { usePrototypeAuth } from '@/lib/ui-prototype/PrototypeAuthContext';

/** Placeholder identity for ui-prototype — no Firebase or token exchange. */
export function PrototypeSignInPanel({ className = '' }: { className?: string }) {
  const { viewerRole, user, signInDemoLearner, signInDemoAdmin, signOut } = usePrototypeAuth();

  return (
    <section
      data-testid="prototype-auth-panel"
      className={`rounded-lg border border-zinc-700 bg-zinc-900/40 p-4 ${className}`}
    >
      <h2 className="text-sm font-medium text-zinc-200">Identity (prototype)</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Demo only — swaps viewer role in memory. Production will use Firebase + tenant claims.
      </p>
      {user ? (
        <p className="mt-2 text-sm text-zinc-300">
          Signed in as <span className="font-medium text-emerald-200">{user.displayName}</span> ({viewerRole})
        </p>
      ) : (
        <p className="mt-2 text-sm text-zinc-400">Not signed in.</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="prototype-signin-learner"
          className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
          onClick={signInDemoLearner}
        >
          Continue as demo learner
        </button>
        <button
          type="button"
          data-testid="prototype-signin-admin"
          className="rounded-md border border-violet-600/60 bg-violet-950/30 px-3 py-1.5 text-xs font-medium text-violet-100 hover:bg-violet-900/40"
          onClick={signInDemoAdmin}
        >
          Continue as demo admin
        </button>
        {user ? (
          <button
            type="button"
            className="rounded-md border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
            onClick={signOut}
          >
            Sign out
          </button>
        ) : null}
      </div>
    </section>
  );
}
