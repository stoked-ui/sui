import type { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const db = await getDb();
  const collection = db.collection('invoices');

  if (req.method === 'GET') {
    const { clientId } = req.query;
    if (!clientId || typeof clientId !== 'string' || !ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: 'clientId query param is required' });
    }
    // Client-role users can only view their own client's invoices
    if (req.user.role === 'client' && req.user.clientId !== clientId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const invoices = await collection
      .find({ clientId: new ObjectId(clientId) })
      .sort({ invoiceDate: -1 })
      .toArray();
    return res.status(200).json(invoices);
  }

  if (req.method === 'POST') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { clientId, invoiceDate, periodStart, periodEnd, weeks, totalHours, status, notes } = req.body || {};
    if (!clientId || !invoiceDate || !periodStart || !periodEnd || !weeks || totalHours === undefined) {
      return res.status(400).json({ message: 'clientId, invoiceDate, periodStart, periodEnd, weeks, and totalHours are required' });
    }
    if (status && !['draft', 'sent', 'paid'].includes(status)) {
      return res.status(400).json({ message: 'status must be draft, sent, or paid' });
    }
    const now = new Date();
    const doc = {
      clientId: new ObjectId(clientId),
      invoiceDate: new Date(invoiceDate),
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      weeks,
      totalHours,
      status: status || 'draft',
      notes: notes || undefined,
      createdAt: now,
      updatedAt: now,
    };
    const result = await collection.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
