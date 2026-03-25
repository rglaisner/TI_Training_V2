'use client';

export interface SocialQueueItem {
  id: string;
  text: string;
  source: 'npc' | 'mentor';
}

export interface SocialModuleProps {
  isSubmitting: boolean;
  isTerminal: boolean;
  mentorUserMessage: string;
  onMentorUserMessageChange: (value: string) => void;
  onInvokeMentor: () => void;
  socialQueue: readonly SocialQueueItem[];
}

export function SocialModule({
  isSubmitting,
  isTerminal,
  mentorUserMessage,
  onMentorUserMessageChange,
  onInvokeMentor,
  socialQueue,
}: SocialModuleProps) {
  return (
    <article data-testid="social-region" className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <h2 className="font-medium text-zinc-200">Mentor</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Optional: add context or a question, then invoke — answers stay short and Socratic.
      </p>
      <textarea
        data-testid="mentor-user-message"
        value={mentorUserMessage}
        onChange={(e) => onMentorUserMessageChange(e.target.value)}
        placeholder="What are you stuck on?"
        className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-200"
        rows={2}
        disabled={isSubmitting || isTerminal}
      />
      <button
        data-testid="mentor-button"
        onClick={onInvokeMentor}
        className="mt-2 rounded-md border border-violet-500/60 bg-violet-950/40 px-3 py-1.5 text-sm text-violet-100 hover:bg-violet-900/50"
        disabled={isSubmitting || isTerminal}
      >
        Invoke mentor
      </button>
      <ul className="mt-3 space-y-2">
        {socialQueue.map((message) => (
          <li
            data-testid="mentor-hint-region"
            key={message.id}
            className="rounded-md border border-zinc-800 bg-black/30 p-2 text-sm text-zinc-300"
          >
            {message.text}
          </li>
        ))}
      </ul>
    </article>
  );
}

