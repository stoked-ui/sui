import type { NextApiRequest, NextApiResponse } from 'next';
import {
  validatePromoCode,
  PromoError,
} from 'docs/src/modules/promo/promoStore';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, productId } = req.body || {};

  if (!code || typeof code !== 'string' || code.trim() === '') {
    return res.status(400).json({ valid: false, message: 'code is required' });
  }

  if (!productId || typeof productId !== 'string' || productId.trim() === '') {
    return res.status(400).json({ valid: false, message: 'productId is required' });
  }

  try {
    const promo = await validatePromoCode(code, productId);
    return res.status(200).json({
      valid: true,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      code: promo.code,
    });
  } catch (error) {
    if (error instanceof PromoError) {
      return res.status(error.status).json({
        valid: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      valid: false,
      message: 'Internal server error',
    });
  }
}

export default handler;
