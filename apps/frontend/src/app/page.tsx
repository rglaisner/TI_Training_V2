import { PlatformClient } from '../lib/platformClient';

export default function HomePage() {
  // Scaffold-only: render placeholder UI and keep PlatformClient type wiring available.
  void PlatformClient;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">TIC Trainer V2</h1>
      <p className="mt-3 text-zinc-300">
        Scaffold is ready. Next milestone: implement contract-aligned mission APIs and state machine.
      </p>
    </main>
  );
}

