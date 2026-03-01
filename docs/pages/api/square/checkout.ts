import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from 'docs/src/modules/db/mongodb';
import { createSquareCheckoutLink, SquareClientError } from 'docs/src/modules/square/squareClient';
import { validatePromoCode, applyPromoCode, PromoError } from 'docs/src/modules/promo/promoStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { productId, email, successUrl, cancelUrl, promoCode } = req.body || {};

  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ message: 'productId is required' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ message: 'A valid email address is required' });
  }

  if (!successUrl || typeof successUrl !== 'string' || !successUrl.startsWith('http')) {
    return res.status(400).json({ message: 'successUrl must be a valid URL starting with http' });
  }

  if (!cancelUrl || typeof cancelUrl !== 'string' || !cancelUrl.startsWith('http')) {
    return res.status(400).json({ message: 'cancelUrl must be a valid URL starting with http' });
  }

  const db = await getDb();
  const product = await db.collection('products').findOne({ productId, live: true });

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const catalogVariationId = product.pricing?.squareCatalogVariationId;
  if (!catalogVariationId) {
    return res.status(400).json({ message: 'Product has not been synced to Square yet' });
  }

  let discountAmountCents: number | undefined;
  let appliedPromoCode: string | undefined;
  if (promoCode) {
    try {
      const promo = await validatePromoCode(promoCode, productId);
      if (promo.discountType === 'percentage') {
        discountAmountCents = Math.round(
          product.pricing.monthlyPriceCents * (promo.discountValue / 100),
        );
      } else if (promo.discountType === 'fixed_amount') {
        discountAmountCents = promo.discountValue;
      } else {
        // free_trial_days: trial handled at Square subscription level, no monetary discount
        discountAmountCents = 0;
      }
      appliedPromoCode = promoCode;
    } catch (error: unknown) {
      if (error instanceof PromoError) {
        return res.status(error.status).json({ message: error.message });
      }
      throw error;
    }
  }

  const priceCents: number = product.pricing?.monthlyPriceCents ?? 0;
  const currency: string = product.pricing?.currency ?? 'USD';

  try {
    const checkoutUrl = await createSquareCheckoutLink({
      productId,
      email,
      catalogVariationId,
      priceCents,
      currency,
      successUrl,
      cancelUrl,
      discountAmountCents,
    });

    if (appliedPromoCode) {
      await applyPromoCode(appliedPromoCode);
    }

    return res.status(200).json({ checkoutUrl });
  } catch (error: unknown) {
    if (error instanceof SquareClientError) {
      return res.status(error.status).json({ message: error.message });
    }
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return res.status(500).json({ message });
  }
}
