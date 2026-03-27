import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { createStripeCoupon, createStripePromotionCode } from 'docs/src/modules/license/stripeClient';
import { handleLicenseApiError } from 'docs/src/modules/license/licenseApiUtils';
import { getLicenseProductOrThrow } from 'docs/src/modules/license/licenseStore';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const {
    name,
    code,
    type,
    percentOff,
    amountOff,
    freeMonths,
    duration,
    durationInMonths,
    maxRedemptions,
    expiresAt,
    productId,
    firstTimeTransaction,
    minimumAmount,
  } = req.body || {};

  if (!name || !code || !type || !duration) {
    return res.status(400).json({ message: 'name, code, type, and duration are required' });
  }

  if (!['percent', 'amount', 'free_months'].includes(type)) {
    return res.status(400).json({ message: 'type must be percent, amount, or free_months' });
  }

  if (!['once', 'forever', 'repeating'].includes(duration)) {
    return res.status(400).json({ message: 'duration must be once, forever, or repeating' });
  }

  if (type === 'percent' && (typeof percentOff !== 'number' || percentOff <= 0 || percentOff > 100)) {
    return res.status(400).json({ message: 'percentOff must be a number between 1 and 100' });
  }

  if (type === 'amount' && (typeof amountOff !== 'number' || amountOff <= 0)) {
    return res.status(400).json({ message: 'amountOff must be a positive number (in dollars)' });
  }

  if (type === 'free_months' && (typeof freeMonths !== 'number' || freeMonths < 1)) {
    return res.status(400).json({ message: 'freeMonths must be a positive integer' });
  }

  if (duration === 'repeating' && type !== 'free_months' && typeof durationInMonths !== 'number') {
    return res.status(400).json({ message: 'durationInMonths is required when duration is repeating' });
  }

  let appliesTo: { products: string[] } | undefined;
  if (productId) {
    try {
      const product = await getLicenseProductOrThrow(String(productId));
      if (product.stripeProductId) {
        appliesTo = { products: [product.stripeProductId] };
      }
    } catch {
      return res.status(400).json({ message: `Product '${productId}' not found` });
    }
  }

  try {
    const coupon = await createStripeCoupon({
      name: String(name),
      type: type as 'percent' | 'amount' | 'free_months',
      percentOff: typeof percentOff === 'number' ? percentOff : undefined,
      amountOff: typeof amountOff === 'number' ? amountOff : undefined,
      freeMonths: typeof freeMonths === 'number' ? freeMonths : undefined,
      duration: duration as 'once' | 'forever' | 'repeating',
      durationInMonths: typeof durationInMonths === 'number' ? durationInMonths : undefined,
      maxRedemptions: typeof maxRedemptions === 'number' ? maxRedemptions : undefined,
      redeemBy: expiresAt ? Math.floor(new Date(String(expiresAt)).getTime() / 1000) : undefined,
      appliesTo,
    });

    const promoCode = await createStripePromotionCode({
      couponId: coupon.id,
      code: String(code).toUpperCase(),
      maxRedemptions: typeof maxRedemptions === 'number' ? maxRedemptions : undefined,
      expiresAt: expiresAt ? Math.floor(new Date(String(expiresAt)).getTime() / 1000) : undefined,
      firstTimeTransaction: typeof firstTimeTransaction === 'boolean' ? firstTimeTransaction : undefined,
      minimumAmount: typeof minimumAmount === 'number' ? minimumAmount : undefined,
    });

    return res.status(201).json({
      couponId: coupon.id,
      promoCodeId: promoCode.id,
      code: promoCode.code,
      discount: type === 'percent'
        ? `${percentOff}% off`
        : type === 'amount'
          ? `$${amountOff} off`
          : `${freeMonths} month(s) free`,
    });
  } catch (error: unknown) {
    return handleLicenseApiError(res, error, 'Failed to create promo code');
  }
}

export default withAuth(handler);
