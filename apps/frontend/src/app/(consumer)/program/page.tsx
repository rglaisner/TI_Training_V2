import Link from 'next/link';

export default function ProgramPage() {
  return (
    <div className="max-w-3xl space-y-6 text-zinc-300">
      <div>
        <h1 className="text-2xl font-semibold text-white">Program overview</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Talent Intelligence rehearsal: missions combine branching choices and open-text evaluation against a competency
          catalog — not passive video. Progress and labels come from backend-owned events (prototype shows sample shapes
          only).
        </p>
      </div>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-medium text-zinc-200">Who it is for</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
          <li>TI / people analytics practitioners building judgment under pressure.</li>
          <li>HR and L&D leaders evaluating credible practice + evidence vs. completion-only training.</li>
        </ul>
      </section>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-medium text-zinc-200">Trust & evaluation</h2>
        <p className="mt-2 text-sm">
          The UI never claims a score until the platform confirms it. Voice and partial states stay non-scoring until
          confirmed. See Help for design-authority notes shared with implementers.
        </p>
      </section>
      <p className="text-sm">
        <Link href="/missions" className="text-emerald-400 hover:text-emerald-300">
          Go to missions →
        </Link>
      </p>
    </div>
  );
}
