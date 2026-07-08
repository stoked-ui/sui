import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from 'docs/src/modules/db/mongodb';
import { normalizePublicProductUrl } from 'docs/src/modules/utils/siteRouting';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const db = await getDb();
  const products = await db
    .collection('products')
    .find(
      { live: true, productId: { $ne: 'stoked-ui' } },
      { projection: { _id: 1, productId: 1, name: 1, description: 1, url: 1, features: 1, icon: 1, hideProductFeatures: 1, prerelease: 1 } },
    )
    .sort({ sortOrder: 1, name: 1 })
    .toArray();

  return res.status(200).json(
    products.map((product) => ({
      ...product,
      url: normalizePublicProductUrl(product.productId, product.url),
    })),
  );
}
