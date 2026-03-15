import type { NextApiResponse } from 'next';
import { MongoServerError, ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

const DUPLICATE_FIELD_LABELS: Record<string, string> = {
  clientId: 'client',
  title: 'title',
  type: 'type',
  url: 'URL',
  version: 'version',
};

function getDuplicateDeliverableMessage(error: MongoServerError) {
  const keyPattern = (error as MongoServerError & { keyPattern?: Record<string, unknown> }).keyPattern;
  const fields = Object.keys(keyPattern || {}).map((field) => DUPLICATE_FIELD_LABELS[field] || field);

  if (fields.length === 1) {
    return `Create deliverable failed: a deliverable with the same ${fields[0]} already exists.`;
  }

  if (fields.length > 1) {
    return `Create deliverable failed: a deliverable with the same ${fields.join(', ')} already exists.`;
  }

  return 'Create deliverable failed: a matching deliverable already exists.';
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
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
      if (!['download', 'link', 'ux', 'html'].includes(type)) {
        return res.status(400).json({ message: 'type must be download, link, ux, or html' });
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
  } catch (error: unknown) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return res.status(409).json({
        message: getDuplicateDeliverableMessage(error),
        code: 'DUPLICATE_DELIVERABLE',
      });
    }

    console.error('Deliverables API failed:', error);
    const action = req.method === 'GET' ? 'Load deliverables' : 'Create deliverable';
    const details = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ message: `${action} failed: ${details}` });
  }
}

export default withAuth(handler);
