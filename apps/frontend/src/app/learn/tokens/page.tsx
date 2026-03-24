import Link from 'next/link';

/**
 * Educational page mapping V2_DESIGN_SYSTEM_TOKENS_AND_LAYOUT_RULES to concrete UI semantics.
 */
export default function DesignTokensPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-400">Learn</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Design tokens & HUD discipline</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          Tokens here are <strong className="font-medium text-zinc-200">semantic</strong>: they describe intent, not a
          single hex value. Implementation maps them to Tailwind / CSS — see{' '}
          <code className="rounded bg-zinc-900 px-1 text-cyan-200">V2_DESIGN_SYSTEM_TOKENS_AND_LAYOUT_RULES.md</code>{' '}
          in the program repo.
        </p>
        <nav className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/experience" className="text-cyan-400 hover:text-cyan-300">
            Experience lab
          </Link>
          <span className="text-zinc-600">·</span>
          <Link href="/tracker" className="text-cyan-400 hover:text-cyan-300">
            Tracker
          </Link>
          <span className="text-zinc-600">·</span>
          <Link href="/office/desk" className="text-cyan-400 hover:text-cyan-300">
            Desk
          </Link>
        </nav>

        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Color semantics (sample mapping)</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="h-12 w-12 shrink-0 rounded-lg bg-amber-500/90 shadow-inner shadow-amber-900/50" />
              <div>
                <p className="font-mono text-xs text-amber-200">Color.Status.Waiting</p>
                <p className="text-sm text-zinc-400">You are expected to act.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="h-12 w-12 shrink-0 rounded-lg bg-violet-600/90 shadow-inner shadow-violet-950/50" />
              <div>
                <p className="font-mono text-xs text-violet-200">Color.Status.Evaluating</p>
                <p className="text-sm text-zinc-400">Backend work in flight — hold.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="h-12 w-12 shrink-0 rounded-lg bg-emerald-600/90 shadow-inner shadow-emerald-950/50" />
              <div>
                <p className="font-mono text-xs text-emerald-200">Color.Status.Success</p>
                <p className="text-sm text-zinc-400">Decision accepted (non-terminal).</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="h-12 w-12 shrink-0 rounded-lg bg-red-600/85 shadow-inner shadow-red-950/50" />
              <div>
                <p className="font-mono text-xs text-red-200">Color.Status.Error</p>
                <p className="text-sm text-zinc-400">Failed evaluation path — retry when allowed.</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Rule: NPC flavor never reuses error colors — keeps trust boundaries obvious (see credibility constraints
            doc).
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">HUD regions (non-negotiable)</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-zinc-300">
            <li>
              <strong className="text-zinc-100">Narrative</strong> — primary scene text from{' '}
              <code className="text-cyan-300">currentNode</code>.
            </li>
            <li>
              <strong className="text-zinc-100">Input</strong> — branching, open text, or voice entry.
            </li>
            <li>
              <strong className="text-zinc-100">Social</strong> — mentor / crowd queue.
            </li>
            <li>
              <strong className="text-zinc-100">Tools / status</strong> — evaluation state, mentor controls.
            </li>
            <li>
              <strong className="text-zinc-100">Terminal / dossier</strong> — only when{' '}
              <code className="text-cyan-300">isTerminal</code> is true.
            </li>
          </ol>
        </section>

        <section className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="text-sm font-medium text-zinc-200">Spacing rhythm</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Use a single spacing unit (1×) for line gaps, then 2× for panel padding and 3× for section breaks. Keeps the
            “mission control” density consistent across office plates and desk mode.
          </p>
          <div className="mt-4 flex items-end gap-2">
            <div className="h-4 w-2 rounded bg-zinc-600" title="1×" />
            <div className="h-8 w-2 rounded bg-zinc-500" title="2×" />
            <div className="h-12 w-2 rounded bg-zinc-400" title="3×" />
          </div>
        </section>
      </div>
    </div>
  );
}
