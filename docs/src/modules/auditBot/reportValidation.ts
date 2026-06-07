import type { PlaybookId } from './playbooks';

export interface ReportShapeResult {
  ok: boolean;
  error?: string;
}

const COMMON_FIELDS = ['company', 'one_liner', 'what_brian_would_do_first', 'honest_caveat', 'next_step'] as const;

const LIST_FIELD: Record<PlaybookId, string> = {
  'ai-readiness': 'top_opportunities',
  'cloud-cost': 'top_opportunities',
  security: 'top_findings',
};

/**
 * Light runtime guard for model-generated report payloads. The runner used to
 * cast the model's generate_report args straight to AuditReport — a malformed
 * payload would then crash the chat UI (`.map` of undefined) or the mailer
 * (`.toUpperCase` of undefined) far from the source. This validates just
 * enough structure that every downstream consumer can render safely; the
 * runner feeds the error back to the model so it can retry with a correct shape.
 */
export function validateReportShape(playbook: PlaybookId, payload: unknown): ReportShapeResult {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, error: 'report must be a JSON object' };
  }
  const report = payload as Record<string, unknown>;

  for (const field of COMMON_FIELDS) {
    if (typeof report[field] !== 'string' || !(report[field] as string).trim()) {
      return { ok: false, error: `report is missing required string field "${field}"` };
    }
  }

  const listField = LIST_FIELD[playbook];
  const list = report[listField];
  if (!Array.isArray(list) || list.length < 3) {
    return { ok: false, error: `report must include "${listField}" with exactly 3 ranked entries` };
  }
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') {
      return { ok: false, error: `every "${listField}" entry must be an object with a title` };
    }
    if (typeof (entry as Record<string, unknown>).title !== 'string') {
      return { ok: false, error: `every "${listField}" entry must include a string title` };
    }
  }
  return { ok: true };
}
