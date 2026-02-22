import type { NextApiResponse } from 'next';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const db = await getDb();
  const collection = db.collection('clients');

  if (req.method === 'GET') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const clients = await collection.find().sort({ createdAt: -1 }).toArray();
    return res.status(200).json(clients);
  }

  if (req.method === 'POST') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { name, contactEmail } = req.body || {};
    if (!name || !contactEmail) {
      return res.status(400).json({ message: 'Name and contactEmail are required' });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date();
    const doc = { name, slug, contactEmail, active: true, createdAt: now, updatedAt: now };
    const result = await collection.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
