import type { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { clientId } = req.query;
  if (!clientId || typeof clientId !== 'string' || !ObjectId.isValid(clientId)) {
    return res.status(400).json({ message: 'clientId query param is required' });
  }
  // Client-role users can only check their own client
  if (req.user.role === 'client' && req.user.clientId !== clientId) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const db = await getDb();
  const count = await db.collection('invoices').countDocuments({ clientId: new ObjectId(clientId) });

  return res.status(200).json({ hasInvoices: count > 0, count });
}

export default withAuth(handler);
