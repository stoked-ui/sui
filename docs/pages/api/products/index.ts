import type { NextApiResponse } from 'next';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { createStripeProduct, createStripePrice } from 'docs/src/modules/license/stripeClient';

type SubscriptionInput = {
  label?: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
};

function toSubscriptionInput(entry: Record<string, unknown>, defaults?: { currency?: unknown; interval?: unknown }): SubscriptionInput {
  return {
    label: typeof entry.label === 'string' && entry.label.trim() ? entry.label.trim() : undefined,
    price: Number(entry.price),
    currency: String(entry.currency || defaults?.currency || 'usd').toLowerCase(),
    interval: entry.interval === 'month' || defaults?.interval === 'month' ? 'month' : 'year',
  };
}

function normalizeSubscriptions(input: unknown, legacyPrice?: unknown, legacyCurrency?: unknown): SubscriptionInput[] {
  const rawSubscriptions = Array.isArray(input)
    ? input
    : legacyPrice !== undefined
      ? [{ price: legacyPrice, currency: legacyCurrency, interval: 'year' }]
      : [];

  return rawSubscriptions
    .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
    .map((entry) => toSubscriptionInput(entry, { currency: legacyCurrency }))
    .filter((entry) => Number.isFinite(entry.price) && entry.price > 0 && !!entry.currency);
}

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
    const { productId, name, description, keyPrefix, price, currency, subscriptions: inputSubscriptions } = req.body || {};
    const subscriptions = normalizeSubscriptions(inputSubscriptions, price, currency);
    if (!productId || !name || !description || !keyPrefix || subscriptions.length === 0) {
      return res.status(400).json({ message: 'productId, name, description, keyPrefix, and at least one subscription are required' });
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

      const stripeSubscriptions = await Promise.all(
        subscriptions.map(async (subscription) => {
          const stripePrice = await createStripePrice({
            productId,
            stripeProductId: stripeProduct.id,
            price: subscription.price,
            currency: subscription.currency,
            interval: subscription.interval,
            label: subscription.label,
          });

          return {
            ...subscription,
            stripePriceId: stripePrice.id,
          };
        }),
      );

      const [defaultSubscription] = stripeSubscriptions;

      const now = new Date();
      const doc = {
        productId,
        name,
        description,
        keyPrefix,
        price: defaultSubscription.price,
        currency: defaultSubscription.currency,
        subscriptions: stripeSubscriptions,
        stripeProductId: stripeProduct.id,
        stripePriceId: defaultSubscription.stripePriceId,
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
        maxActivations: req.body.maxActivations || 3,
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
