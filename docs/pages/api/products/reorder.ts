import type { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

/**
 * POST /api/products/reorder
 *
 * Body: { productIds: string[] } — the full desired display order (_id
 * strings). Every listed product gets sortOrder = its index, which drives the
 * ordering on install.stokd.cloud and the product listings.
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { productIds } = req.body || {};
  if (!Array.isArray(productIds) || productIds.length === 0 || !productIds.every((id) => typeof id === 'string' && ObjectId.isValid(id))) {
    return res.status(400).json({ message: 'productIds must be a non-empty array of product _id strings' });
  }

  const db = await getDb();
  const now = new Date();
  const result = await db.collection('products').bulkWrite(
    productIds.map((id, index) => ({
      updateOne: {
        filter: { _id: new ObjectId(id) },
        update: { $set: { sortOrder: index, updatedAt: now } },
      },
    })),
  );

  return res.status(200).json({ updated: result.modifiedCount });
}

export default withAuth(handler);
