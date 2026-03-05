import type { NextApiResponse } from 'next';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { createStripeProduct, createStripePrice } from 'docs/src/modules/license/stripeClient';

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
    const { productId, name, description, keyPrefix, price, currency } = req.body || {};
    if (!productId || !name || !description || !keyPrefix || price === undefined) {
      return res.status(400).json({ message: 'productId, name, description, keyPrefix, and price are required' });
    }
    const existing = await collection.findOne({ productId });
    if (existing) {
      return res.status(409).json({ message: 'A product with this productId already exists' });
    }

    try {
      // 1. Create Stripe Product
      const stripeProduct = await createStripeProduct({
        productId,
        name,
        description,
      });

      // 2. Create Stripe Price
      const stripePrice = await createStripePrice({
        productId,
        stripeProductId: stripeProduct.id,
        price,
        currency: currency || 'usd',
      });

      const now = new Date();
      const doc = {
        productId,
        name,
        description,
        keyPrefix,
        price,
        currency: currency || 'usd',
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        fullName: req.body.fullName || name,
        icon: req.body.icon || '',
        url: req.body.url || `/${productId}`,
        live: false,
        managed: true,
        hideProductFeatures: false,
        prerelease: 'alpha',
        features: [],
        licenseDurationDays: req.body.licenseDurationDays || 365,
        gracePeriodDays: req.body.gracePeriodDays || 14,
        trialDurationDays: req.body.trialDurationDays || 30,
        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(doc);
      return res.status(201).json({ _id: result.insertedId, ...doc });
    } catch (error: any) {
      console.error('Failed to create product:', error);
      return res.status(500).json({ message: `Failed to create product: ${error.message}` });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
