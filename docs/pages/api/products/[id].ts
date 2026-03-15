import type { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { createStripeProduct, createStripePrice } from 'docs/src/modules/license/stripeClient';

type SubscriptionInput = {
  label?: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  stripePriceId?: string;
};

function toSubscriptionInput(entry: Record<string, unknown>, defaults?: { currency?: unknown; interval?: unknown }): SubscriptionInput {
  return {
    label: typeof entry.label === 'string' && entry.label.trim() ? entry.label.trim() : undefined,
    price: Number(entry.price),
    currency: String(entry.currency || defaults?.currency || 'usd').toLowerCase(),
    interval: entry.interval === 'month' || defaults?.interval === 'month' ? 'month' : 'year',
    stripePriceId: typeof entry.stripePriceId === 'string' ? entry.stripePriceId : undefined,
  };
}

function normalizeSubscriptions(input: unknown, existingProduct: any, legacyPrice?: unknown, legacyCurrency?: unknown): SubscriptionInput[] {
  const rawSubscriptions = Array.isArray(input)
    ? input
    : legacyPrice !== undefined || legacyCurrency !== undefined
      ? [{
        label: existingProduct?.subscriptions?.[0]?.label,
        price: legacyPrice !== undefined ? legacyPrice : existingProduct?.price,
        currency: legacyCurrency !== undefined ? legacyCurrency : existingProduct?.currency,
        interval: existingProduct?.subscriptions?.[0]?.interval || 'year',
      }]
      : [];

  return rawSubscriptions
    .filter((entry: unknown): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
    .map((entry) => toSubscriptionInput(entry, {
      currency: existingProduct?.currency,
      interval: existingProduct?.subscriptions?.[0]?.interval,
    }))
    .filter((entry) => Number.isFinite(entry.price) && entry.price > 0 && !!entry.currency);
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const db = await getDb();
  const collection = db.collection('products');

  let existingProduct: any = null;
  if (ObjectId.isValid(id)) {
    existingProduct = await collection.findOne({ _id: new ObjectId(id) });
  }
  if (!existingProduct) {
    existingProduct = await collection.findOne({ productId: id });
  }

  if (req.method === 'GET') {
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json(existingProduct);
  }

  if (req.method === 'PATCH') {
    const { 
      name, fullName, description, icon, url, live, 
      hideProductFeatures, prerelease, features,
      keyPrefix, price, currency, subscriptions,
      licenseDurationDays, gracePeriodDays, trialDurationDays,
      maxActivations
    } = req.body || {};

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) update.name = name;
    if (fullName !== undefined) update.fullName = fullName;
    if (description !== undefined) update.description = description;
    if (icon !== undefined) update.icon = icon;
    if (url !== undefined) update.url = url;
    if (live !== undefined) update.live = live;
    if (hideProductFeatures !== undefined) update.hideProductFeatures = hideProductFeatures;
    if (prerelease !== undefined) update.prerelease = prerelease;
    if (features !== undefined) update.features = features;
    if (keyPrefix !== undefined) update.keyPrefix = keyPrefix;
    if (licenseDurationDays !== undefined) update.licenseDurationDays = licenseDurationDays;
    if (gracePeriodDays !== undefined) update.gracePeriodDays = gracePeriodDays;
    if (trialDurationDays !== undefined) update.trialDurationDays = trialDurationDays;
    if (maxActivations !== undefined) update.maxActivations = maxActivations;

    const normalizedSubscriptions = normalizeSubscriptions(subscriptions, existingProduct, price, currency);

    if (Array.isArray(subscriptions) && normalizedSubscriptions.length === 0) {
      return res.status(400).json({ message: 'At least one valid subscription is required' });
    }

    if (normalizedSubscriptions.length > 0) {
      try {
        let stripeProductId = existingProduct.stripeProductId;
        if (!stripeProductId) {
          const stripeProduct = await createStripeProduct({
            productId: existingProduct.productId,
            name: name !== undefined ? name : existingProduct.name,
            description: description !== undefined ? description : existingProduct.description,
          });
          stripeProductId = stripeProduct.id;
          update.stripeProductId = stripeProductId;
        }

        const stripeSubscriptions = await Promise.all(
          normalizedSubscriptions.map(async (subscription) => {
            if (subscription.stripePriceId) {
              return subscription;
            }

            const stripePrice = await createStripePrice({
              productId: existingProduct.productId,
              stripeProductId,
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
        update.price = defaultSubscription.price;
        update.currency = defaultSubscription.currency;
        update.stripePriceId = defaultSubscription.stripePriceId;
        update.subscriptions = stripeSubscriptions;
      } catch (error: any) {
        console.error('Failed to update Stripe subscriptions:', error);
        return res.status(500).json({ message: `Failed to update Stripe subscriptions: ${error.message}` });
      }
    }

    const result = await collection.findOneAndUpdate(
      { _id: existingProduct._id },
      { $set: update },
      { returnDocument: 'after' },
    );

    return res.status(200).json(result);
  }

  if (req.method === 'DELETE') {
    // Cascade delete associated pages first
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const productId = existingProduct._id.toString();
    const pagesCollection = db.collection('product_pages');
    await pagesCollection.deleteMany({ productId: productId });
    const result = await collection.deleteOne({ _id: existingProduct._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ message: 'Product deleted' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
