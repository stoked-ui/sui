const DEFAULT_DELIVERABLES_CDN_BASE_URL = 'https://cdn.stokd.cloud';

export const LEGACY_DELIVERABLE_ORIGINS = [
  'https://cdn.consulting.stokd.cloud',
];

function resolveCdnBaseUrl() {
  return (
    process.env.DELIVERABLES_CDN_BASE_URL
    || process.env.CDN_PUBLIC_BASE_URL
    || process.env.BLOG_IMAGE_CDN_URL
    || DEFAULT_DELIVERABLES_CDN_BASE_URL
  );
}

export function isLocalDevOrigin(origin: string) {
  return /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(origin);
}

export function getAllowedDeliverableOrigins() {
  const origins = new Set<string>();

  try {
    origins.add(new URL(resolveCdnBaseUrl()).origin);
  } catch {
    // Fall back to the hard-coded default if the env value is malformed.
    origins.add(new URL(DEFAULT_DELIVERABLES_CDN_BASE_URL).origin);
  }

  const extra = process.env.DELIVERABLES_ALLOWED_ORIGINS;
  if (extra) {
    for (const raw of extra.split(',')) {
      const trimmed = raw.trim();
      if (trimmed) {
        try {
          origins.add(new URL(trimmed).origin);
        } catch {
          // Skip malformed entries silently.
        }
      }
    }
  }

  for (const legacy of LEGACY_DELIVERABLE_ORIGINS) {
    origins.add(legacy);
  }

  return origins;
}

export function isAllowedDeliverableOrigin(origin: string) {
  if (getAllowedDeliverableOrigins().has(origin)) {
    return true;
  }

  return process.env.NODE_ENV !== 'production' && isLocalDevOrigin(origin);
}
