import type { NextApiResponse } from 'next';
import { withAuth, type AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { DELIVERABLES_CDN_BASE_URL } from 'docs/src/modules/deliverables/cdnStorage';
import { prepareDeliverableHtmlForProxy } from 'docs/src/modules/deliverables/htmlSnapshot';

function getSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function isLocalDevOrigin(origin: string) {
  return /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(origin);
}

function isAllowedDeliverableOrigin(origin: string) {
  const configuredOrigin = new URL(DELIVERABLES_CDN_BASE_URL).origin;

  if (origin === configuredOrigin) {
    return true;
  }

  return process.env.NODE_ENV !== 'production' && isLocalDevOrigin(origin);
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const rawUrl = getSingleValue(req.query.url);
  if (!rawUrl) {
    return res.status(400).json({ message: 'url is required' });
  }

  let sourceUrl: URL;

  try {
    sourceUrl = new URL(rawUrl);
  } catch {
    return res.status(400).json({ message: 'url must be absolute' });
  }

  if (!['http:', 'https:'].includes(sourceUrl.protocol) || !isAllowedDeliverableOrigin(sourceUrl.origin)) {
    return res.status(400).json({ message: 'url origin is not allowed' });
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(sourceUrl.toString(), {
      redirect: 'follow',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed fetching deliverable HTML';
    return res.status(502).json({ message });
  }

  if (!upstreamResponse.ok) {
    return res.status(upstreamResponse.status).json({
      message: `Deliverable HTML request failed with ${upstreamResponse.status}`,
    });
  }

  const contentType = upstreamResponse.headers.get('content-type') || '';
  const looksLikeHtml = contentType.includes('text/html') || sourceUrl.pathname.toLowerCase().endsWith('.html');

  if (!looksLikeHtml) {
    return res.status(400).json({ message: 'url must reference an HTML document' });
  }

  const html = await upstreamResponse.text();
  const output = prepareDeliverableHtmlForProxy(html, sourceUrl.toString());

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(output);
}

export default withAuth(handler);
