'use client';

/**
 * Placeholder shell for realtime chat/voice (e.g. WebRTC provider).
 * Wire your transport behind this layout without changing the office chrome.
 */
export default function ChatStagePlaceholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex h-full min-h-[320px] flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>
        <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
      </header>
      <div
        className="flex flex-1 flex-col gap-3 p-4"
        data-testid="chat-stage-placeholder"
        aria-label="Chat placeholder"
      >
        <div
          className="min-h-[200px] flex-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-500"
          data-testid="chat-transcript-placeholder"
        >
          <p>Transcript will appear here when chat or voice is connected.</p>
        </div>
        <label className="sr-only" htmlFor="chat-placeholder-input">
          Message
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <textarea
            id="chat-placeholder-input"
            data-testid="chat-composer-placeholder"
            rows={2}
            disabled
            placeholder="Composer disabled — integrate realtime provider"
            className="w-full rounded-md border border-zinc-700 bg-zinc-950/80 p-2 text-sm text-zinc-400"
          />
          <button
            type="button"
            disabled
            className="shrink-0 rounded-md bg-emerald-800/40 px-4 py-2 text-sm font-medium text-zinc-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
