import {
  STOKED_UI_VANITY_CDN_ORIGIN,
  STOKED_CONSULTING_CDN_ORIGIN,
  STOKED_CONSULTING_ORIGIN,
  STOKED_CONSULTING_VANITY_CDN_ORIGIN,
  STOKED_CONSULTING_VANITY_ORIGIN,
  STOKED_UI_CDN_ORIGIN,
  STOKED_UI_ORIGIN,
  STOKED_UI_VANITY_ORIGIN,
} from 'docs/src/modules/utils/siteRouting';

export const MANAGED_LOGOUT_ORIGINS = [
  STOKED_UI_ORIGIN,
  STOKED_UI_VANITY_ORIGIN,
  STOKED_CONSULTING_ORIGIN,
  STOKED_CONSULTING_VANITY_ORIGIN,
  STOKED_CONSULTING_CDN_ORIGIN,
  STOKED_UI_CDN_ORIGIN,
  STOKED_CONSULTING_VANITY_CDN_ORIGIN,
  STOKED_UI_VANITY_CDN_ORIGIN,
] as const;

export const MAX_LOGOUT_URL_LENGTH = 2048;

const managedLogoutOrigins = new Set<string>(MANAGED_LOGOUT_ORIGINS);
const MAX_CHAIN_LENGTH = MANAGED_LOGOUT_ORIGINS.length - 1;

function normalizeExactOrigin(value: string) {
  const parsed = new URL(value);
  if (parsed.origin !== value) {
    throw new Error('logout hop must be an exact origin');
  }
  return parsed.origin;
}

export function getLogoutOriginChain(currentOrigin: string) {
  let normalizedCurrent: string;
  try {
    normalizedCurrent = normalizeExactOrigin(currentOrigin);
  } catch {
    return [];
  }

  if (!managedLogoutOrigins.has(normalizedCurrent)) {
    return [];
  }

  return MANAGED_LOGOUT_ORIGINS.filter((origin) => origin !== normalizedCurrent);
}

export function parseLogoutOriginChain(
  currentOrigin: string,
  rawValue: string | string[] | undefined,
) {
  if (!rawValue) {
    return [];
  }
  if (Array.isArray(rawValue)) {
    if (rawValue.length !== 1) {
      throw new Error('logout origin chain must be provided once');
    }
    return parseLogoutOriginChain(currentOrigin, rawValue[0]);
  }
  if (rawValue.length > MAX_LOGOUT_URL_LENGTH) {
    throw new Error('logout origin chain exceeds the length limit');
  }

  const normalizedCurrent = normalizeExactOrigin(currentOrigin);
  if (!managedLogoutOrigins.has(normalizedCurrent)) {
    throw new Error('current logout origin is not managed');
  }

  const chain = rawValue
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (chain.length > MAX_CHAIN_LENGTH) {
    throw new Error('logout origin chain has too many hops');
  }

  const seen = new Set<string>();
  for (const hop of chain) {
    const normalizedHop = normalizeExactOrigin(hop);
    if (!managedLogoutOrigins.has(normalizedHop)) {
      throw new Error('logout hop is not a managed origin');
    }
    if (normalizedHop === normalizedCurrent) {
      throw new Error('logout chain cannot include the current origin');
    }
    if (seen.has(normalizedHop)) {
      throw new Error('logout chain cannot include a duplicate origin');
    }
    seen.add(normalizedHop);
  }

  return chain;
}

export function buildLogoutCascadeUrl(
  targetOrigin: string,
  returnTo: string,
  remainingOrigins: readonly string[],
) {
  const normalizedTarget = normalizeExactOrigin(targetOrigin);
  const normalizedReturnTo = new URL(returnTo, normalizedTarget);
  if (
    normalizedReturnTo.pathname.startsWith('/api/auth/logout') ||
    (normalizedReturnTo.origin !== normalizedTarget &&
      !managedLogoutOrigins.has(normalizedReturnTo.origin))
  ) {
    throw new Error('returnTo must stay on a managed logout origin');
  }

  const chain = parseLogoutOriginChain(
    normalizedTarget,
    remainingOrigins.length > 0 ? remainingOrigins.join(',') : undefined,
  );
  const url = new URL('/api/auth/logout', normalizedTarget);
  url.searchParams.set('returnTo', normalizedReturnTo.toString());
  if (chain.length > 0) {
    url.searchParams.set('nextOrigins', chain.join(','));
  }
  if (url.toString().length > MAX_LOGOUT_URL_LENGTH) {
    throw new Error('logout URL exceeds the length limit');
  }

  return url.toString();
}
