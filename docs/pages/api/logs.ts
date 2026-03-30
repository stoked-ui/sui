import type { NextApiRequest, NextApiResponse } from 'next';

const ALLOWED_LEVELS = new Set(['log', 'info', 'warn', 'error', 'debug']);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { level, args, href, pathname, timestamp, source } = req.body || {};

  const resolvedLevel = typeof level === 'string' && ALLOWED_LEVELS.has(level) ? level : 'log';
  const resolvedArgs = Array.isArray(args) ? args : [];
  // eslint-disable-next-line no-console
  const consoleMethod = console[resolvedLevel as keyof Console] || console.log;

  // eslint-disable-next-line no-console
  consoleMethod.call(
    console,
    '[browser-console]',
    {
      source: typeof source === 'string' ? source : 'browser-console',
      href: typeof href === 'string' ? href : undefined,
      pathname: typeof pathname === 'string' ? pathname : undefined,
      timestamp: typeof timestamp === 'string' ? timestamp : undefined,
    },
    ...resolvedArgs,
  );

  return res.status(204).end();
}
