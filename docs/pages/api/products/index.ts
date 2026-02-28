import type { NextApiResponse } from 'next';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const db = await getDb();
  const collection = db.collection('products');

  if (req.method === 'GET') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const products = await collection
      .find({ productId: { $ne: 'stoked-ui' } })
      .sort({ createdAt: -1 })
      .toArray();
    return res.status(200).json(products);
  }

  if (req.method === 'POST') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { productId, name, description, logoUrl } = req.body || {};
    if (!productId || !name || !description || !logoUrl) {
      return res.status(400).json({ message: 'productId, name, description, and logoUrl are required' });
    }
    const existing = await collection.findOne({ productId });
    if (existing) {
      return res.status(409).json({ message: 'A product with this productId already exists' });
    }
    const now = new Date();
    const doc = {
      productId,
      name,
      description,
      logoUrl,
      fullName: req.body.fullName || name,
      icon: req.body.icon || '',
      url: req.body.url || `/${productId}`,
      githubRepo: req.body.githubRepo || null,
      pricing: req.body.pricing || null,
      live: false,
      managed: true,
      hideProductFeatures: false,
      prerelease: 'alpha',
      features: [],
      promos: [],
      createdAt: now,
      updatedAt: now,
    };
    const result = await collection.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
