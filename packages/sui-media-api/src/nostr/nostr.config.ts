/**
 * Nostr integration configuration.
 *
 * All values are read from environment variables. Defaults are safe for
 * a development environment where no Nostr relays are configured.
 *
 * Environment variables:
 *   NOSTR_RELAYS        Comma-separated list of WebSocket relay URLs.
 *                       Example: wss://relay.damus.io,wss://nos.lol
 *   NOSTR_NPUBS         Comma-separated list of npub keys to follow.
 *                       Example: npub1abc...,npub1xyz...
 *   NOSTR_POLL_INTERVAL Minutes between relay polls (default: 15).
 *   NOSTR_TARGET_SITES  Comma-separated target sites for imported posts
 *                       (default: stoked-ui.com,brian.stoker.work).
 */

export const NOSTR_CONFIG = {
  /** Environment variable names */
  ENV: {
    RELAYS: 'NOSTR_RELAYS',
    NPUBS: 'NOSTR_NPUBS',
    POLL_INTERVAL: 'NOSTR_POLL_INTERVAL',
    TARGET_SITES: 'NOSTR_TARGET_SITES',
  },

  /** Default values used when the env var is absent or empty */
  DEFAULTS: {
    RELAYS: [] as string[],
    NPUBS: [] as string[],
    POLL_INTERVAL_MINUTES: 15,
    TARGET_SITES: ['stoked-ui.com', 'brian.stoker.work'],
  },

  /** Nostr event kind for NIP-23 long-form content */
  LONG_FORM_KIND: 30023,
} as const;

/**
 * Parse a comma-separated string into a trimmed, non-empty string array.
 */
export function parseCommaSeparated(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
