import { getDb } from 'docs/src/modules/db/mongodb';

const PROMO_CODES_COLLECTION = 'promo_codes';

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_trial_days';
  discountValue: number;
  applicableProductIds: string[];
  expiresAt?: Date;
  maxUses?: number;
  usedCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PromoError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function validatePromoCode(code: string, productId: string): Promise<PromoCode> {
  const db = await getDb();
  const collection = db.collection<PromoCode>(PROMO_CODES_COLLECTION);

  const promo = await collection.findOne({ code: code.toUpperCase() });
  if (!promo) {
    throw new PromoError(404, 'Promo code not found');
  }

  if (!promo.active) {
    throw new PromoError(400, 'Promo code is not active');
  }

  if (promo.expiresAt && new Date() > promo.expiresAt) {
    throw new PromoError(400, 'Promo code has expired');
  }

  if (promo.maxUses !== undefined && promo.usedCount >= promo.maxUses) {
    throw new PromoError(400, 'Promo code has reached maximum uses');
  }

  if (promo.applicableProductIds.length > 0 && !promo.applicableProductIds.includes(productId)) {
    throw new PromoError(400, 'Promo code is not applicable to this product');
  }

  return promo;
}

export async function applyPromoCode(code: string): Promise<void> {
  const db = await getDb();
  const collection = db.collection<PromoCode>(PROMO_CODES_COLLECTION);

  await collection.updateOne(
    { code: code.toUpperCase() },
    { $inc: { usedCount: 1 } },
  );
}

export async function createPromoCode(
  data: Omit<PromoCode, 'usedCount' | 'createdAt' | 'updatedAt'>,
): Promise<PromoCode> {
  const db = await getDb();
  const collection = db.collection<PromoCode>(PROMO_CODES_COLLECTION);

  const now = new Date();
  const doc: PromoCode = {
    ...data,
    code: data.code.toUpperCase(),
    usedCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await collection.insertOne(doc);
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new PromoError(409, 'A promo code with this code already exists');
    }
    throw error;
  }

  return doc;
}

export async function updatePromoCode(
  code: string,
  updates: Partial<Pick<PromoCode, 'active' | 'expiresAt' | 'maxUses' | 'discountValue' | 'applicableProductIds'>>,
): Promise<PromoCode> {
  const db = await getDb();
  const collection = db.collection<PromoCode>(PROMO_CODES_COLLECTION);

  const result = await collection.findOneAndUpdate(
    { code: code.toUpperCase() },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' },
  );

  if (!result) {
    throw new PromoError(404, 'Promo code not found');
  }

  return result;
}

export async function deletePromoCode(code: string): Promise<void> {
  const db = await getDb();
  const collection = db.collection<PromoCode>(PROMO_CODES_COLLECTION);

  const result = await collection.deleteOne({ code: code.toUpperCase() });

  if (result.deletedCount === 0) {
    throw new PromoError(404, 'Promo code not found');
  }
}

export async function listPromoCodes(
  filters?: { productId?: string; active?: boolean },
): Promise<PromoCode[]> {
  const db = await getDb();
  const collection = db.collection<PromoCode>(PROMO_CODES_COLLECTION);

  const query: Record<string, unknown> = {};

  if (filters?.productId !== undefined) {
    query.applicableProductIds = filters.productId;
  }

  if (filters?.active !== undefined) {
    query.active = filters.active;
  }

  return collection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();
}
