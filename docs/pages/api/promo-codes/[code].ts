import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import {
  updatePromoCode,
  deletePromoCode,
  listPromoCodes,
  PromoError,
} from 'docs/src/modules/promo/promoStore';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { code } = req.query;

  if (typeof code !== 'string') {
    return res.status(400).json({ message: 'Invalid promo code parameter' });
  }

  if (req.method === 'GET') {
    try {
      const codes = await listPromoCodes();
      const doc = codes.find((c) => c.code === code.toUpperCase());
      if (!doc) {
        return res.status(404).json({ message: 'Promo code not found' });
      }
      return res.status(200).json(doc);
    } catch (error) {
      if (error instanceof PromoError) {
        return res.status(error.status).json({ message: error.message });
      }
      throw error;
    }
  }

  if (req.method === 'PATCH') {
    try {
      const updated = await updatePromoCode(code, req.body || {});
      return res.status(200).json(updated);
    } catch (error) {
      if (error instanceof PromoError) {
        return res.status(error.status).json({ message: error.message });
      }
      throw error;
    }
  }

  if (req.method === 'DELETE') {
    try {
      await deletePromoCode(code);
      return res.status(200).json({ message: 'Promo code deleted' });
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
