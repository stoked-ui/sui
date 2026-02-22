import type { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  const db = await getDb();
  const pagesCollection = db.collection('product_pages');

  if (req.method === 'GET') {
    const pages = await pagesCollection
      .find({ productId: id })
      .sort({ order: 1 })
      .toArray();
    return res.status(200).json(pages);
  }

  if (req.method === 'POST') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { slug, title, content } = req.body || {};
    if (!slug || !title || !content) {
      return res.status(400).json({ message: 'slug, title, and content are required' });
    }
    // Auto-calculate order
    const lastPage = await pagesCollection
      .find({ productId: id })
      .sort({ order: -1 })
      .limit(1)
      .toArray();
    const order = req.body.order ?? (lastPage.length > 0 ? (lastPage[0].order || 0) + 1 : 0);
    const now = new Date();
    const doc = {
      productId: id,
      slug,
      title,
      content,
      order,
      published: true,
      createdAt: now,
      updatedAt: now,
    };
    const result = await pagesCollection.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
