import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from 'docs/src/modules/db/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { slug } = req.query;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Product slug is required' });
  }

  const db = await getDb();
  const product = await db
    .collection('products')
    .findOne(
      { productId: slug, live: true },
      {
        projection: {
          _id: 1,
          productId: 1,
          name: 1,
          fullName: 1,
          description: 1,
          url: 1,
          features: 1,
          icon: 1,
          hideProductFeatures: 1,
          prerelease: 1,
        },
      },
    );

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const pages = await db
    .collection('product_pages')
    .find(
      { productId: product._id.toString(), published: true },
      { projection: { _id: 1, slug: 1, title: 1, order: 1 } },
    )
    .sort({ order: 1 })
    .toArray();

  return res.status(200).json({ product, pages });
}
