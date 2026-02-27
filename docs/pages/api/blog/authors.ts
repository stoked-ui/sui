import type { NextApiRequest, NextApiResponse } from 'next';
import { getBlogAuthorCounts } from 'docs/src/modules/blog/blogStore';
import { handleBlogApiError } from 'docs/src/modules/blog/blogApiUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authors = await getBlogAuthorCounts();
    return res.status(200).json(authors);
  } catch (error: unknown) {
    return handleBlogApiError(res, error, 'Failed to fetch authors');
  }
}
