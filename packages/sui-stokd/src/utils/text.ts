import { isGenericSessionTitle } from './status';

/** Tool-name display overrides (raw tool id → friendly label). */
const TOOL_NAME_OVERRIDES: Record<string, string> = {
  run_shell_command: 'Bash',
  read_file: 'Read',
  write_file: 'Write',
  edit_file: 'Edit',
  list_directory: 'List',
  search_files: 'Search',
  grep_search: 'Grep',
  glob_search: 'Glob',
  search_query: 'Web Search',
};

/**
 * Single-line trimmed text, collapsed whitespace, truncated with an ellipsis.
 * Returns undefined for empty input and for the generic "Interactive <provider>
 * session" wrapper label (which carries no information).
 */
export function trimText(text?: string | null, maxLen = 140): string | undefined {
  if (!text || typeof text !== 'string') return undefined;
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return undefined;
  if (/^interactive (claude|codex|gemini|grok) session$/i.test(normalized)) return undefined;
  return normalized.length <= maxLen ? normalized : `${normalized.slice(0, maxLen - 3)}...`;
}

/**
 * Full-fidelity message body: preserves internal whitespace/newlines and never
 * truncates — conversation messages are the chat content itself.
 */
export function fullText(text?: string | null): string | undefined {
  if (!text || typeof text !== 'string') return undefined;
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Friendly tool label (applies overrides, else title-cases the id). */
export function formatToolName(tool?: string): string {
  if (!tool) return 'Activity';
  const normalized = tool.trim().toLowerCase();
  return (
    TOOL_NAME_OVERRIDES[normalized] ??
    tool
      .trim()
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/** "<first> +N more" summary for a list of affected files. */
export function summarizeFiles(filesAffected?: string[]): string | undefined {
  if (!Array.isArray(filesAffected) || filesAffected.length === 0) return undefined;
  if (filesAffected.length === 1) return filesAffected[0];
  return `${filesAffected[0]} +${filesAffected.length - 1} more`;
}

/**
 * Action text suitable for a Tool bubble: a trimmed activity string that is not
 * a generic wrapper label, which must never surface.
 */
export function meaningfulActionText(text?: string | null, maxLen = 220): string | undefined {
  const trimmed = trimText(text, maxLen);
  if (!trimmed) return undefined;
  return isGenericSessionTitle(trimmed) ? undefined : trimmed;
}

/** Whitespace/case-insensitive equality used to suppress title-echo prompts. */
export function sameAsTitle(text: string, title: string): boolean {
  const norm = (value: string) => value.replace(/\s+/g, ' ').trim().toLowerCase();
  return norm(text) === norm(title);
}

/**
 * True when a prompt is one of the internal stokd governance/continuation
 * prompts that should never surface as user-facing conversation content.
 */
export function isInternalStokdPrompt(text?: string | null): boolean {
  if (!text || typeof text !== 'string') return false;
  const normalized = text.replace(/\s+/g, ' ').trim().toLowerCase();
  if (!normalized) return false;
  return (
    normalized.includes('you are continuing the same stokd interactive chat after it was promoted into a real task') ||
    normalized.includes('you are a senior software engineer executing a sanctioned stokd task implementation') ||
    normalized.includes('do not run `stokd governance sanction`') ||
    normalized.includes('do not create another nested workflow or another worktree') ||
    normalized.includes('task worktree: /opt/worktrees/')
  );
}

/** "+m:ss" elapsed label between a start time and an event timestamp. */
export function formatElapsedLabel(startedAt?: string, timestamp?: string): string | undefined {
  if (!startedAt || !timestamp) return undefined;
  const startMs = new Date(startedAt).getTime();
  const eventMs = new Date(timestamp).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(eventMs)) return undefined;
  const deltaMs = Math.max(0, eventMs - startMs);
  const totalSeconds = Math.floor(deltaMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `+${minutes}:${String(seconds).padStart(2, '0')}`;
}
