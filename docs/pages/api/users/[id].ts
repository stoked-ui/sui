import type { NextApiResponse } from 'next';
import * as bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  const db = await getDb();
  const collection = db.collection('users');
  const objectId = new ObjectId(id);

  if (req.method === 'GET') {
    // Admin can view any user; users can only view themselves
    if (req.user.role !== 'admin' && req.user.sub !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const user = await collection.findOne({ _id: objectId }, { projection: { passwordHash: 0 } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  }

  if (req.method === 'PATCH') {
    // Admin or self
    if (req.user.role !== 'admin' && req.user.sub !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { name, email, password, role, active, clientId, aliases } = req.body || {};
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email.toLowerCase();
    if (password) update.passwordHash = await bcrypt.hash(password, 10);
    // Only admins can change role, active status, clientId, and aliases
    if (req.user.role === 'admin') {
      if (role !== undefined) update.role = role;
      if (active !== undefined) update.active = active;
      if (clientId !== undefined) update.clientId = clientId ? new ObjectId(clientId) : undefined;
      if (aliases !== undefined) {
        update.aliases = Array.isArray(aliases)
          ? aliases.map((a: string) => a.toLowerCase().trim()).filter(Boolean)
          : [];
      }
    }

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: update },
      { returnDocument: 'after', projection: { passwordHash: 0 } },
    );
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(result);
  }

  if (req.method === 'DELETE') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const result = await collection.deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
