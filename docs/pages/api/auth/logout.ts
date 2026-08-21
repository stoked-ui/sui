import type { NextApiRequest, NextApiResponse } from 'next';
import {
  clearAuthSession,
  getRequestOrigin,
  isAllowedTransferOrigin,
} from 'docs/src/modules/auth/session';
import {
  buildLogoutCascadeUrl,
  parseLogoutOriginChain,
} from 'docs/src/modules/auth/logoutOrigins';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeReturnTo(currentOrigin: string, rawValue: string | string[] | undefined) {
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  if (!value) {
    return `${currentOrigin}/`;
  }

  if (value.startsWith('/')) {
    const parsed = new URL(value, currentOrigin);
    if (parsed.pathname.startsWith('/api/auth/logout')) {
      return `${currentOrigin}/`;
    }
    return parsed.toString();
  }

  const parsed = new URL(value);
  if (!isAllowedTransferOrigin(parsed.origin) || parsed.pathname.startsWith('/api/auth/logout')) {
    throw new Error('returnTo must stay on an allowed origin');
  }

  return parsed.toString();
}

function renderLogoutPage(redirectTo: string) {
  const escapedRedirectTo = escapeHtml(redirectTo);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=${escapedRedirectTo}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Signing out...</title>
  </head>
  <body>
    <script>
      try {
        window.localStorage.removeItem('auth');
        window.localStorage.removeItem('blog_jwt');
      } catch (error) {}
      window.location.replace(${JSON.stringify(redirectTo)});
    </script>
    <p>Signing out...</p>
    <p><a href="${escapedRedirectTo}">Continue</a></p>
  </body>
</html>`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    clearAuthSession(res);
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  clearAuthSession(res);

  try {
    const currentOrigin = getRequestOrigin(req);
    const returnTo = normalizeReturnTo(currentOrigin, req.query.returnTo);
    const nextOrigins = parseLogoutOriginChain(currentOrigin, req.query.nextOrigins);
    const redirectTo = nextOrigins.length > 0
      ? buildLogoutCascadeUrl(nextOrigins[0], returnTo, nextOrigins.slice(1))
      : returnTo;

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(renderLogoutPage(redirectTo));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    return res.status(400).json({ message });
  }
}
