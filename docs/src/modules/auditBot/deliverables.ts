import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import { PLAYBOOKS } from './playbooks';
import type { AuditLeadRecord } from './types';

const DELIVERABLES_COLLECTION = 'deliverables';

interface DeliverableDoc {
  _id?: ObjectId;
  clientId: ObjectId;
  title: string;
  type: 'download' | 'link' | 'ux' | 'html';
  url: string;
  version?: string;
  source?: string;
  payload?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromoteToDeliverableInput {
  lead: AuditLeadRecord;
  clientId: string;
  reportHtmlUrl: string;
  version?: string;
}

/**
 * Mirror a completed audit report into the client extranet as a deliverable.
 * Idempotent on (clientId, title, type, version) per the existing deliverables
 * unique constraints — if a matching deliverable exists, this updates the URL
 * and payload rather than throwing.
 */
export async function promoteAuditToDeliverable(
  input: PromoteToDeliverableInput,
): Promise<DeliverableDoc> {
  if (!ObjectId.isValid(input.clientId)) {
    throw new Error('clientId must be a valid ObjectId');
  }
  const db = await getDb();
  const deliverables = db.collection<DeliverableDoc>(DELIVERABLES_COLLECTION);

  const playbookLabel = PLAYBOOKS[input.lead.playbook]?.label ?? input.lead.playbook;
  const title = input.lead.report
    ? `${playbookLabel} — ${input.lead.report.company || 'Audit Report'}`
    : `${playbookLabel} — Conversation Transcript`;

  const filter = {
    clientId: new ObjectId(input.clientId),
    title,
    type: 'html' as const,
    version: input.version ?? 'v1',
  };

  const now = new Date();
  const update = {
    $set: {
      url: input.reportHtmlUrl,
      source: 'audit-bot',
      payload: {
        sessionId: input.lead.sessionId,
        playbook: input.lead.playbook,
        report: input.lead.report,
      },
      updatedAt: now,
    },
    $setOnInsert: {
      createdAt: now,
    },
  };

  const result = await deliverables.findOneAndUpdate(
    filter,
    update,
    { upsert: true, returnDocument: 'after' },
  );
  if (!result) {
    throw new Error('promote-to-deliverable failed');
  }
  return result;
}
