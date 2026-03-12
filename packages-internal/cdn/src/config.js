export const cdnName = import.meta.env.VITE_CDN_NAME || 'Stoked CDN';
export const publicBaseUrl =
  import.meta.env.VITE_CDN_PUBLIC_BASE_URL || 'https://cdn.stokedconsulting.com';

function getDefaultContentsEndpoint() {
  if (typeof window === 'undefined') {
    return 'http://localhost:5199/api/cdn/contents/';
  }

  if (window.location.port === '4173') {
    return 'http://localhost:5199/api/cdn/contents/';
  }

  return '/api/cdn/contents/';
}

export const contentsEndpoint =
  import.meta.env.VITE_CDN_CONTENTS_URL || getDefaultContentsEndpoint();
