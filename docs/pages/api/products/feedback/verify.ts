import type { NextApiRequest, NextApiResponse } from 'next';
import { setAuthSession } from 'docs/src/modules/auth/session';
import { verifyProductFeedbackRegistration } from 'docs/src/modules/products/feedbackStore';

function statusForError(message: string) {
  if (
    message === 'Email already registered'
    || message === 'No verification request found for this email'
    || message === 'Invalid verification code'
    || message === 'Verification code expired. Request a new one.'
    || message === 'Verification code must be 6 digits'
    || message === 'Enter a valid email address'
  ) {
    return 400;
  }

  return 500;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, code } = req.body || {};
    const result = await verifyProductFeedbackRegistration({
      email: typeof email === 'string' ? email : '',
      code: typeof code === 'string' ? code : '',
    });
    setAuthSession(res, result);

    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to verify email';
    return res.status(statusForError(message)).json({ message });
  }
}
