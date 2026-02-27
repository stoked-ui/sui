import type { NextApiRequest, NextApiResponse } from 'next';
import { listPublicBlogPosts } from 'docs/src/modules/blog/blogStore';
import { handleBlogApiError, parseBlogQuery } from 'docs/src/modules/blog/blogApiUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await listPublicBlogPosts(parseBlogQuery(req.query));
    return res.status(200).json(result);
  } catch (error: unknown) {
    return handleBlogApiError(res, error, 'Failed to fetch public blog posts');
  }
}
