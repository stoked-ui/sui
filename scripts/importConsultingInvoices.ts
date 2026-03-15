import fs from 'node:fs/promises';
import path from 'node:path';
import { MongoClient, ObjectId } from 'mongodb';
import {
  buildInvoiceDuplicateQuery,
  ensureInvoicesCollectionCompatibility,
  normalizeInvoiceInput,
  type NormalizedInvoiceInput,
} from '../docs/src/modules/invoices/invoiceNormalization';

type Options = {
  clientId: string;
  configId?: string;
  dir: string;
  deleteInvoiceId?: string;
  dryRun: boolean;
};

type Candidate = {
  filePath: string;
  normalized: NormalizedInvoiceInput;
};

function usage() {
  console.error([
    'Usage:',
    '  pnpm exec tsx scripts/importConsultingInvoices.ts --clientId <id> --dir <path> [--configId <id>] [--deleteInvoiceId <id>] [--dryRun]',
  ].join('\n'));
}

function parseArgs(argv: string[]): Options | null {
  const options: Partial<Options> = {
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--dryRun') {
      options.dryRun = true;
      continue;
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      console.error(`Missing value for ${arg}`);
      return null;
    }

    if (arg === '--clientId') {
      options.clientId = value;
    } else if (arg === '--configId') {
      options.configId = value;
    } else if (arg === '--dir') {
      options.dir = value;
    } else if (arg === '--deleteInvoiceId') {
      options.deleteInvoiceId = value;
    } else {
      console.error(`Unknown argument: ${arg}`);
      return null;
    }

    index += 1;
  }

  if (!options.clientId || !options.dir) {
    return null;
  }

  return options as Options;
}

function getTimestamp(value?: Date) {
  return value instanceof Date ? value.getTime() : Number.NEGATIVE_INFINITY;
}

function compareCandidates(next: Candidate, current: Candidate) {
  const nextSentAt = getTimestamp(next.normalized.sentAt);
  const currentSentAt = getTimestamp(current.normalized.sentAt);

  if (nextSentAt !== currentSentAt) {
    return nextSentAt - currentSentAt;
  }

  const nextGeneratedAt = getTimestamp(next.normalized.generatedAt);
  const currentGeneratedAt = getTimestamp(current.normalized.generatedAt);

  if (nextGeneratedAt !== currentGeneratedAt) {
    return nextGeneratedAt - currentGeneratedAt;
  }

  return next.filePath.localeCompare(current.filePath);
}

function buildPeriodKey(invoice: NormalizedInvoiceInput) {
  return [
    invoice.periodStart.toISOString(),
    invoice.periodEnd.toISOString(),
    String(invoice.totalHours),
  ].join('::');
}

async function loadCandidates(options: Options) {
  const dirPath = path.resolve(options.dir);
  const entries = await fs.readdir(dirPath);
  const candidatesByPeriod = new Map<string, Candidate>();

  for (const entry of entries.sort()) {
    if (!entry.endsWith('.json')) {
      continue;
    }

    const filePath = path.join(dirPath, entry);
    const raw = JSON.parse(await fs.readFile(filePath, 'utf8')) as Record<string, unknown>;

    if (options.configId && raw.configId !== options.configId) {
      continue;
    }

    const normalized = normalizeInvoiceInput({
      ...raw,
      clientId: options.clientId,
    });

    if ('error' in normalized) {
      throw new Error(`Failed normalizing ${filePath}: ${normalized.error}`);
    }

    const candidate = {
      filePath,
      normalized: normalized.value,
    };
    const key = buildPeriodKey(candidate.normalized);
    const existing = candidatesByPeriod.get(key);

    if (!existing || compareCandidates(candidate, existing) > 0) {
      candidatesByPeriod.set(key, candidate);
    }
  }

  return Array.from(candidatesByPeriod.values()).sort(
    (left, right) => left.normalized.periodStart.getTime() - right.normalized.periodStart.getTime(),
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options) {
    usage();
    process.exitCode = 1;
    return;
  }

  if (!ObjectId.isValid(options.clientId)) {
    throw new Error('clientId must be a valid ObjectId');
  }

  if (options.deleteInvoiceId && !ObjectId.isValid(options.deleteInvoiceId)) {
    throw new Error('deleteInvoiceId must be a valid ObjectId');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  const candidates = await loadCandidates(options);
  if (candidates.length === 0) {
    console.log('No invoice files matched the provided filters.');
    return;
  }

  console.log(`Prepared ${candidates.length} invoice(s) for import from ${path.resolve(options.dir)}`);
  for (const candidate of candidates) {
    console.log(`- ${candidate.normalized.sourceId ?? path.basename(candidate.filePath)} ${candidate.normalized.periodStart.toISOString()} -> ${candidate.normalized.periodEnd.toISOString()} ${candidate.normalized.totalHours}h`);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  try {
    const db = client.db();
    const collection = db.collection('invoices');

    if (!options.dryRun) {
      await ensureInvoicesCollectionCompatibility(db);
    }

    if (options.deleteInvoiceId) {
      if (options.dryRun) {
        console.log(`Dry run: would delete invoice ${options.deleteInvoiceId}`);
      } else {
        const result = await collection.deleteOne({ _id: new ObjectId(options.deleteInvoiceId) });
        console.log(`Deleted draft invoice ${options.deleteInvoiceId}: ${result.deletedCount === 1 ? 'yes' : 'not found'}`);
      }
    }

    let insertedCount = 0;
    let skippedCount = 0;

    for (const candidate of candidates) {
      const duplicate = await collection.findOne(buildInvoiceDuplicateQuery(candidate.normalized));
      if (duplicate) {
        skippedCount += 1;
        console.log(`Skipped ${candidate.normalized.sourceId ?? path.basename(candidate.filePath)}: already present as ${String(duplicate._id)}`);
        continue;
      }

      if (options.dryRun) {
        insertedCount += 1;
        console.log(`Dry run: would insert ${candidate.normalized.sourceId ?? path.basename(candidate.filePath)}`);
        continue;
      }

      const now = new Date();
      await collection.insertOne({
        sourceId: candidate.normalized.sourceId,
        configId: candidate.normalized.configId,
        customer: candidate.normalized.customer,
        generatedAt: candidate.normalized.generatedAt,
        sentAt: candidate.normalized.sentAt,
        clientId: new ObjectId(candidate.normalized.clientId),
        invoiceDate: candidate.normalized.invoiceDate,
        periodStart: candidate.normalized.periodStart,
        periodEnd: candidate.normalized.periodEnd,
        weeks: candidate.normalized.weeks,
        totalHours: candidate.normalized.totalHours,
        status: candidate.normalized.status,
        notes: candidate.normalized.notes,
        createdAt: now,
        updatedAt: now,
      });
      insertedCount += 1;
      console.log(`Inserted ${candidate.normalized.sourceId ?? path.basename(candidate.filePath)}`);
    }

    const finalInvoices = await collection
      .find({ clientId: new ObjectId(options.clientId) })
      .sort({ periodStart: 1, invoiceDate: 1 })
      .project({ sourceId: 1, status: 1, totalHours: 1, periodStart: 1, periodEnd: 1 })
      .toArray();

    console.log(`Import summary: ${insertedCount} inserted, ${skippedCount} skipped`);
    console.log(`Client now has ${finalInvoices.length} invoice(s) in ${db.databaseName}`);
    for (const invoice of finalInvoices) {
      console.log(`  ${String(invoice._id)} ${invoice.sourceId ?? '(no sourceId)'} ${invoice.status} ${invoice.totalHours}h ${invoice.periodStart?.toISOString?.()} -> ${invoice.periodEnd?.toISOString?.()}`);
    }
  } finally {
    await client.close();
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
