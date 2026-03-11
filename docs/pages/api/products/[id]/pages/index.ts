import type { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  const db = await getDb();
  const productsCollection = db.collection('products');
  const pagesCollection = db.collection('product_pages');
  let product = null;

  if (ObjectId.isValid(id)) {
    product = await productsCollection.findOne({ _id: new ObjectId(id) });
  }
  if (!product) {
    product = await productsCollection.findOne({ productId: id });
  }
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const productKey = product._id.toString();

  if (req.method === 'GET') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const pages = await pagesCollection
      .find({ productId: productKey })
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
      .find({ productId: productKey })
      .sort({ order: -1 })
      .limit(1)
      .toArray();
    const order = req.body.order ?? (lastPage.length > 0 ? (lastPage[0].order || 0) + 1 : 0);
    const now = new Date();
    const doc = {
      productId: productKey,
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
