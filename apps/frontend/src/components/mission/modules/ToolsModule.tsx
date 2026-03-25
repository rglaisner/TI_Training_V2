'use client';

import type { NodeContext } from '@ti-training/shared';

export function ToolsModule({ currentNode, isTerminal }: { currentNode: NodeContext; isTerminal: boolean }) {
  if (isTerminal) return null;

  // Contract-gated: NodeContext currently exposes no `tools` field.
  // If backend/contract extends it later, this UI can render without changing mission logic.
  const maybeTools = (currentNode as unknown as { tools?: unknown }).tools;
  if (!Array.isArray(maybeTools) || maybeTools.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 rounded-lg border border-zinc-800 bg-black/10 p-3" data-testid="tools-module">
      <div className="text-xs font-medium text-zinc-200">Tools</div>
      <p className="mt-1 text-xs text-zinc-400">Tools coming from backend (UI placeholder).</p>
    </div>
  );
}

