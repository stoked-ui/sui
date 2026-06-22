import type { SessionGroupModel, WorkTypeModel } from '../types';

/**
 * Session grouping + stable card ordering (AX-WEB-STABLE-CARD-ORDER).
 *
 * The DOMAIN-specific decision of which sessions belong to the same request
 * (work-item id, task id, prompt id, …) is the consumer's; it is injected as a
 * `resolve` callback. This library owns only the ordering, which MUST be a pure
 * function of immutable keys so live status/activity updates never reshuffle
 * cards — only a genuinely new request changes the layout.
 */

export interface GroupKeyResolution {
  /** Stable, immutable identity for the request this session belongs to. */
  key: string;
  /** Display title for the group/card. */
  title: string;
  /** Work classification for the group. */
  workType: WorkTypeModel;
}

/** Earliest session start in the group, in ms; 0 when none are known. */
function groupStartedAtMs<S extends { started_at?: string | null }>(sessions: S[]): number {
  const starts = sessions
    .map((s) => (s.started_at ? new Date(s.started_at).getTime() : NaN))
    .filter((n) => Number.isFinite(n)) as number[];
  return starts.length ? Math.min(...starts) : 0;
}

/**
 * Stable comparator: newest group start first, group key as the tiebreak.
 * Keyed SOLELY on immutable values — never on display status, activity
 * timestamps, engagement, or work-type promotions (AX-WEB-STABLE-CARD-ORDER).
 */
export function compareSessionGroups<S extends { started_at?: string | null }>(
  a: SessionGroupModel<S>,
  b: SessionGroupModel<S>,
): number {
  const aStart = groupStartedAtMs(a.sessions);
  const bStart = groupStartedAtMs(b.sessions);
  if (aStart !== bStart) return bStart - aStart; // newest first
  return a.key.localeCompare(b.key);
}

/**
 * Group sessions into request cards and return them in stable display order.
 * `resolve` supplies the immutable group key, title, and work type per session.
 */
export function groupSessionsByRequest<S extends { started_at?: string | null }>(
  sessions: S[],
  resolve: (session: S) => GroupKeyResolution,
): SessionGroupModel<S>[] {
  const groups = new Map<string, SessionGroupModel<S>>();
  for (const session of sessions) {
    const { key, title, workType } = resolve(session);
    const existing = groups.get(key);
    if (existing) {
      existing.sessions.push(session);
    } else {
      groups.set(key, { key, title, sessions: [session], workType });
    }
  }
  return Array.from(groups.values()).sort(compareSessionGroups);
}
