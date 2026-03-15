import type { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import {
  assignExistingContactUser,
  createContactUser,
  hydrateClientWithContact,
} from 'docs/src/modules/clients/contactUser';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid client ID' });
  }

  const db = await getDb();
  const collection = db.collection('clients');

  // Support both ObjectId and slug-based lookup
  const isOid = ObjectId.isValid(id);
  const query = isOid ? { _id: new ObjectId(id) } : { slug: id };

  if (req.method === 'GET') {
    // Admin can view any client; client-role users can only view their own
    if (req.user.role === 'client' && req.user.clientId !== id && req.user.clientSlug !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const client = await collection.findOne(query);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    return res.status(200).json(await hydrateClientWithContact(db, client));
  }

  if (req.method === 'PATCH') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const client = await collection.findOne(query);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const { name, contactEmail, contactUserId, contactUser, active } = req.body || {};
    const update: Record<string, unknown> = { updatedAt: new Date() };
    const unset: Record<string, ''> = {};
    if (name !== undefined) update.name = name;
    if (contactEmail !== undefined) update.contactEmail = contactEmail;
    if (active !== undefined) update.active = active;

    try {
      if (contactUser && (!contactUser.name || !contactUser.email)) {
        return res.status(400).json({ message: 'New contact user requires name and email' });
      }

      let linkedUser:
        | { _id: ObjectId; email?: string }
        | null
        | undefined;

      if (contactUser) {
        linkedUser = await createContactUser(db, client._id, contactUser);
      } else if (contactUserId !== undefined) {
        linkedUser = contactUserId
          ? await assignExistingContactUser(db, client._id, contactUserId)
          : null;
      }

      if (linkedUser) {
        update.contactUserId = linkedUser._id;
        update.contactEmail = linkedUser.email || '';
      } else if (contactUserId === null || contactUserId === '') {
        unset.contactUserId = '';
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed updating client contact';
      const status = message === 'Email already registered' ? 409 : 400;
      return res.status(status).json({ message });
    }

    const result = await collection.findOneAndUpdate(
      query,
      {
        $set: update,
        ...(Object.keys(unset).length ? { $unset: unset } : {}),
      },
      { returnDocument: 'after' },
    );
    if (!result) {
      return res.status(404).json({ message: 'Client not found' });
    }
    return res.status(200).json(await hydrateClientWithContact(db, result));
  }

  if (req.method === 'DELETE') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const result = await collection.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    return res.status(200).json({ message: 'Client deleted' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
