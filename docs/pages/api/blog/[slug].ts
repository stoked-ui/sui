import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from 'docs/src/modules/auth/authStore';
import { validateApiKey } from 'docs/src/modules/auth/apiKeyStore';
import {
  getBlogPostBySlug,
  softDeleteBlogPost,
  updateBlogPost,
} from 'docs/src/modules/blog/blogStore';
import { handleBlogApiError } from 'docs/src/modules/blog/blogApiUtils';

type AuthUser = {
  sub: string;
  email: string;
  role: 'admin' | 'client' | 'agent';
  name: string;
  clientId?: string;
  impersonatedId?: string;
};

async function getOptionalAuthUser(req: NextApiRequest): Promise<AuthUser | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  const token = header.slice(7);
  try {
    if (token.startsWith('sk_')) {
      return await validateApiKey(token);
    }
    return verifyToken(token);
  } catch {
    return null;
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'slug route param is required' });
  }

  try {
    if (req.method === 'GET') {
      const post = await getBlogPostBySlug(slug) as { status?: string };
      if (post.status !== 'published') {
        const user = await getOptionalAuthUser(req);
        if (!user) {
          return res.status(401).json({ message: 'Authentication required to view draft posts' });
        }
      }
      return res.status(200).json(post);
    }

    const user = await getOptionalAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};
      const updated = await updateBlogPost(slug, {
        title: typeof body.title === 'string' ? body.title : undefined,
        slug: typeof body.slug === 'string' ? body.slug : undefined,
        body: typeof body.body === 'string' ? body.body : undefined,
        description: typeof body.description === 'string' ? body.description : undefined,
        tags: isStringArray(body.tags) ? body.tags : undefined,
        authors: isStringArray(body.authors) ? body.authors : undefined,
        targetSites: isStringArray(body.targetSites) ? body.targetSites : undefined,
        image: typeof body.image === 'string' ? body.image : undefined,
        date: typeof body.date === 'string' ? body.date : undefined,
      });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      await softDeleteBlogPost(slug);
      return res.status(204).end();
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: unknown) {
    return handleBlogApiError(res, error, 'Failed to process blog post request');
  }
}
