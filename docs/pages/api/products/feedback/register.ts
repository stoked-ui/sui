import type { NextApiRequest, NextApiResponse } from 'next';
import { startProductFeedbackRegistration } from 'docs/src/modules/products/feedbackStore';

function statusForError(message: string) {
  if (
    message === 'Email already registered'
    || message.startsWith('Please wait ')
    || message.startsWith('Name must be')
    || message.startsWith('Enter a valid email')
    || message.startsWith('Password must be')
  ) {
    return message.startsWith('Please wait ') ? 429 : 400;
  }

  return 500;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body || {};
    const result = await startProductFeedbackRegistration({
      name: typeof name === 'string' ? name : '',
      email: typeof email === 'string' ? email : '',
      password: typeof password === 'string' ? password : '',
    });

    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start verification';
    return res.status(statusForError(message)).json({ message });
  }
}
