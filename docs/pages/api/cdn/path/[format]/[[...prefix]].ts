import type { NextApiRequest, NextApiResponse } from 'next';
import * as YAML from 'js-yaml';
import {
  buildCdnViewer,
  getCdnContentsPayload,
  isCdnContentsFormat,
  isCredentialFailure,
  normalizeCdnPrefixFromSegments,
  parseCdnContentsMaxKeys,
} from 'docs/src/modules/cdn/cdnContents';
import { readOptionalAuthUser } from 'docs/src/modules/auth/withAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const format = Array.isArray(req.query.format) ? req.query.format[0] : req.query.format;
  if (!isCdnContentsFormat(format)) {
    return res.status(400).json({ message: 'format must be json or yaml' });
  }

  try {
    const prefix = normalizeCdnPrefixFromSegments(req.query.prefix);
    const maxKeys = parseCdnContentsMaxKeys(req.query.maxKeys);
    const user = await readOptionalAuthUser(req);
    const payload = await getCdnContentsPayload(buildCdnViewer(user), {
      prefix,
      maxKeys,
    });

    res.setHeader('Cache-Control', 'private, no-store');

    if (format === 'yaml') {
      res.setHeader('Content-Type', 'application/yaml');
      return res.status(200).send(YAML.dump(payload));
    }

    return res.status(200).json(payload);
  } catch (error) {
    console.error('CDN contents path error:', error);
    if ((error as { status?: number })?.status === 403) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (isCredentialFailure(error)) {
      return res.status(503).json({
        code: 'credentials_unavailable',
        message: 'CDN contents are temporarily unavailable',
      });
    }

    return res.status(500).json({ message: 'Failed to list CDN contents' });
  }
}

export default handler;
