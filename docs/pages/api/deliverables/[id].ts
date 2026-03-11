import type { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid deliverable ID' });
  }

  const db = await getDb();
  const collection = db.collection('deliverables');
  const objectId = new ObjectId(id);

  if (req.method === 'GET') {
    const deliverable = await collection.findOne({ _id: objectId });
    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }
    const deliverableClientId = deliverable.clientId?.toString?.() ?? '';
    if (req.user.role === 'client' && req.user.clientId !== deliverableClientId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    return res.status(200).json(deliverable);
  }

  if (req.method === 'PATCH') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { title, type, url, version } = req.body || {};
    if (type !== undefined && !['download', 'link', 'ux', 'html'].includes(type)) {
      return res.status(400).json({ message: 'type must be download, link, ux, or html' });
    }
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) {
      update.title = title;
    }
    if (type !== undefined) {
      update.type = type;
    }
    if (url !== undefined) {
      update.url = url;
    }
    if (version !== undefined) {
      update.version = version;
    }

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: update },
      { returnDocument: 'after' },
    );
    if (!result) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }
    return res.status(200).json(result);
  }

  if (req.method === 'DELETE') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get the deliverable first to find its URL/path for local deletion
    const deliverable = await collection.findOne({ _id: objectId });
    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }

    // Local file deletion in development
    if (process.env.NODE_ENV === 'development' && deliverable.url?.startsWith('/static/deliverables/')) {
      try {
        const localPath = path.join(process.cwd(), 'public', deliverable.url);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      } catch (err) {
        console.error('Failed to delete local file:', err);
      }
    }

    const result = await collection.deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }
    return res.status(200).json({ message: 'Deliverable deleted' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
