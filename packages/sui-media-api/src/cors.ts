export const CORS_PRODUCTION_ORIGINS = [
  'https://sui.stokd.cloud',
  'https://www.sui.stokd.cloud',
  'https://stoked-ui.com',
  'https://www.stoked-ui.com',
  'https://consulting.stokd.cloud',
  'https://www.consulting.stokd.cloud',
  'https://stokedconsulting.com',
  'https://www.stokedconsulting.com',
  'https://cdn.stokd.cloud',
  'https://cdn-sui.stokd.cloud',
  'https://cdn.consulting.stokd.cloud',
  'https://cdn.stokedconsulting.com',
  'https://cdn-sui.stokedconsulting.com',
  'https://brianstoker.com',
  'https://www.brianstoker.com',
] as const;

export const CORS_METHODS = ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE', 'HEAD'] as const;

export const CORS_ALLOWED_HEADERS = [
  'Authorization',
  'Content-Type',
  'Accept',
  'Origin',
  'X-Requested-With',
  'Cookie',
] as const;

export const CORS_EXPOSED_HEADERS = [
  'Content-Range',
  'Content-Length',
  'Accept-Ranges',
  'Content-Type',
  'Content-Encoding',
] as const;

function isDevelopment(env: NodeJS.ProcessEnv) {
  return (
    env.NODE_ENV !== 'production' && env.SST_STAGE !== 'production' && env.SST_STAGE !== 'prod'
  );
}

function isLocalOrigin(origin: string) {
  return /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(origin);
}

function configuredOrigins(env: NodeJS.ProcessEnv) {
  const origins: string[] = [];

  for (const rawOrigin of (env.ALLOWED_ORIGINS || '').split(',')) {
    const value = rawOrigin.trim();
    if (!value) {
      continue;
    }

    try {
      const url = new URL(value);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        origins.push(url.origin);
      }
    } catch {
      // Ignore malformed optional origins.
    }
  }

  return origins;
}

export function getAllowedCorsOrigins(env: NodeJS.ProcessEnv = process.env) {
  return new Set<string>([...CORS_PRODUCTION_ORIGINS, ...configuredOrigins(env)]);
}

export function isCorsOriginAllowed(origin: string, env: NodeJS.ProcessEnv = process.env) {
  if (getAllowedCorsOrigins(env).has(origin)) {
    return true;
  }

  return isDevelopment(env) && isLocalOrigin(origin);
}

export function createCorsOptions(env: NodeJS.ProcessEnv = process.env) {
  return {
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allowed?: boolean) => void,
    ) => {
      if (!origin || isCorsOriginAllowed(origin, env)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin "${origin}" not allowed by CORS`));
    },
    methods: [...CORS_METHODS],
    allowedHeaders: [...CORS_ALLOWED_HEADERS],
    exposedHeaders: [...CORS_EXPOSED_HEADERS],
    maxAge: 86400,
    credentials: true,
  };
}
