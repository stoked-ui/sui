import type { NextApiRequest, NextApiResponse } from 'next';
import { readOptionalAuthUser } from 'docs/src/modules/auth/withAuth';
import { submitProductFeedback } from 'docs/src/modules/products/feedbackStore';

function statusForError(message: string) {
  if (message === 'Missing or invalid authorization') {
    return 401;
  }

  if (
    message.startsWith('Select a valid product')
    || message.startsWith('Rating must be')
    || message.startsWith('Feedback message')
  ) {
    return 400;
  }

  return 500;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await readOptionalAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Missing or invalid authorization' });
  }

  try {
    const { productId, rating, message } = req.body || {};
    const result = await submitProductFeedback({
      productId: typeof productId === 'string' ? productId : '',
      rating: Number(rating),
      message: typeof message === 'string' ? message : '',
      user,
    });

    return res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit feedback';
    return res.status(statusForError(message)).json({ message });
  }
}
