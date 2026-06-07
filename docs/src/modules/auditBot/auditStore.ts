import { randomUUID } from 'crypto';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import type { PlaybookId } from './playbooks';
import type { AuditLeadRecord, AuditMessage, AuditReport } from './types';

const AUDIT_LEADS_COLLECTION = 'auditLeads';
const AUDIT_MESSAGES_COLLECTION = 'auditMessages';

interface AuditLeadDoc extends AuditLeadRecord {
  _id?: ObjectId;
}

interface AuditMessageDoc {
  _id?: ObjectId;
  sessionId: string;
  playbook: PlaybookId;
  role: 'user' | 'assistant';
  content: string;
  sequence: number;
  createdAt: Date;
}

export function newSessionId(): string {
  return randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Create or upsert a lead record at the start of a session. */
export async function ensureLead(
  sessionId: string,
  playbook: PlaybookId,
): Promise<void> {
  const db = await getDb();
  const collection = db.collection<AuditLeadDoc>(AUDIT_LEADS_COLLECTION);
  const existing = await collection.findOne({ sessionId });
  if (existing) {
    return;
  }
  const now = nowIso();
  await collection.insertOne({
    sessionId,
    playbook,
    transcript: [],
    bookedCall: false,
    createdAt: now,
    updatedAt: now,
  });
}

export async function appendMessage(
  sessionId: string,
  playbook: PlaybookId,
  role: 'user' | 'assistant',
  content: string,
): Promise<void> {
  const db = await getDb();
  const messages = db.collection<AuditMessageDoc>(AUDIT_MESSAGES_COLLECTION);
  const seq = await messages.countDocuments({ sessionId });
  await messages.insertOne({
    sessionId,
    playbook,
    role,
    content,
    sequence: seq,
    createdAt: new Date(),
  });

  // Also append to the embedded transcript on the lead doc so a single
  // findOne gives you the whole conversation. Cap to last 200 turns.
  const leads = db.collection<AuditLeadDoc>(AUDIT_LEADS_COLLECTION);
  const message: AuditMessage = {
    role,
    content,
    createdAt: nowIso(),
  };
  await leads.updateOne(
    { sessionId },
    {
      $push: {
        transcript: { $each: [message], $slice: -200 },
      },
      $set: { updatedAt: nowIso() },
    },
  );
}

export async function saveReport(
  sessionId: string,
  report: AuditReport,
): Promise<void> {
  const db = await getDb();
  const leads = db.collection<AuditLeadDoc>(AUDIT_LEADS_COLLECTION);
  await leads.updateOne(
    { sessionId },
    { $set: { report, updatedAt: nowIso() } },
  );
}

export interface UpdateLeadFieldsInput {
  name?: string;
  email?: string;
  company?: string;
  companyUrl?: string;
  industry?: string;
  city?: string;
  bookedCall?: boolean;
}

export async function updateLeadFields(
  sessionId: string,
  fields: UpdateLeadFieldsInput,
): Promise<void> {
  const db = await getDb();
  const leads = db.collection<AuditLeadDoc>(AUDIT_LEADS_COLLECTION);
  const set: Record<string, unknown> = { updatedAt: nowIso() };
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      set[key] = value;
    }
  }
  await leads.updateOne({ sessionId }, { $set: set });
}

/**
 * Atomically claim the right to send the report email for this session.
 * Returns true exactly once per lead — the chat path (model calls save_lead
 * with an email) and the form path (visitor submits the capture box) can both
 * fire, and the visitor should not get the report twice.
 */
export async function tryMarkReportEmailed(sessionId: string): Promise<boolean> {
  const db = await getDb();
  const leads = db.collection<AuditLeadDoc>(AUDIT_LEADS_COLLECTION);
  const result = await leads.findOneAndUpdate(
    { sessionId, reportEmailedAt: { $exists: false } },
    { $set: { reportEmailedAt: nowIso(), updatedAt: nowIso() } },
  );
  return result !== null;
}

/**
 * Release the email claim after a failed send so a later attempt (e.g. the
 * form path after a chat-path SES blip) can retry. Without this, a transient
 * mail failure would permanently burn the one-shot flag and the lead would
 * silently never receive their report.
 */
export async function unmarkReportEmailed(sessionId: string): Promise<void> {
  const db = await getDb();
  const leads = db.collection<AuditLeadDoc>(AUDIT_LEADS_COLLECTION);
  await leads.updateOne(
    { sessionId },
    { $unset: { reportEmailedAt: '' }, $set: { updatedAt: nowIso() } },
  );
}

/**
 * Claim the one-shot chat-completion Telegram ping. The model may call
 * save_lead on more than one turn; Brian should get one ping from the chat
 * path. (The form path notifies unconditionally — it carries new contact info.)
 */
export async function tryMarkChatNotified(sessionId: string): Promise<boolean> {
  const db = await getDb();
  const leads = db.collection<AuditLeadDoc>(AUDIT_LEADS_COLLECTION);
  const result = await leads.findOneAndUpdate(
    { sessionId, chatNotifiedAt: { $exists: false } },
    { $set: { chatNotifiedAt: nowIso(), updatedAt: nowIso() } },
  );
  return result !== null;
}

export async function getLead(
  sessionId: string,
): Promise<AuditLeadRecord | null> {
  const db = await getDb();
  const leads = db.collection<AuditLeadDoc>(AUDIT_LEADS_COLLECTION);
  const lead = await leads.findOne({ sessionId });
  if (!lead) {
    return null;
  }
  const { _id: _omit, ...rest } = lead;
  return rest;
}
