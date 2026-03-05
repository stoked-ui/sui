import type { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { createStripeProduct, createStripePrice } from 'docs/src/modules/license/stripeClient';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const db = await getDb();
  const collection = db.collection('products');
  const objectId = new ObjectId(id);

  if (req.method === 'GET') {
    const product = await collection.findOne({ _id: objectId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json(product);
  }

  if (req.method === 'PATCH') {
    const { 
      name, fullName, description, icon, url, live, 
      hideProductFeatures, prerelease, features,
      keyPrefix, price, currency, 
      licenseDurationDays, gracePeriodDays, trialDurationDays
    } = req.body || {};

    const existingProduct = await collection.findOne({ _id: objectId });
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

    // Handle price/currency change
    if ((price !== undefined && price !== existingProduct.price) || 
        (currency !== undefined && currency !== existingProduct.currency)) {
      try {
        const newPrice = price !== undefined ? price : existingProduct.price;
        const newCurrency = currency !== undefined ? currency : existingProduct.currency;
        
        let stripeProductId = existingProduct.stripeProductId;
        if (!stripeProductId) {
          // Create Stripe Product if it doesn't exist
          const stripeProduct = await createStripeProduct({
            productId: existingProduct.productId,
            name: existingProduct.name,
            description: existingProduct.description,
          });
          stripeProductId = stripeProduct.id;
          update.stripeProductId = stripeProductId;
        }

        const stripePrice = await createStripePrice({
          productId: existingProduct.productId,
          stripeProductId: stripeProductId,
          price: newPrice,
          currency: newCurrency,
        });

        update.price = newPrice;
        update.currency = newCurrency;
        update.stripePriceId = stripePrice.id;
      } catch (error: any) {
        console.error('Failed to update Stripe price:', error);
        return res.status(500).json({ message: `Failed to update Stripe price: ${error.message}` });
      }
    }

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: update },
      { returnDocument: 'after' },
    );

    return res.status(200).json(result);
  }

  if (req.method === 'DELETE') {
    // Cascade delete associated pages first
    const pagesCollection = db.collection('product_pages');
    await pagesCollection.deleteMany({ productId: id });
    const result = await collection.deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ message: 'Product deleted' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
