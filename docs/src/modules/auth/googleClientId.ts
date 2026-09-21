const GOOGLE_CLIENT_ENV_KEY = ['NEXT_PUBLIC', 'GOOGLE_CLIENT_ID'].join('_');

let cachedGoogleClientId = '';

export function clearRememberedGoogleClientId() {
  cachedGoogleClientId = '';
}

export function rememberGoogleClientId(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    cachedGoogleClientId = value.trim();
  }
  return cachedGoogleClientId;
}

/**
 * Next's DefinePlugin replaces the literal `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID`
 * at build time. A production build that did not see the variable inlines `''`
 * even when the Lambda later has the real id. Bracket access reads the runtime env.
 * `inlined` is only a fallback for bundles that already baked in a non-empty id.
 */
export function readGoogleClientId(
  env: Record<string, string | undefined> = process.env,
  inlined: string | undefined = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
) {
  const runtime = env[GOOGLE_CLIENT_ENV_KEY];
  if (typeof runtime === 'string' && runtime.trim()) {
    cachedGoogleClientId = runtime.trim();
    return cachedGoogleClientId;
  }
  if (cachedGoogleClientId) {
    return cachedGoogleClientId;
  }
  if (typeof inlined === 'string' && inlined.trim()) {
    cachedGoogleClientId = inlined.trim();
    return cachedGoogleClientId;
  }
  return '';
}
