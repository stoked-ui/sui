export type PublicSite = 'stoked-ui' | 'consulting';

export const STOKED_UI_ORIGIN = 'https://stoked-ui.com';
export const STOKED_CONSULTING_ORIGIN = 'https://stokedconsulting.com';
export const STOKED_CONSULTING_CDN_ORIGIN = buildCdnOrigin(STOKED_CONSULTING_ORIGIN);

const STOKED_UI_PRODUCT_IDS = new Set([
  'stoked-ui',
  'file-explorer',
  'media',
  'common',
  'media-api',
  'media-selector',
  'timeline',
  'editor',
]);

const CONSULTING_PUBLIC_PRODUCT_IDS = new Set([
  'flux',
  'focus-capture',
  'mac-mixer',
  'always-listening',
  'stokd-cloud',
]);

const CONSULTING_APP_SEGMENTS = new Set([
  '',
  'admin',
  'ai',
  'api-docs',
  'back-end',
  'billing',
  'clients',
  'customer',
  'deliverables',
  'devops',
  'front-end',
  'groupies',
  'home',
  'invoices',
  'licenses',
  'login',
  'partners',
  'settings',
  'users',
]);

function normalizePath(path: string) {
  if (!path) return '/';
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith('/') ? path : `/${path}`;
}

function getRuntimeHostname() {
  if (typeof window !== 'undefined') {
    return window.location.hostname.toLowerCase();
  }
  return process.env.NODE_ENV === 'production' ? 'stoked-ui.com' : 'localhost';
}

function shouldUseAbsolutePublicDomains() {
  const hostname = getRuntimeHostname();
  return hostname === 'stoked-ui.com'
    || hostname === 'www.stoked-ui.com'
    || hostname === 'stokedconsulting.com'
    || hostname === 'www.stokedconsulting.com'
    || hostname === 'cdn.stokedconsulting.com';
}

export function buildCdnOrigin(origin: string) {
  const url = new URL(origin);
  return `${url.protocol}//cdn.${url.host}`;
}

export function originForSite(site: PublicSite) {
  return site === 'consulting' ? STOKED_CONSULTING_ORIGIN : STOKED_UI_ORIGIN;
}

export function inferSiteForProductId(productId?: string): PublicSite {
  if (productId && STOKED_UI_PRODUCT_IDS.has(productId)) {
    return 'stoked-ui';
  }
  return 'consulting';
}

export function isConsultingPublicProductId(productId?: string) {
  return Boolean(productId && CONSULTING_PUBLIC_PRODUCT_IDS.has(productId));
}

export function normalizePublicProductUrl(productId: string, url?: string) {
  const trimmed = typeof url === 'string' ? url.trim() : '';

  if (trimmed && /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/products/')) {
    return trimmed;
  }

  return `/products/${productId}`;
}

export function toConsultingPublicPath(path: string) {
  const normalized = normalizePath(path);
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized === '/consulting' || normalized === '/consulting/') {
    return '/';
  }
  return normalized.replace(/^\/consulting(?=\/|$)/, '') || '/';
}

export function toConsultingInternalPath(path: string) {
  const normalized = normalizePath(path);
  if (/^https?:\/\//i.test(normalized)) return normalized;
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
  if (/^https?:\/\//i.test(normalized)) return normalized;
  
  const isConsulting = site === 'consulting';
  const internalPath = isConsulting ? toConsultingInternalPath(normalized) : normalized;

  if (!shouldUseAbsolutePublicDomains()) {
    return internalPath;
  }

  const publicPath = isConsulting ? toConsultingPublicPath(normalized) : normalized;
  const siteOrigin = originForSite(site);
  
  if (typeof window !== 'undefined' && window.location.origin.toLowerCase() === siteOrigin.toLowerCase()) {
    return internalPath;
  }

  return `${siteOrigin}${publicPath}`;
}

export function isConsultingAppPath(path: string) {
  const normalized = normalizePath(path);
  const segment = normalized.replace(/^\/+/, '').split('/')[0] || '';
  return CONSULTING_APP_SEGMENTS.has(segment);
}
