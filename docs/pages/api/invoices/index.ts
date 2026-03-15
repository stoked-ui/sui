import type { NextApiResponse } from 'next';
import { MongoServerError, ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import {
  buildInvoiceDuplicateQuery,
  ensureInvoicesCollectionCompatibility,
  normalizeInvoiceDocument,
  normalizeInvoiceInput,
} from 'docs/src/modules/invoices/invoiceNormalization';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const db = await getDb();
  const collection = db.collection('invoices');

  if (req.method === 'GET') {
    const { clientId } = req.query;

    // Admins can list all invoices (no clientId) or filter by clientId
    if (!clientId || typeof clientId !== 'string') {
      if (req.user.role !== 'admin') {
        return res.status(400).json({ message: 'clientId query param is required' });
      }
      const invoices = await collection.find({}).sort({ invoiceDate: -1 }).toArray();
      return res.status(200).json(invoices.map((invoice) => normalizeInvoiceDocument(invoice)));
    }

    if (!ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: 'Invalid clientId' });
    }
    // Client-role users can only view their own client's invoices
    if (req.user.role === 'client' && req.user.clientId !== clientId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const invoices = await collection
      .find({ clientId: new ObjectId(clientId) })
      .sort({ invoiceDate: -1 })
      .toArray();
    return res.status(200).json(invoices.map((invoice) => normalizeInvoiceDocument(invoice)));
  }

  if (req.method === 'POST') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const normalized = normalizeInvoiceInput(req.body || {});
    if ('error' in normalized) {
      return res.status(400).json({ message: normalized.error });
    }

    try {
      await ensureInvoicesCollectionCompatibility(db);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed preparing invoice collection';
      return res.status(500).json({ message });
    }
    const duplicate = await collection.findOne(buildInvoiceDuplicateQuery(normalized.value));
    if (duplicate) {
      return res.status(409).json({
        message: 'Invoice already exists',
        invoice: normalizeInvoiceDocument(duplicate),
      });
    }

    const now = new Date();
    const doc = {
      sourceId: normalized.value.sourceId,
      configId: normalized.value.configId,
      customer: normalized.value.customer,
      generatedAt: normalized.value.generatedAt,
      sentAt: normalized.value.sentAt,
      clientId: new ObjectId(normalized.value.clientId),
      invoiceDate: normalized.value.invoiceDate,
      periodStart: normalized.value.periodStart,
      periodEnd: normalized.value.periodEnd,
      weeks: normalized.value.weeks,
      totalHours: normalized.value.totalHours,
      status: normalized.value.status,
      notes: normalized.value.notes,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const result = await collection.insertOne(doc);
      return res.status(201).json(normalizeInvoiceDocument({ _id: result.insertedId, ...doc }));
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        return res.status(409).json({ message: 'Invoice already exists' });
      }

      const message = error instanceof Error ? error.message : 'Failed creating invoice';
      return res.status(500).json({ message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
