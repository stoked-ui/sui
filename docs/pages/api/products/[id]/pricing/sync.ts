import type { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { createOrUpdateCatalogItem, SquareClientError } from 'docs/src/modules/square/squareClient';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  const db = await getDb();
  const collection = db.collection('products');
  const objectId = new ObjectId(id);

  const product = await collection.findOne({ _id: objectId });
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const pricing = product.pricing as {
    monthlyPriceCents?: number;
    currency?: string;
    squareCatalogItemId?: string;
    squareCatalogVariationId?: string;
  } | null | undefined;

  if (!pricing?.monthlyPriceCents) {
    return res.status(400).json({ message: 'Product has no pricing.monthlyPriceCents set' });
  }

  try {
    const { catalogItemId, catalogVariationId } = await createOrUpdateCatalogItem({
      productId: id,
      name: product.fullName ?? product.name ?? id,
      monthlyPriceCents: pricing.monthlyPriceCents,
      currency: pricing.currency ?? 'USD',
      existingItemId: pricing.squareCatalogItemId,
      existingVariationId: pricing.squareCatalogVariationId,
    });

    const updated = await collection.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          'pricing.squareCatalogItemId': catalogItemId,
          'pricing.squareCatalogVariationId': catalogVariationId,
          'pricing.syncedAt': new Date(),
        },
      },
      { returnDocument: 'after' },
    );

    if (!updated) {
      return res.status(404).json({ message: 'Product not found after update' });
    }

    return res.status(200).json(updated);
  } catch (error: unknown) {
    if (error instanceof SquareClientError) {
      return res.status(error.status).json({ message: error.message });
    }
    const message = error instanceof Error ? error.message : 'Unexpected error during Square sync';
    return res.status(500).json({ message });
  }
}

export default withAuth(handler);
