import Link from 'next/link';

export default function OfficeLocationNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-4 text-center text-zinc-100">
      <h1 className="text-xl font-semibold">Unknown office location</h1>
      <p className="max-w-md text-sm text-zinc-400">That room is not on the floor plan.</p>
      <Link
        href="/office/hub"
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
      >
        Open office hub
      </Link>
    </div>
  );
}
