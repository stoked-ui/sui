import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { getDocsApiOpenApiSpec } from 'docs/src/modules/openapi/docsApiOpenApiSpec';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const spec = await getDocsApiOpenApiSpec();
    return res.status(200).json(spec);
  } catch (error: unknown) {
    console.error('OpenAPI generation failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate OpenAPI spec';
    return res.status(500).json({ message });
  }
}

export default withAuth(handler);
