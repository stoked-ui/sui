import type { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { createStripeProduct, createStripePrice } from 'docs/src/modules/license/stripeClient';
import { sanitizePrivacyPolicyLocalizedContent } from 'docs/src/modules/utils/legalLocalization';

type SubscriptionInput = {
  label?: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  stripePriceId?: string;
};

type ProductPromoInput = {
  headerLabel: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  ctaLabel: string;
  ctaUrl: string;
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

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePromo(input: unknown): ProductPromoInput | null {
  if (input === undefined || input === null) {
    return null;
  }

  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('promo must be an object or null');
  }

  const record = input as Record<string, unknown>;
  const headerLabel = readTrimmedString(record.headerLabel);
  const title = readTrimmedString(record.title);
  const subtitle = readTrimmedString(record.subtitle);
  const imageUrl = readTrimmedString(record.imageUrl);
  const ctaLabel = readTrimmedString(record.ctaLabel);
  const ctaUrl = readTrimmedString(record.ctaUrl);
  const hasAnyPromoValue = [headerLabel, title, subtitle, imageUrl, ctaLabel, ctaUrl].some(Boolean);

  if (!hasAnyPromoValue) {
    return null;
  }

  if (!title || !subtitle || !ctaLabel || !ctaUrl) {
    throw new Error('promo requires title, subtitle, ctaLabel, and ctaUrl');
  }

  return {
    headerLabel: headerLabel || 'Also from Stoked Consulting',
    title,
    subtitle,
    ...(imageUrl ? { imageUrl } : {}),
    ctaLabel,
    ctaUrl,
  };
}

function hasOwn(record: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(record, key);
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
      hideProductFeatures, prerelease, features, promo,
      keyPrefix, price, currency, subscriptions,
      licenseDurationDays, gracePeriodDays, trialDurationDays,
      maxActivations, privacyPolicy, termsAndConditions,
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
    if (promo !== undefined) {
      try {
        update.promo = normalizePromo(promo);
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }
    }
    if (keyPrefix !== undefined) update.keyPrefix = keyPrefix;
    if (licenseDurationDays !== undefined) update.licenseDurationDays = licenseDurationDays;
    if (gracePeriodDays !== undefined) update.gracePeriodDays = gracePeriodDays;
    if (trialDurationDays !== undefined) update.trialDurationDays = trialDurationDays;
    if (maxActivations !== undefined) update.maxActivations = maxActivations;
    if (privacyPolicy !== undefined) {
      if (privacyPolicy === null) {
        update.privacyPolicy = null;
      } else if (typeof privacyPolicy === 'object' && !Array.isArray(privacyPolicy)) {
        const privacyPolicyInput = privacyPolicy as Record<string, unknown>;
        const existing = existingProduct?.privacyPolicy || {};
        const existingLocalizedContent = sanitizePrivacyPolicyLocalizedContent(existing.localizedContent);
        let localizedContent = existingLocalizedContent;

        if (hasOwn(privacyPolicyInput, 'localizedContent')) {
          localizedContent =
            privacyPolicyInput.localizedContent === null
              ? {}
              : sanitizePrivacyPolicyLocalizedContent(privacyPolicyInput.localizedContent);
        }

        update.privacyPolicy = {
          enabled: typeof privacyPolicyInput.enabled === 'boolean' ? privacyPolicyInput.enabled : existing.enabled ?? false,
          content: typeof privacyPolicyInput.content === 'string' ? privacyPolicyInput.content : existing.content ?? '',
          ...(Object.keys(localizedContent).length > 0 ? { localizedContent } : {}),
        };
      }
    }
    if (termsAndConditions !== undefined) {
      if (termsAndConditions === null) {
        update.termsAndConditions = null;
      } else if (typeof termsAndConditions === 'object') {
        const existing = existingProduct?.termsAndConditions || {};
        update.termsAndConditions = {
          enabled: typeof termsAndConditions.enabled === 'boolean' ? termsAndConditions.enabled : existing.enabled ?? false,
          content: typeof termsAndConditions.content === 'string' ? termsAndConditions.content : existing.content ?? '',
        };
      }
    }

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
