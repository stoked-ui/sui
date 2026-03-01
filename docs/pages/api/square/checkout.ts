import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from 'docs/src/modules/db/mongodb';
import { createSquareCheckoutLink, SquareClientError } from 'docs/src/modules/square/squareClient';

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

  // Phase 3.4: Promo code validation will be integrated here.
  // For now this is a stub — discount is always zero.
  let discountAmountCents = 0;
  if (promoCode) {
    // TODO (Phase 3.4): Look up promoCode, validate it, and compute discountAmountCents.
    discountAmountCents = 0;
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

    return res.status(200).json({ checkoutUrl });
  } catch (error: unknown) {
    if (error instanceof SquareClientError) {
      return res.status(error.status).json({ message: error.message });
    }
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return res.status(500).json({ message });
  }
}
