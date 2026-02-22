import type { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid invoice ID' });
  }

  const db = await getDb();
  const collection = db.collection('invoices');
  const objectId = new ObjectId(id);

  if (req.method === 'GET') {
    const invoice = await collection.findOne({ _id: objectId });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    // Client-role users can only view their own client's invoices
    if (req.user.role === 'client' && req.user.clientId !== String(invoice.clientId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    return res.status(200).json(invoice);
  }

  if (req.method === 'PATCH') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { invoiceDate, periodStart, periodEnd, weeks, totalHours, status, notes } = req.body || {};
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (invoiceDate !== undefined) update.invoiceDate = new Date(invoiceDate);
    if (periodStart !== undefined) update.periodStart = new Date(periodStart);
    if (periodEnd !== undefined) update.periodEnd = new Date(periodEnd);
    if (weeks !== undefined) update.weeks = weeks;
    if (totalHours !== undefined) update.totalHours = totalHours;
    if (status !== undefined) {
      if (!['draft', 'sent', 'paid'].includes(status)) {
        return res.status(400).json({ message: 'status must be draft, sent, or paid' });
      }
      update.status = status;
    }
    if (notes !== undefined) update.notes = notes;

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: update },
      { returnDocument: 'after' },
    );
    if (!result) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    return res.status(200).json(result);
  }

  if (req.method === 'DELETE') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const result = await collection.deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    return res.status(200).json({ message: 'Invoice deleted' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
