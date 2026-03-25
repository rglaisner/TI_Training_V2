'use client';

import { useEffect, useState } from 'react';

function formatSeconds(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(clamped / 60);
  const ss = clamped % 60;
  return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}

export function TimerModule({ isActive }: { isActive: boolean }) {
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);

  useEffect(() => {
    if (!isActive) return;

    // UX-only placeholder: contract has no timer field today, so this is not authoritative.
    setTimeRemaining(15 * 60);

    const id = window.setInterval(() => {
      setTimeRemaining((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => window.clearInterval(id);
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <p className="mt-2 text-xs text-amber-200/90" data-testid="mission-timer">
      Demo timer (UX only): {formatSeconds(timeRemaining)}
    </p>
  );
}

