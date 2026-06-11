import {
  CONSULTING_APP_SEGMENTS,
  CONSULTING_PUBLIC_PRODUCT_IDS,
  STOKED_UI_PRODUCT_IDS,
} from './siteRouteManifest';

export type PublicSite = 'stoked-ui' | 'consulting';

export const STOKED_UI_ORIGIN = 'https://sui.stokd.cloud';
export const STOKED_CONSULTING_ORIGIN = 'https://consulting.stokd.cloud';
export const STOKED_CONSULTING_CDN_ORIGIN = 'https://cdn.stokd.cloud';

const stokedUiProductIds = new Set(STOKED_UI_PRODUCT_IDS);
const consultingPublicProductIds = new Set(CONSULTING_PUBLIC_PRODUCT_IDS);
const consultingAppSegments = new Set(CONSULTING_APP_SEGMENTS);

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

function shouldUseAbsolutePublicDomains() {
  const hostname = getRuntimeHostname();
  return hostname === 'sui.stokd.cloud'
    || hostname === 'www.sui.stokd.cloud'
    || hostname === 'consulting.stokd.cloud'
    || hostname === 'www.consulting.stokd.cloud'
    || hostname === 'cdn.stokd.cloud';
}

export function buildCdnOrigin(origin: string) {
  const url = new URL(origin);
  return `${url.protocol}//cdn.stokd.cloud`;
}

export function originForSite(site: PublicSite) {
  return site === 'consulting' ? STOKED_CONSULTING_ORIGIN : STOKED_UI_ORIGIN;
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
  const siteOrigin = originForSite(site);
  
  if (typeof window !== 'undefined' && window.location.origin.toLowerCase() === siteOrigin.toLowerCase()) {
    return publicPath;
  }

  return `${siteOrigin}${publicPath}`;
}

export function isConsultingAppPath(path: string) {
  const normalized = normalizePath(path);
  const segment = normalized.replace(/^\/+/, '').split('/')[0] || '';
  return consultingAppSegments.has(segment);
}
