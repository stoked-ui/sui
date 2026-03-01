import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import {
  createPromoCode,
  listPromoCodes,
  PromoError,
} from 'docs/src/modules/promo/promoStore';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (req.method === 'GET') {
    const { productId, active: activeParam } = req.query;

    const filters: { productId?: string; active?: boolean } = {};

    if (typeof productId === 'string') {
      filters.productId = productId;
    }

    if (activeParam === 'true') {
      filters.active = true;
    } else if (activeParam === 'false') {
      filters.active = false;
    }

    try {
      const codes = await listPromoCodes(filters);
      return res.status(200).json(codes);
    } catch (error) {
      if (error instanceof PromoError) {
        return res.status(error.status).json({ message: error.message });
      }
      throw error;
    }
  }

  if (req.method === 'POST') {
    const { code, discountType, discountValue, applicableProductIds, active, ...rest } =
      req.body || {};

    if (!code || !discountType || discountValue === undefined) {
      return res
        .status(400)
        .json({ message: 'code, discountType, and discountValue are required' });
    }

    const validDiscountTypes = ['percentage', 'fixed_amount', 'free_trial_days'] as const;
    if (!validDiscountTypes.includes(discountType)) {
      return res.status(400).json({
        message: "discountType must be one of 'percentage', 'fixed_amount', or 'free_trial_days'",
      });
    }

    if (typeof discountValue !== 'number' || discountValue <= 0) {
      return res.status(400).json({ message: 'discountValue must be a positive number' });
    }

    try {
      const doc = await createPromoCode({
        code,
        discountType,
        discountValue,
        applicableProductIds: applicableProductIds ?? [],
        active: active !== undefined ? active : true,
        ...rest,
      });
      return res.status(201).json(doc);
    } catch (error) {
      if (error instanceof PromoError) {
        return res.status(error.status).json({ message: error.message });
      }
      throw error;
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
