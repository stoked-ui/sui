import {
  CONSULTING_APP_SEGMENTS,
  CONSULTING_PUBLIC_PRODUCT_IDS,
  STOKED_UI_PRODUCT_IDS,
} from './siteRouteManifest';

export type PublicSite = 'stoked-ui' | 'consulting';

export const STOKED_UI_ORIGIN = 'https://sui.stokd.cloud';
export const STOKED_UI_VANITY_ORIGIN = 'https://stoked-ui.com';
export const STOKED_CONSULTING_ORIGIN = 'https://consulting.stokd.cloud';
export const STOKED_CONSULTING_VANITY_ORIGIN = 'https://stokedconsulting.com';
export const STOKED_CONSULTING_CDN_ORIGIN = 'https://cdn.stokd.cloud';
export const STOKED_UI_CDN_ORIGIN = 'https://cdn-sui.stokd.cloud';
export const LEGACY_STOKED_CONSULTING_CDN_ORIGIN = 'https://cdn.consulting.stokd.cloud';
export const STOKED_CONSULTING_VANITY_CDN_ORIGIN = 'https://cdn.stokedconsulting.com';
export const STOKED_UI_VANITY_CDN_ORIGIN = 'https://cdn-sui.stokedconsulting.com';

export const PUBLIC_SITE_FAMILIES = [
  {
    'stoked-ui': STOKED_UI_ORIGIN,
    consulting: STOKED_CONSULTING_ORIGIN,
  },
  {
    'stoked-ui': STOKED_UI_VANITY_ORIGIN,
    consulting: STOKED_CONSULTING_VANITY_ORIGIN,
  },
] as const;

export const OWNED_PUBLIC_ORIGINS = [
  STOKED_UI_ORIGIN,
  'https://www.sui.stokd.cloud',
  STOKED_UI_VANITY_ORIGIN,
  'https://www.stoked-ui.com',
  STOKED_CONSULTING_ORIGIN,
  'https://www.consulting.stokd.cloud',
  STOKED_CONSULTING_VANITY_ORIGIN,
  'https://www.stokedconsulting.com',
  STOKED_CONSULTING_CDN_ORIGIN,
  STOKED_UI_CDN_ORIGIN,
  LEGACY_STOKED_CONSULTING_CDN_ORIGIN,
  STOKED_CONSULTING_VANITY_CDN_ORIGIN,
  STOKED_UI_VANITY_CDN_ORIGIN,
] as const;

const stokedUiProductIds = new Set(STOKED_UI_PRODUCT_IDS);
const consultingPublicProductIds = new Set(CONSULTING_PUBLIC_PRODUCT_IDS);
const consultingAppSegments = new Set(CONSULTING_APP_SEGMENTS);
const ownedPublicHostnames = new Set(
  OWNED_PUBLIC_ORIGINS.map((origin) => new URL(origin).hostname),
);

function normalizePath(path: string) {
  if (!path) {return '/';}
  if (/^https?:\/\//i.test(path)) {return path;}
  return path.startsWith('/') ? path : `/${path}`;
}

function getRuntimeHostname() {
  if (typeof window !== 'undefined') {
    return window.location.hostname.toLowerCase();
  }
  return process.env.NODE_ENV === 'production' ? 'sui.stokd.cloud' : 'localhost';
}

function normalizePublicHostname(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, '');
}

function getSiteFamily(hostname: string) {
  const normalized = normalizePublicHostname(hostname);
  return PUBLIC_SITE_FAMILIES.find((family) =>
    Object.values(family).some((origin) => new URL(origin).hostname === normalized),
  );
}

function shouldUseAbsolutePublicDomains() {
  const hostname = getRuntimeHostname();
  return Boolean(getSiteFamily(hostname)) || ownedPublicHostnames.has(hostname);
}

export function buildCdnOrigin(origin: string) {
  const url = new URL(origin);
  const family = getSiteFamily(url.hostname);
  return family === PUBLIC_SITE_FAMILIES[1]
    ? STOKED_CONSULTING_VANITY_CDN_ORIGIN
    : STOKED_CONSULTING_CDN_ORIGIN;
}

export function originForSite(site: PublicSite, hostname = getRuntimeHostname()) {
  const family = getSiteFamily(hostname) ?? PUBLIC_SITE_FAMILIES[0];
  return family[site];
}

export function inferSiteForProductId(productId?: string): PublicSite {
  if (productId && stokedUiProductIds.has(productId)) {
    return 'stoked-ui';
  }
  return 'consulting';
}

export function isConsultingPublicProductId(productId?: string) {
  return Boolean(productId && consultingPublicProductIds.has(productId));
}

export function normalizePublicProductUrl(productId: string, url?: string) {
  const trimmed = typeof url === 'string' ? url.trim() : '';

  if (trimmed && /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Strip internal /consulting prefix — public URL is always /products/...
  if (trimmed.startsWith('/consulting/products/')) {
    return trimmed.replace(/^\/consulting/, '');
  }

  if (trimmed.startsWith('/products/')) {
    return trimmed;
  }

  return `/products/${productId}`;
}

export function toConsultingPublicPath(path: string) {
  const normalized = normalizePath(path);
  if (/^https?:\/\//i.test(normalized)) {return normalized;}
  if (normalized === '/consulting' || normalized === '/consulting/') {
    return '/';
  }
  return normalized.replace(/^\/consulting(?=\/|$)/, '') || '/';
}

export function toConsultingInternalPath(path: string) {
  const normalized = normalizePath(path);
  if (/^https?:\/\//i.test(normalized)) {return normalized;}
  if (normalized === '/' || normalized === '') {
    return '/consulting/';
  }
  if (normalized === '/consulting' || normalized === '/consulting/') {
    return '/consulting/';
  }
  if (normalized.startsWith('/consulting/')) {
    return normalized;
  }
  // Paths without /consulting/ prefix are public-facing pages on the consulting site.
  // All consulting app routes are already passed with /consulting/ at call sites.
  return normalized;
}

export function toAbsoluteSitePath(site: PublicSite, path: string) {
  const normalized = normalizePath(path);
  if (/^https?:\/\//i.test(normalized)) {return normalized;}
  
  const isConsulting = site === 'consulting';
  const internalPath = isConsulting ? toConsultingInternalPath(normalized) : normalized;

  if (!shouldUseAbsolutePublicDomains()) {
    return internalPath;
  }

  const publicPath = isConsulting ? toConsultingPublicPath(normalized) : normalized;
  const runtimeHostname = getRuntimeHostname();
  const siteOrigin = originForSite(site, runtimeHostname);
  const targetHostname = new URL(siteOrigin).hostname;
  
  if (normalizePublicHostname(runtimeHostname) === targetHostname) {
    return publicPath;
  }

  return `${siteOrigin}${publicPath}`;
}

export function isConsultingAppPath(path: string) {
  const normalized = normalizePath(path);
  const segment = normalized.replace(/^\/+/, '').split('/')[0] || '';
  return consultingAppSegments.has(segment);
}
