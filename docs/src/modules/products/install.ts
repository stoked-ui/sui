/**
 * Shared helpers for product install scripts served from install.stokd.cloud.
 *
 * A product becomes installable when it has an installSourceUrl — the source
 * URL of its install.sh (e.g. a raw.githubusercontent.com link, a release
 * asset, or any https host).
 *
 * install.stokd.cloud/<productId>.sh proxies onto /api/install/<productId>.sh,
 * which pulls the script from installSourceUrl and serves it.
 */

export const SUPPORTED_OS_VALUES = ['macos', 'linux', 'windows'] as const;

export type SupportedOs = (typeof SUPPORTED_OS_VALUES)[number];

export const SUPPORTED_OS_LABELS: Record<SupportedOs, string> = {
  macos: 'macOS',
  linux: 'Linux',
  windows: 'Windows',
};

/**
 * Normalizes the install script source URL. Must be an http(s) URL.
 * Returns null when invalid.
 */
export function normalizeInstallSourceUrl(input: unknown): string | null {
  if (typeof input !== 'string') {
    return null;
  }
  const value = input.trim();
  if (!value) {
    return null;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Filters an arbitrary input down to the known OS values, preserving the
 * canonical SUPPORTED_OS_VALUES order and dropping duplicates.
 */
export function normalizeSupportedOperatingSystems(input: unknown): SupportedOs[] {
  if (!Array.isArray(input)) {
    return [];
  }
  const provided = new Set(
    input.filter((entry): entry is string => typeof entry === 'string').map((entry) => entry.toLowerCase()),
  );
  return SUPPORTED_OS_VALUES.filter((os) => provided.has(os));
}

export function getInstallBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_INSTALL_BASE_URL || 'https://install.stokd.cloud').replace(/\/$/, '');
}

export function getInstallScriptUrl(productId: string): string {
  return `${getInstallBaseUrl()}/${productId}.sh`;
}

export function getInstallCommand(productId: string): string {
  return `curl -fsSL ${getInstallScriptUrl(productId)} | sh`;
}
