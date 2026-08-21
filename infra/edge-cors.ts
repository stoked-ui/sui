import { CORS_PRODUCTION_ORIGINS } from './domains';

const ALLOW_METHODS = 'GET, HEAD, OPTIONS, POST, PUT, PATCH, DELETE';
const PUBLIC_ALLOW_METHODS = 'GET, HEAD, OPTIONS';
const ALLOW_HEADERS = 'Range, Content-Type, Authorization';
const EXPOSE_HEADERS = 'Content-Range, Accept-Ranges, Content-Encoding, Content-Length';
const VARY = 'Origin, Access-Control-Request-Headers, Access-Control-Request-Method';
const OWNED_ORIGIN_MAP = Object.fromEntries(CORS_PRODUCTION_ORIGINS.map((origin) => [origin, 1]));

function isApiPath(uri: string) {
  return uri === '/api' || uri.startsWith('/api/');
}

function isPublicStaticPath(uri: string) {
  return (
    uri === '/favicon.ico' ||
    uri === '/robots.txt' ||
    uri === '/sitemap.xml' ||
    uri === '/manifest.json' ||
    uri.startsWith('/_next/static/') ||
    uri.startsWith('/static/') ||
    uri.startsWith('/images/') ||
    uri.startsWith('/clients/') ||
    /\.[a-z0-9]{2,8}$/i.test(uri)
  );
}

function isOwnedOrigin(origin?: string) {
  return Boolean(origin && OWNED_ORIGIN_MAP[origin]);
}

export function getEdgePreflightResponse(uri: string, origin?: string) {
  const api = isApiPath(uri);
  const publicStatic = isPublicStaticPath(uri);
  const allowed = isOwnedOrigin(origin);
  const headers: Record<string, string> = { vary: VARY };

  if ((api && !allowed) || (!api && !publicStatic)) {
    return { statusCode: 403, headers };
  }

  headers['access-control-allow-origin'] = api ? origin! : '*';
  headers['access-control-allow-methods'] = api ? ALLOW_METHODS : PUBLIC_ALLOW_METHODS;
  headers['access-control-allow-headers'] = ALLOW_HEADERS;
  headers['access-control-expose-headers'] = EXPOSE_HEADERS;
  headers['access-control-max-age'] = '86400';
  if (api) {
    headers['access-control-allow-credentials'] = 'true';
  }

  return { statusCode: 204, headers };
}

export function getEdgeResponseHeaders(uri: string, origin?: string) {
  const api = isApiPath(uri);
  const publicStatic = isPublicStaticPath(uri);
  const headers: Record<string, string> = {
    'access-control-allow-methods': api ? ALLOW_METHODS : PUBLIC_ALLOW_METHODS,
    'access-control-allow-headers': ALLOW_HEADERS,
    'access-control-expose-headers': EXPOSE_HEADERS,
    vary: VARY,
  };

  if (api) {
    if (isOwnedOrigin(origin)) {
      headers['access-control-allow-origin'] = origin!;
      headers['access-control-allow-credentials'] = 'true';
    }
  } else if (publicStatic) {
    headers['access-control-allow-origin'] = '*';
  }

  return headers;
}

interface PreflightInjectionVariables {
  methodVar: string;
  uriVar: string;
  requestHeadersVar?: string;
}

export function createEdgeCorsPreflightInjection({
  methodVar,
  uriVar,
  requestHeadersVar = 'event.request.headers',
}: PreflightInjectionVariables) {
  return `if(${methodVar}==='OPTIONS'){var o=${requestHeadersVar}.origin?${requestHeadersVar}.origin.value:'';var a=${JSON.stringify(OWNED_ORIGIN_MAP)}[o]===1;var p=${uriVar}==='/api'||${uriVar}.indexOf('/api/')===0;var s=!p&&(${uriVar}==='/favicon.ico'||${uriVar}==='/robots.txt'||${uriVar}==='/sitemap.xml'||${uriVar}==='/manifest.json'||${uriVar}.indexOf('/_next/static/')===0||${uriVar}.indexOf('/static/')===0||${uriVar}.indexOf('/images/')===0||${uriVar}.indexOf('/clients/')===0||/\\.[a-z0-9]{2,8}$/i.test(${uriVar}));var h={vary:{value:${JSON.stringify(VARY)}}};if((p&&!a)||(!p&&!s))return{statusCode:403,statusDescription:'Forbidden',headers:h};var r=${requestHeadersVar}['access-control-request-headers'];h['access-control-allow-origin']={value:p?o:'*'};h['access-control-allow-methods']={value:p?${JSON.stringify(ALLOW_METHODS)}:${JSON.stringify(PUBLIC_ALLOW_METHODS)}};h['access-control-allow-headers']={value:r?r.value:${JSON.stringify(ALLOW_HEADERS)}};h['access-control-expose-headers']={value:${JSON.stringify(EXPOSE_HEADERS)}};h['access-control-max-age']={value:'86400'};if(p)h['access-control-allow-credentials']={value:'true'};return{statusCode:204,statusDescription:'No Content',headers:h};}`;
}

export function createEdgeCorsResponseInjection() {
  return `var u=event.request.uri||'/';var p=u==='/api'||u.indexOf('/api/')===0;var s=!p&&(u==='/favicon.ico'||u==='/robots.txt'||u==='/sitemap.xml'||u==='/manifest.json'||u.indexOf('/_next/static/')===0||u.indexOf('/static/')===0||u.indexOf('/images/')===0||u.indexOf('/clients/')===0||/\\.[a-z0-9]{2,8}$/i.test(u));var o=event.request.headers.origin?event.request.headers.origin.value:'';var a=${JSON.stringify(OWNED_ORIGIN_MAP)}[o]===1;var h=event.response.headers;h['access-control-allow-methods']={value:p?${JSON.stringify(ALLOW_METHODS)}:${JSON.stringify(PUBLIC_ALLOW_METHODS)}};h['access-control-allow-headers']={value:${JSON.stringify(ALLOW_HEADERS)}};h['access-control-expose-headers']={value:${JSON.stringify(EXPOSE_HEADERS)}};h.vary={value:${JSON.stringify(VARY)}};h['cross-origin-opener-policy']={value:'same-origin-allow-popups'};delete h['access-control-allow-origin'];delete h['access-control-allow-credentials'];if(p&&a){h['access-control-allow-origin']={value:o};h['access-control-allow-credentials']={value:'true'}}else if(s)h['access-control-allow-origin']={value:'*'};`;
}
