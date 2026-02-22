import type { NextApiResponse } from 'next';
import * as bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const db = await getDb();
  const collection = db.collection('users');

  if (req.method === 'GET') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const filter: Record<string, unknown> = {};
    const { clientId } = req.query;
    if (clientId && typeof clientId === 'string' && ObjectId.isValid(clientId)) {
      filter.clientId = new ObjectId(clientId);
    }
    const users = await collection
      .find(filter)
      .project({ passwordHash: 0 })
      .sort({ createdAt: -1 })
      .toArray();
    return res.status(200).json(users);
  }

  if (req.method === 'POST') {
    const { email, password, name, role, clientId } = req.body || {};
    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    // Client-role users can only create users for their own org
    if (req.user.role === 'client') {
      if (role === 'admin') {
        return res.status(403).json({ message: 'Cannot create admin users' });
      }
      if (clientId && clientId !== req.user.clientId) {
        return res.status(403).json({ message: 'Can only create users for your own organization' });
      }
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await collection.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const now = new Date();
    const doc: Record<string, unknown> = {
      email: normalizedEmail,
      name,
      role: role || 'client',
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    if (password) {
      doc.passwordHash = await bcrypt.hash(password, 10);
    }
    const resolvedClientId = clientId || (req.user.role === 'client' ? req.user.clientId : undefined);
    if (resolvedClientId) {
      doc.clientId = new ObjectId(resolvedClientId);
    }

    const result = await collection.insertOne(doc);
    const { passwordHash: _, ...userWithoutPassword } = doc;
    return res.status(201).json({ _id: result.insertedId, ...userWithoutPassword });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
