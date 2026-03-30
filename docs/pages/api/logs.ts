import type { NextApiRequest, NextApiResponse } from 'next';

type AllowedLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

const ALLOWED_LEVELS = new Set<AllowedLevel>(['log', 'info', 'warn', 'error', 'debug']);

export default function handler(req: NextApiRequest, res: NextApiResponse): void {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { level, args, href, pathname, timestamp, source } = req.body || {};

  const resolvedLevel: AllowedLevel =
    typeof level === 'string' && ALLOWED_LEVELS.has(level as AllowedLevel)
      ? (level as AllowedLevel)
      : 'log';
  const resolvedArgs = Array.isArray(args) ? args : [];
  // eslint-disable-next-line no-console
  const consoleMethod: (...callArgs: unknown[]) => void = console[resolvedLevel].bind(console);

  // eslint-disable-next-line no-console
  consoleMethod(
    '[browser-console]',
    {
      source: typeof source === 'string' ? source : 'browser-console',
      href: typeof href === 'string' ? href : undefined,
      pathname: typeof pathname === 'string' ? pathname : undefined,
      timestamp: typeof timestamp === 'string' ? timestamp : undefined,
    },
    ...resolvedArgs,
  );

  res.status(204).end();
}
