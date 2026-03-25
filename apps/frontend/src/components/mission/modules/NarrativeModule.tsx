'use client';

export function NarrativeModule({ sceneText }: { sceneText: string }) {
  return (
    <article data-testid="narrative-region" className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 md:col-span-2">
      <h2 className="font-medium text-zinc-200">Situation</h2>
      <p data-testid="scene-text" className="mt-3 whitespace-pre-line leading-relaxed text-zinc-300">
        {sceneText}
      </p>
    </article>
  );
}

