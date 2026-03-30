import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="max-w-3xl space-y-8 text-zinc-300">
      <div>
        <h1 className="text-2xl font-semibold text-white">Help</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Trust boundaries, navigation, and links to internal design references for your implementation team.
        </p>
      </div>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-medium text-zinc-200">Office plates & scenarios</h2>
        <p className="mt-2 text-sm">
          Backgrounds map to narrative moments (mentor chat, coworker chat, board readout, etc.) per SCENARIOS.md. They
          support immersion; mission logic and scoring stay on the desk / missions HUD unless you wire otherwise.
        </p>
      </section>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-medium text-zinc-200">For implementers</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
          <li>
            <Link href="/experience" className="text-violet-300 hover:text-violet-200">
              Experience lab — microcopy, ambience, UI variation contracts
            </Link>
          </li>
          <li>
            <Link href="/learn/tokens" className="text-cyan-300 hover:text-cyan-200">
              Design tokens walkthrough
            </Link>
          </li>
        </ul>
      </section>
      <p className="text-xs text-zinc-500">
        Support contact and policy links are placeholders in this prototype — add your tenant-specific channels when
        integrating.
      </p>
    </div>
  );
}
