import Link from 'next/link';

/**
 * In-app surface for design-authority contracts: microcopy, ambience, UI variation.
 * Mirrors Pre_Build Documents/02_Contracts/06_Design_Authority/*.md — no backend coupling.
 */
export default function ExperienceLabPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-violet-400">Experience lab</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">How the crew agreed you should feel this</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          These panels are the live, user-facing echo of the V2 design contracts. They do not change mission logic —
          they explain tone, ambience rules, and where the UI is allowed to vary without breaking evaluation or voice
          boundaries.
        </p>
        <nav className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/office/hub" className="text-emerald-400 hover:text-emerald-300">
            Office hub
          </Link>
          <span className="text-zinc-600">·</span>
          <Link href="/learn/tokens" className="text-emerald-400 hover:text-emerald-300">
            Design tokens
          </Link>
          <span className="text-zinc-600">·</span>
          <Link href="/progress" className="text-emerald-400 hover:text-emerald-300">
            Progress
          </Link>
        </nav>

        <section className="mt-12 space-y-6">
          <article className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-6">
            <h2 className="text-lg font-medium text-amber-100">V2_MICROCOPY_AND_TONE_GUIDE — acceptance notes</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              <strong className="text-zinc-200">Status copy</strong> stays calm and precise: you always know whether
              you are waiting, submitting, or finished. <strong className="text-zinc-200">NPC / social lines</strong>{' '}
              may be colorful, but they never impersonate system authority or pretend a score exists before the backend
              says so.
            </p>
            <p className="mt-3 rounded-lg border border-amber-900/30 bg-amber-950/20 p-3 font-mono text-xs text-amber-200/90">
              Example tone: “Hold — evaluation in progress” (system) vs “They lean in; the room goes quiet” (scene).
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-lg font-medium text-sky-100">V2_SCENARIO_AMBIENCE_AND_MOOD_SPEC — in the glass</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              Ambience is layered: lighting, grain, and motion support the scenario without stealing focus from the HUD
              regions. Mood shifts follow <em>node transitions</em> from <code className="text-sky-300">MissionState</code>
              , not client-side guesses.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-400">
              <li>Pressure cues intensify on surprise beats — never on partial voice transcript.</li>
              <li>Terminal / dossier moments get a distinct, quieter palette (success without fireworks).</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-emerald-900/40 bg-emerald-950/15 p-6">
            <h2 className="text-lg font-medium text-emerald-100">V2_UI_VARIATION_CONTRACT — skins vs semantics</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              <strong className="text-emerald-200">Skins</strong> (color, type, motion) and{' '}
              <strong className="text-emerald-200">frames</strong> (panel layout within the HUD skeleton) may change.
              What cannot change: when the client calls the API, how idempotency keys are used, and treating partial
              voice as non-scoring state.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-800/40 bg-black/30 p-4">
                <p className="font-mono text-xs text-emerald-400/80">Allowed</p>
                <p className="mt-2 text-sm text-zinc-300">Narrative framing, social-queue animation, ambience overlay.</p>
              </div>
              <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-4">
                <p className="font-mono text-xs text-red-300/90">Forbidden</p>
                <p className="mt-2 text-sm text-zinc-300">
                  Auto-submit tricks, fake “evaluated” UI on unconfirmed voice, duplicate submission paths.
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
