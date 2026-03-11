import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

/**
 * On-demand ISR revalidation for blog pages.
 * POST /api/blog/revalidate { slug: "my-post" }
 *
 * Revalidates both the individual post page and the blog listing.
 * Requires admin authentication.
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { slug } = req.body || {};

  try {
    // Always revalidate the blog listing page
    await res.revalidate('/blog');

    // Revalidate the specific post page if slug provided
    if (typeof slug === 'string' && slug.trim()) {
      await res.revalidate(`/blog/${slug.trim()}`);
    }

    return res.status(200).json({ revalidated: true, slug: slug || null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Revalidation failed';
    return res.status(500).json({ message });
  }
}

export default withAuth(handler, { roles: ['admin'] });
