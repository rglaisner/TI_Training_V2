import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-emerald-950/25 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-emerald-400/90">TI Training & certification</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Executive-style missions with evidence-backed progress
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-400">
          Practice TI judgment under pressure. Outcomes and certification signals come from structured evaluation and an
          append-only event stream — not a chatbot guessing your score.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/home"
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
            data-testid="landing-enter-app"
          >
            Enter app (prototype)
          </Link>
          <Link
            href="/program"
            className="rounded-lg border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:border-zinc-500 hover:bg-zinc-900/60"
          >
            Program overview
          </Link>
          <Link
            href="/office/hub"
            className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-900/80"
          >
            Immersive office map
          </Link>
        </div>
        <p className="mt-8 text-xs text-zinc-500">
          Current build: UI prototype uses demo sign-in and mock data — no production Firebase or PlatformClient on
          consumer routes. HR reviewers: start with Program, then Home.
        </p>
      </div>
    </div>
  );
}
