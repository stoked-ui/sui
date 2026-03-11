import type { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id, pageId } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid product ID' });
  }
  if (!pageId || typeof pageId !== 'string' || !ObjectId.isValid(pageId)) {
    return res.status(400).json({ message: 'Invalid page ID' });
  }

  const db = await getDb();
  const productsCollection = db.collection('products');
  const pagesCollection = db.collection('product_pages');
  const pageObjectId = new ObjectId(pageId);
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
    const page = await pagesCollection.findOne({ _id: pageObjectId, productId: productKey });
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    return res.status(200).json(page);
  }

  if (req.method === 'PATCH') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { title, slug, content, order, published } = req.body || {};
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) update.title = title;
    if (slug !== undefined) update.slug = slug;
    if (content !== undefined) update.content = content;
    if (order !== undefined) update.order = order;
    if (published !== undefined) update.published = published;

    const result = await pagesCollection.findOneAndUpdate(
      { _id: pageObjectId, productId: productKey },
      { $set: update },
      { returnDocument: 'after' },
    );
    if (!result) {
      return res.status(404).json({ message: 'Page not found' });
    }
    return res.status(200).json(result);
  }

  if (req.method === 'DELETE') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const result = await pagesCollection.deleteOne({ _id: pageObjectId, productId: productKey });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }
    return res.status(200).json({ message: 'Page deleted' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
