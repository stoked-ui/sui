import type { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const db = await getDb();
  const collection = db.collection('deliverables');

  if (req.method === 'GET') {
    const { clientId } = req.query;
    if (!clientId || typeof clientId !== 'string' || !ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: 'clientId query param is required' });
    }
    // Client-role users can only view their own client's deliverables
    if (req.user.role === 'client' && req.user.clientId !== clientId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const deliverables = await collection
      .find({ clientId: new ObjectId(clientId) })
      .sort({ createdAt: -1 })
      .toArray();
    return res.status(200).json(deliverables);
  }

  if (req.method === 'POST') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { clientId, title, type, url, version } = req.body || {};
    if (!clientId || !title || !type || !url) {
      return res.status(400).json({ message: 'clientId, title, type, and url are required' });
    }
    if (!['download', 'link', 'ux'].includes(type)) {
      return res.status(400).json({ message: 'type must be download, link, or ux' });
    }
    const now = new Date();
    const doc = {
      clientId: new ObjectId(clientId),
      title,
      type,
      url,
      version: version || undefined,
      createdAt: now,
      updatedAt: now,
    };
    const result = await collection.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
