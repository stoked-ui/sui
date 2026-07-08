import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from 'docs/src/modules/db/mongodb';
import { readOptionalAuthUser } from 'docs/src/modules/auth/withAuth';
import { normalizeInstallSourceUrl } from 'docs/src/modules/products/install';

/**
 * GET /api/install/<productId>.sh
 *
 * Backs install.stokd.cloud/<productId>.sh. Streams the product's install
 * script from its installSourceUrl (e.g. a raw.githubusercontent.com link or
 * a release asset).
 *
 * Auth is optional and shares credentials with cdn/consulting/sui: live
 * products are public, while non-live products are only served to admins
 * (Bearer token, API key, or session — see readOptionalAuthUser).
 */

const SCRIPT_PATTERN = /^([a-z0-9][a-z0-9-_.]*)\.sh$/i;

const GITHUB_HOSTS = new Set(['raw.githubusercontent.com', 'api.github.com', 'github.com', 'objects.githubusercontent.com']);

function sendPlainError(res: NextApiResponse, status: number, message: string) {
  res.status(status).setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(`# ${message}\n`);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendPlainError(res, 405, 'Method not allowed');
  }

  const { script } = req.query;
  const match = typeof script === 'string' ? SCRIPT_PATTERN.exec(script) : null;
  if (!match) {
    return sendPlainError(res, 400, 'Expected /<product>.sh');
  }
  const productId = match[1];

  const db = await getDb();
  const product = await db.collection('products').findOne(
    { productId },
    { projection: { productId: 1, name: 1, live: 1, installSourceUrl: 1 } },
  );

  if (!product) {
    return sendPlainError(res, 404, `Unknown product: ${productId}`);
  }

  if (!product.live) {
    // Optional OAuth: same credential set as cdn/consulting/sui. Only admins
    // can fetch install scripts for products that are not yet live.
    const user = await readOptionalAuthUser(req);
    if (user?.role !== 'admin') {
      return sendPlainError(res, 404, `Unknown product: ${productId}`);
    }
  }

  const sourceUrl = normalizeInstallSourceUrl(product.installSourceUrl);
  if (!sourceUrl) {
    return sendPlainError(res, 404, `${product.name || productId} does not have an install script configured`);
  }

  try {
    // Attach the GitHub token only to GitHub hosts (private repos); never
    // leak it to arbitrary source hosts.
    const githubToken = process.env.GITHUB_TOKEN;
    const sourceHost = new URL(sourceUrl).hostname;
    const headers: Record<string, string> = {};
    if (githubToken && GITHUB_HOSTS.has(sourceHost)) {
      headers.Authorization = `Bearer ${githubToken}`;
      if (sourceHost === 'api.github.com') {
        headers.Accept = 'application/vnd.github.raw+json';
        headers['X-GitHub-Api-Version'] = '2022-11-28';
      }
    }

    const sourceResponse = await fetch(sourceUrl, { headers, redirect: 'follow' });
    if (!sourceResponse.ok) {
      return sendPlainError(res, 502, `Failed to fetch install script for ${productId} (upstream ${sourceResponse.status})`);
    }
    const scriptBody = await sourceResponse.text();

    res.status(200);
    res.setHeader('Content-Type', 'text/x-shellscript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Install-Product', productId);
    return res.send(scriptBody);
  } catch (error: any) {
    console.error(`Failed to serve install script for ${productId}:`, error);
    return sendPlainError(res, 502, `Failed to fetch install script for ${productId}`);
  }
}
