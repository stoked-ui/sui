export const cdnName = import.meta.env.VITE_CDN_NAME || 'Stoked CDN';
export const publicBaseUrl =
  import.meta.env.VITE_CDN_PUBLIC_BASE_URL || 'https://cdn.stokedconsulting.com';
export const authSessionEndpoint =
  import.meta.env.VITE_CDN_AUTH_SESSION_URL || '/api/auth/session';
const localAuthOrigin =
  import.meta.env.VITE_LOCAL_AUTH_ORIGIN || 'http://localhost:5199';

const stokedUiOrigin = import.meta.env.VITE_STOKED_UI_ORIGIN || 'https://stoked-ui.com';
const consultingOrigin =
  import.meta.env.VITE_STOKED_CONSULTING_ORIGIN || 'https://stokedconsulting.com';

function getDefaultContentsEndpoint() {
  return '/api/cdn/contents/';
}

export const contentsEndpoint =
  import.meta.env.VITE_CDN_CONTENTS_URL || getDefaultContentsEndpoint();

function isLocalHostname(hostname) {
  return hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '::1'
    || hostname === '[::1]';
}

export function getAuthOrigins() {
  if (typeof window === 'undefined') {
    return [consultingOrigin, stokedUiOrigin];
  }

  if (isLocalHostname(window.location.hostname)) {
    return [localAuthOrigin];
  }

  return [consultingOrigin, stokedUiOrigin].filter((origin) => origin !== window.location.origin);
}

export function formatAuthOriginLabel(origin) {
  if (origin === localAuthOrigin) {
    return 'localhost';
  }

  return new URL(origin).hostname;
}

export function buildAuthLoginUrl(sourceOrigin, returnTo) {
  const url = new URL('/consulting/login', sourceOrigin);
  url.searchParams.set('redirect', returnTo);
  return url.toString();
}
