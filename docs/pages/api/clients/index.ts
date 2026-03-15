import type { NextApiResponse } from 'next';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import {
  assignExistingContactUser,
  createContactUser,
  hydrateClientWithContact,
  hydrateClientsWithContacts,
} from 'docs/src/modules/clients/contactUser';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const db = await getDb();
  const collection = db.collection('clients');

  if (req.method === 'GET') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const clients = await collection.find().sort({ createdAt: -1 }).toArray();
    return res.status(200).json(await hydrateClientsWithContacts(db, clients));
  }

  if (req.method === 'POST') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { name, contactUserId, contactUser } = req.body || {};
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!contactUserId && !contactUser) {
      return res.status(400).json({ message: 'A contact user is required' });
    }
    if (contactUser && (!contactUser.name || !contactUser.email)) {
      return res.status(400).json({ message: 'New contact user requires name and email' });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date();
    const doc = { name, slug, active: true, createdAt: now, updatedAt: now };
    const result = await collection.insertOne(doc);
    const clientId = result.insertedId;

    try {
      const linkedUser = contactUser
        ? await createContactUser(db, clientId, contactUser)
        : await assignExistingContactUser(db, clientId, contactUserId);

      await collection.updateOne(
        { _id: clientId },
        {
          $set: {
            contactUserId: linkedUser._id,
            contactEmail: linkedUser.email,
            updatedAt: new Date(),
          },
        },
      );

      const createdClient = await collection.findOne({ _id: clientId });
      return res.status(201).json(await hydrateClientWithContact(db, createdClient));
    } catch (error) {
      await collection.deleteOne({ _id: clientId });
      const message = error instanceof Error ? error.message : 'Failed creating client contact';
      const status = message === 'Email already registered' ? 409 : 400;
      return res.status(status).json({ message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
