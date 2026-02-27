import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import {
  createBlogPost,
  listBlogPosts,
} from 'docs/src/modules/blog/blogStore';
import { handleBlogApiError, parseBlogQuery } from 'docs/src/modules/blog/blogApiUtils';

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const result = await listBlogPosts(parseBlogQuery(req.query));
      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const {
        title,
        slug,
        body,
        description,
        tags,
        authors,
        targetSites,
        image,
        date,
      } = req.body || {};

      if (!title || !body || !description || !isStringArray(tags) || !isStringArray(authors)) {
        return res.status(400).json({
          message: 'title, body, description, tags[], and authors[] are required',
        });
      }

      const created = await createBlogPost({
        title,
        slug,
        body,
        description,
        tags,
        authors,
        targetSites: isStringArray(targetSites) ? targetSites : undefined,
        image: typeof image === 'string' ? image : undefined,
        date: typeof date === 'string' ? date : undefined,
      });

      return res.status(201).json(created);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: unknown) {
    return handleBlogApiError(res, error, 'Failed to process blog request');
  }
}

export default withAuth(handler);
