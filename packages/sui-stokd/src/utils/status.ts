import type { DisplayStatusModel, StatusKind } from '../types';

/**
 * Display-status helpers for the Stokd UX components, ported from the platform's
 * shared session-display utilities so @stoked-ui/stokd stays self-contained.
 * These operate on already-resolved DisplayStatusModel values (the consumer
 * resolves a raw session into a display status with its own resolver).
 */

/** Engaged = the agent is actively doing work (not idle/stopped/awaiting input). */
export function isEngagedDisplayStatus(status: DisplayStatusModel): boolean {
  return status === 'working' || status === 'validating' || status === 'analyzing';
}

/** Most-engaged-first precedence used to pick a group's representative status. */
export const GROUP_STATUS_ORDER: DisplayStatusModel[] = [
  'working',
  'validating',
  'analyzing',
  'prompting',
  'needs-input',
  'idle',
  'stopped',
];

/** Pick the most engaged status across a group's sessions. */
export function pickGroupDisplayStatus(statuses: DisplayStatusModel[]): DisplayStatusModel {
  return GROUP_STATUS_ORDER.find((candidate) => statuses.includes(candidate)) ?? 'stopped';
}

/** Human label for a display status. */
export function displayStatusLabel(status: DisplayStatusModel): string {
  switch (status) {
    case 'working':
      return 'Working';
    case 'validating':
      return 'Validating';
    case 'analyzing':
      return 'Analyzing';
    case 'prompting':
      return 'Typing…';
    case 'needs-input':
      return 'Your turn';
    case 'idle':
      return 'Idle';
    default:
      return 'Stopped';
  }
}

/** Map a display status to a semantic badge kind. */
export function displayStatusKind(status: DisplayStatusModel): StatusKind {
  if (status === 'working') return 'success';
  if (status === 'validating' || status === 'analyzing') return 'info';
  if (status === 'prompting' || status === 'needs-input') return 'warning';
  return 'neutral';
}

const GENERIC_SESSION_TITLES = new Set([
  'working',
  'agent working',
  'listening',
  'claude session',
  'codex session',
  'gemini session',
  'grok session',
  'claude-code session',
  'codex-cli session',
  'gemini-cli session',
  'interactive session',
  'interactive claude session',
  'interactive codex session',
  'interactive gemini session',
  'interactive grok session',
  'unmanaged claude session',
  'unmanaged codex session',
  'unmanaged gemini session',
]);

/** True when a string is a generic wrapper label that carries no information. */
export function isGenericSessionTitle(value?: string | null): boolean {
  const normalized = value?.replace(/\s+/g, ' ').trim().toLowerCase();
  return normalized ? GENERIC_SESSION_TITLES.has(normalized) : false;
}
