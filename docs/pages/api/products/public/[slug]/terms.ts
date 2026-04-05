import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from 'docs/src/modules/db/mongodb';
import { resolveTermsContent } from 'docs/src/modules/utils/legalLocalization';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { slug } = req.query;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Product slug is required' });
  }

  const db = await getDb();
  const product = await db.collection('products').findOne(
    { productId: slug, live: true, 'termsAndConditions.enabled': true },
    {
      projection: {
        name: 1,
        fullName: 1,
        url: 1,
        'termsAndConditions.content': 1,
        'termsAndConditions.localizedContent': 1,
      },
    },
  );

  if (!product) {
    return res.status(404).json({ message: 'Terms and conditions not found' });
  }

  const resolved = resolveTermsContent(
    product.termsAndConditions?.content,
    product.termsAndConditions?.localizedContent,
    Array.isArray(req.query.l) ? req.query.l[0] : req.query.l,
  );

  return res.status(200).json({
    availableLanguages: resolved.availableLanguages,
    fallbackToDefault: resolved.fallbackToDefault,
    language: resolved.language,
    productName: product.fullName || product.name,
    productUrl: product.url || `/products/${slug}`,
    title: 'Terms and Conditions',
    content: resolved.content,
  });
}
