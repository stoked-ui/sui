import { OWNED_PUBLIC_ORIGINS } from '../utils/siteRouting';

export function getAllowedTransferOrigins() {
  const origins = new Set<string>(OWNED_PUBLIC_ORIGINS);

  for (const rawOrigin of (process.env.AUTH_PUBLIC_ORIGINS || '').split(',')) {
    const value = rawOrigin.trim();
    if (!value) {
      continue;
    }

    try {
      const url = new URL(value);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        origins.add(url.origin);
      }
    } catch {
      // Ignore malformed optional origins.
    }
  }

  return origins;
}

export function isAllowedTransferOrigin(origin: string) {
  if (!origin) {
    return false;
  }

  if (/^http:\/\/localhost:\d+$/i.test(origin)) {
    return true;
  }

  return getAllowedTransferOrigins().has(origin);
}
