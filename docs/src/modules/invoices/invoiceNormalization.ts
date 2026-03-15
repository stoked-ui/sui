import { Db, ObjectId } from 'mongodb';

type InvoiceStatus = 'draft' | 'sent' | 'paid';

type MaybeDate = Date | string | undefined | null;

type InvoiceLineItem = {
  description: string;
  hours: number;
};

type NormalizedInvoiceWeek = {
  weekStart?: string;
  weekEnd?: string;
  dateRange?: string;
  lineItems: InvoiceLineItem[];
  weekTotalHours: number;
};

type LegacyInvoiceTask = {
  description?: string;
  hours?: number;
};

type LegacyInvoiceWeek = {
  weekStart?: string;
  weekEnd?: string;
  dateRange?: string;
  totalHours?: number;
  weekTotalHours?: number;
  tasks?: LegacyInvoiceTask[];
  lineItems?: InvoiceLineItem[];
};

type LegacyInvoiceData = {
  customer?: string;
  startDate?: string;
  endDate?: string;
  text?: string;
  totalHours?: number;
  weeks?: LegacyInvoiceWeek[];
};

type LegacyInvoiceEnvelope = {
  id?: string;
  configId?: string;
  generatedAt?: string;
  sentAt?: string;
  invoiceData?: LegacyInvoiceData;
};

type FlatInvoicePayload = {
  sourceId?: string;
  id?: string;
  configId?: string;
  customer?: string;
  generatedAt?: MaybeDate;
  sentAt?: MaybeDate;
  clientId?: string;
  invoiceDate?: MaybeDate;
  periodStart?: MaybeDate;
  periodEnd?: MaybeDate;
  weeks?: LegacyInvoiceWeek[];
  totalHours?: number;
  status?: string;
  notes?: string | null;
};

type InvoiceLike = LegacyInvoiceEnvelope & FlatInvoicePayload;

export type NormalizedInvoiceInput = {
  sourceId?: string;
  configId?: string;
  customer?: string;
  generatedAt?: Date;
  sentAt?: Date;
  clientId: string;
  invoiceDate: Date;
  periodStart: Date;
  periodEnd: Date;
  weeks: NormalizedInvoiceWeek[];
  totalHours: number;
  status: InvoiceStatus;
  notes: string | null;
};

function asDate(value: MaybeDate) {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

function asIso(value: MaybeDate) {
  const parsed = asDate(value);
  return parsed ? parsed.toISOString() : undefined;
}

function normalizeLineItems(week: LegacyInvoiceWeek) {
  if (Array.isArray(week.lineItems)) {
    return week.lineItems
      .filter((item) => item && typeof item.description === 'string')
      .map((item) => ({
        description: item.description.trim(),
        hours: Number(item.hours) || 0,
      }));
  }

  if (Array.isArray(week.tasks)) {
    return week.tasks
      .filter((task) => task && typeof task.description === 'string')
      .map((task) => ({
        description: task.description!.trim(),
        hours: Number(task.hours) || 0,
      }));
  }

  return [];
}

export function normalizeInvoiceWeek(week: LegacyInvoiceWeek) {
  const lineItems = normalizeLineItems(week);
  const computedHours = lineItems.reduce((sum, item) => sum + item.hours, 0);

  return {
    weekStart: asIso(week.weekStart),
    weekEnd: asIso(week.weekEnd),
    dateRange: typeof week.dateRange === 'string' ? week.dateRange : undefined,
    lineItems,
    weekTotalHours: Number(week.weekTotalHours ?? week.totalHours ?? computedHours) || 0,
  };
}

function toStatus(value: string | undefined, sentAt?: Date): InvoiceStatus {
  if (value === 'draft' || value === 'sent' || value === 'paid') {
    return value;
  }

  return sentAt ? 'sent' : 'draft';
}

function deriveInvoiceFields(body: InvoiceLike) {
  const envelope = body.invoiceData;
  const weeks = Array.isArray(envelope?.weeks) ? envelope!.weeks! : Array.isArray(body.weeks) ? body.weeks! : [];
  const normalizedWeeks = weeks.map(normalizeInvoiceWeek);
  const firstWeek = weeks[0];
  const lastWeek = weeks[weeks.length - 1];
  const generatedAt = asDate(body.generatedAt);
  const sentAt = asDate(body.sentAt);
  const invoiceDate = asDate(body.invoiceDate) || generatedAt || sentAt;
  const periodStart = asDate(body.periodStart) || asDate(firstWeek?.weekStart) || asDate(envelope?.startDate);
  const periodEnd = asDate(body.periodEnd) || asDate(lastWeek?.weekEnd) || asDate(envelope?.endDate);
  const totalHours = Number(body.totalHours ?? envelope?.totalHours ?? normalizedWeeks.reduce((sum, week) => sum + week.weekTotalHours, 0)) || 0;
  const notes = typeof body.notes === 'string'
    ? body.notes
    : typeof envelope?.text === 'string'
      ? envelope.text
      : null;

  return {
    sourceId: typeof body.sourceId === 'string' ? body.sourceId : typeof body.id === 'string' ? body.id : undefined,
    configId: typeof body.configId === 'string' ? body.configId : undefined,
    customer: typeof body.customer === 'string' ? body.customer : typeof envelope?.customer === 'string' ? envelope.customer : undefined,
    generatedAt,
    sentAt,
    invoiceDate,
    periodStart,
    periodEnd,
    weeks: normalizedWeeks,
    totalHours,
    status: toStatus(body.status, sentAt),
    notes,
  };
}

export function normalizeInvoiceInput(body: InvoiceLike) {
  const clientId = typeof body.clientId === 'string' ? body.clientId : '';
  const normalized = deriveInvoiceFields(body);

  if (!clientId || !ObjectId.isValid(clientId)) {
    return { error: 'Valid clientId is required' as const };
  }

  if (!normalized.invoiceDate || !normalized.periodStart || !normalized.periodEnd) {
    return { error: 'invoiceDate, periodStart, and periodEnd are required' as const };
  }

  if (!normalized.weeks.length) {
    return { error: 'At least one invoice week is required' as const };
  }

  const value: NormalizedInvoiceInput = {
    ...normalized,
    clientId,
    invoiceDate: normalized.invoiceDate,
    periodStart: normalized.periodStart,
    periodEnd: normalized.periodEnd,
  };

  return { value };
}

export function normalizeInvoiceDocument(doc: Record<string, any>) {
  const normalized = normalizeInvoiceInput({
    ...doc,
    clientId: typeof doc.clientId === 'string' ? doc.clientId : doc.clientId?.toString?.(),
  });

  if ('error' in normalized) {
    return {
      ...doc,
      clientId: doc.clientId?.toString?.() ?? doc.clientId,
    };
  }

  return {
    ...doc,
    clientId: normalized.value.clientId,
    sourceId: normalized.value.sourceId,
    configId: normalized.value.configId,
    customer: normalized.value.customer,
    generatedAt: normalized.value.generatedAt,
    sentAt: normalized.value.sentAt,
    invoiceDate: normalized.value.invoiceDate,
    periodStart: normalized.value.periodStart,
    periodEnd: normalized.value.periodEnd,
    weeks: normalized.value.weeks,
    totalHours: normalized.value.totalHours,
    status: normalized.value.status,
    notes: normalized.value.notes,
  };
}

export async function ensureInvoicesCollectionCompatibility(db: Db) {
  const collection = db.collection('invoices');
  const indexes = await collection.indexes();
  const paymentsIndex = indexes.find((index) => index.name === 'payments.transactionHash_1');

  if (paymentsIndex && paymentsIndex.unique && !paymentsIndex.partialFilterExpression) {
    await collection.dropIndex('payments.transactionHash_1');
    await collection.createIndex(
      { 'payments.transactionHash': 1 },
      {
        name: 'payments.transactionHash_1',
        unique: true,
        partialFilterExpression: {
          'payments.transactionHash': { $exists: true, $type: 'string' },
        },
      },
    );
  }

  const sourceIdIndex = indexes.find((index) => index.name === 'sourceId_1');
  if (!sourceIdIndex) {
    await collection.createIndex(
      { sourceId: 1 },
      {
        name: 'sourceId_1',
        unique: true,
        partialFilterExpression: {
          sourceId: { $exists: true, $type: 'string' },
        },
      },
    );
  }
}

export function buildInvoiceDuplicateQuery(input: NormalizedInvoiceInput) {
  const periodMatch = {
    clientId: new ObjectId(input.clientId),
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    totalHours: input.totalHours,
  };

  if (input.sourceId) {
    return {
      $or: [
        { sourceId: input.sourceId },
        periodMatch,
      ],
    };
  }

  return periodMatch;
}
