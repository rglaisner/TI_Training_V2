'use client';

import Link from 'next/link';

export type CoworkerInformalExchangeLayout = 'banner' | 'aside';

export interface CoworkerInformalExchangeProps {
  /** `aside`: compact strip for mission sidebar; `banner`: full-width in flow. */
  layout?: CoworkerInformalExchangeLayout;
}

/**
 * In-mission affordance for informal peer pulse (immersion plates).
 * Prototype: navigation + copy only; realtime threads wire post-integration.
 */
export function CoworkerInformalExchange({ layout = 'banner' }: CoworkerInformalExchangeProps) {
  const isAside = layout === 'aside';
  return (
    <section
      data-testid="coworker-informal-exchange"
      className={
        isAside
          ? 'rounded-lg border border-cyan-500/20 bg-black/30 p-3 backdrop-blur-sm'
          : 'rounded-lg border border-cyan-500/25 bg-black/40 p-4 backdrop-blur-md md:col-span-2'
      }
    >
      <h3 className={`font-medium text-cyan-100 ${isAside ? 'text-xs' : 'text-sm'}`}>
        Coworkers (optional)
      </h3>
      <p className={`mt-1 leading-relaxed text-zinc-400 ${isAside ? 'text-[11px]' : 'text-xs'}`}>
        {isAside
          ? 'Peer pulse / immersion links — does not replace your formal response below.'
          : 'Step into a peer thread (Slack-style pulse, coffee-corner chat, or async ping) without leaving your mission context. Immersion only here — your formal beat is still the situation + response below. Production can attach transcripts when chat is wired.'}
      </p>
      <div className={`flex flex-wrap gap-2 ${isAside ? 'mt-2' : 'mt-3'}`}>
        <Link
          href="/office/coffee"
          className="rounded-md border border-cyan-700/40 bg-cyan-950/35 px-3 py-1.5 text-xs font-medium text-cyan-100 hover:border-cyan-500/60"
        >
          Coffee corner
        </Link>
        <Link
          href="/office/lounge"
          className="rounded-md border border-cyan-700/40 bg-cyan-950/35 px-3 py-1.5 text-xs font-medium text-cyan-100 hover:border-cyan-500/60"
        >
          Entry hall chat
        </Link>
        <Link
          href="/office/text_exchange"
          className="rounded-md border border-cyan-700/40 bg-cyan-950/35 px-3 py-1.5 text-xs font-medium text-cyan-100 hover:border-cyan-500/60"
        >
          Text exchange
        </Link>
        <Link href="/missions" className="rounded-md px-3 py-1.5 text-xs text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline">
          Back to missions
        </Link>
      </div>
    </section>
  );
}
