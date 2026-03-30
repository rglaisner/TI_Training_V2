'use client';

import { FirebaseError } from 'firebase/app';
import { useState } from 'react';
import Link from 'next/link';
import { useFirebaseAuthContext } from '../lib/FirebaseAuthContext';

function signInErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/user-not-found'
    ) {
      return 'Invalid email or password.';
    }
    if (error.code === 'auth/invalid-email') {
      return 'That email address does not look valid.';
    }
    if (error.code === 'auth/too-many-requests') {
      return 'Too many attempts. Try again later.';
    }
    return 'Sign-in failed.';
  }
  return 'Sign-in failed.';
}

export default function FirebaseAuthPanel() {
  const {
    user,
    authReady,
    firebaseConfigInvalid,
    apiIdentityBypassed,
    authMode,
    diagnostics,
    signInWithEmailPassword,
    signOutUser,
  } = useFirebaseAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  if (authMode === 'checking' || !authReady) {
    return (
      <section
        className="mt-4 rounded border border-zinc-700 p-4 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
        data-testid="auth-region"
        data-office-focus="phone"
        tabIndex={-1}
      >
        <p className="text-zinc-400">Checking sign-in…</p>
      </section>
    );
  }

  if (firebaseConfigInvalid || authMode === 'misconfigured') {
    return (
      <section
        className="mt-4 rounded border border-red-900/60 bg-red-950/40 p-4 outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
        data-testid="auth-region"
        data-office-focus="phone"
        tabIndex={-1}
      >
        <h2 className="text-lg font-medium text-red-100">Identity setup needs attention</h2>
        <p className="mt-2 text-sm leading-relaxed text-red-200/90">
          This session cannot use live Firebase sign-in yet. You can still continue through the office hub while setup is
          being fixed.
        </p>
        {diagnostics.missingEnvKeys.length > 0 ? (
          <p className="mt-2 text-xs text-red-200/80">
            Missing keys: {diagnostics.missingEnvKeys.join(', ')}
          </p>
        ) : null}
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-red-100/95">
          <li>
            Vercel → your project → <strong>Settings → Environment Variables</strong>: add every key from{' '}
            <code className="rounded bg-red-950/80 px-1">apps/frontend/.env.example</code> (Production and Preview if you
            use previews).
          </li>
          <li>
            Set <code className="rounded bg-red-950/80 px-1">NEXT_PUBLIC_API_BASE_URL</code> to your API origin (e.g.{' '}
            <code className="rounded bg-red-950/80 px-1">https://ti-training-api.onrender.com</code>).
          </li>
          <li>Redeploy the frontend. Add your Vercel hostname under Firebase → Authentication → Authorized domains.</li>
        </ol>
        <p className="mt-3 text-xs text-red-300/80">
          Local fix: copy values into <code className="rounded bg-red-950/80 px-1">apps/frontend/.env.local</code>. See{' '}
          <code className="rounded bg-red-950/80 px-1">docs/deployment.md</code>.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border border-red-700/70 bg-red-950/40 px-3 py-1.5 text-xs text-red-100 hover:bg-red-900/40"
            onClick={() => window.location.reload()}
            data-testid="auth-retry-setup"
          >
            Retry setup check
          </button>
          <Link
            href="/office/hub"
            className="rounded border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800/60"
            data-testid="auth-continue-fallback"
          >
            Continue in guided fallback mode
          </Link>
        </div>
      </section>
    );
  }

  if (apiIdentityBypassed || authMode === 'test_bypass') {
    return (
      <section
        className="mt-4 rounded border border-amber-800/60 bg-amber-950/30 p-4 outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
        data-testid="auth-region"
        data-office-focus="phone"
        tabIndex={-1}
      >
        <h2 className="text-lg font-medium text-amber-100">Auth (test bypass)</h2>
        <p className="mt-2 text-sm text-amber-200/90">
          `NEXT_PUBLIC_USE_TEST_AUTH` is on. API calls add dev headers (<code className="text-amber-100">x-tenant-id</code>,{' '}
          <code className="text-amber-100">x-user-id</code>) — there is <strong>no</strong> Firebase login form on purpose.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-amber-200/80">
          The backend must have <code className="rounded bg-amber-900/40 px-1">USE_TEST_AUTH=true</code> and be restarted, or
          every API call will fail and you will only see <strong>cached placeholder scenarios</strong> (same two cards as the
          demo copy).
        </p>
        <div className="mt-3 flex gap-2 text-xs text-amber-100/90">
          <span className="rounded bg-amber-900/30 px-2 py-1">Dev / E2E only</span>
          <span className="rounded bg-amber-900/30 px-2 py-1">Not production identity</span>
        </div>
      </section>
    );
  }

  if (user) {
    return (
      <section
        className="mt-4 rounded border border-zinc-700 p-4 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
        data-testid="auth-region"
        data-office-focus="phone"
        tabIndex={-1}
      >
        <h2 className="text-lg font-medium">Signed in</h2>
        <p className="mt-2 text-sm text-zinc-400" data-testid="auth-user-label">
          {user.email ?? user.uid}
        </p>
        <button
          type="button"
          data-testid="sign-out-button"
          className="mt-3 rounded border border-zinc-500 px-3 py-1.5 text-sm"
          onClick={() => {
            setFormError('');
            void signOutUser().catch(() => {
              setFormError('Sign-out failed.');
            });
          }}
        >
          Sign out
        </button>
        {formError ? <p className="mt-2 text-sm text-red-300">{formError}</p> : null}
      </section>
    );
  }

  return (
    <section
      className="mt-4 rounded border border-zinc-700 p-4 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
      data-testid="auth-region"
      data-office-focus="phone"
      tabIndex={-1}
    >
      <h2 className="text-lg font-medium">Sign in (Firebase)</h2>
      <p className="mt-2 text-sm text-zinc-400">
        The API requires a real Firebase ID token. Use the same project as the backend service account.
      </p>
      <p className="mt-2 text-xs text-zinc-500">
        If sign-in succeeds but API calls still fail, your account may be missing tenant provisioning claims on the backend.
      </p>
      <div className="mt-3 flex max-w-md flex-col gap-2">
        <label className="text-sm text-zinc-300">
          Email
          <input
            data-testid="auth-email"
            className="mt-1 block w-full rounded bg-zinc-900 px-2 py-1.5"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="text-sm text-zinc-300">
          Password
          <input
            data-testid="auth-password"
            className="mt-1 block w-full rounded bg-zinc-900 px-2 py-1.5"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          type="button"
          data-testid="sign-in-button"
          className="mt-1 w-fit rounded bg-blue-700 px-4 py-2 text-sm"
          onClick={() => {
            setFormError('');
            void signInWithEmailPassword(email, password).catch((err: unknown) => {
              setFormError(signInErrorMessage(err));
            });
          }}
        >
          Sign in
        </button>
        {formError ? (
          <p className="text-sm text-red-300" data-testid="auth-form-error">
            {formError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
