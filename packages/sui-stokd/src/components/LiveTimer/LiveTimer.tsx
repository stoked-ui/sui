import { useCallback, useEffect, useState } from 'react';
import { formatDuration } from '../../utils/format';

export interface LiveTimerProps {
  /** ISO timestamp of when the activity started. */
  startTime: string | null | undefined;
  /** Optional fixed duration offset in milliseconds (added to live elapsed). */
  baseMs?: number;
  /** Optional CSS class. */
  className?: string;
  /** Whether to pause the timer updates. Defaults to false. */
  paused?: boolean;
  /** BCP-47 locale for duration formatting. */
  locale?: string;
}

/**
 * A real-time timer that displays elapsed duration from a start time.
 * Updates every second while active (unless paused).
 */
export function LiveTimer({ startTime, baseMs = 0, className, paused = false, locale }: LiveTimerProps) {
  const computeElapsed = useCallback(() => {
    const offset = Number.isFinite(baseMs) && baseMs > 0 ? baseMs : 0;
    if (!startTime) return formatDuration(offset, locale);
    const liveMs = Date.now() - new Date(startTime).getTime();
    return formatDuration(Math.max(0, offset + liveMs), locale);
  }, [baseMs, locale, startTime]);

  const [elapsed, setElapsed] = useState(computeElapsed);

  useEffect(() => {
    const update = () => setElapsed(computeElapsed());
    update();

    if (paused) return;

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [computeElapsed, paused]);

  return <span className={className}>{elapsed}</span>;
}
