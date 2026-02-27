import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { unpublishBlogPost } from 'docs/src/modules/blog/blogStore';
import { handleBlogApiError } from 'docs/src/modules/blog/blogApiUtils';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { slug } = req.query;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'slug route param is required' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await unpublishBlogPost(slug);
    return res.status(200).json(result);
  } catch (error: unknown) {
    return handleBlogApiError(res, error, 'Failed to unpublish blog post');
  }
}

export default withAuth(handler);
