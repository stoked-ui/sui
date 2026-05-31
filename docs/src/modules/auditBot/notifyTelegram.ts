import { PLAYBOOKS, type PlaybookId } from './playbooks';
import type { AuditLeadRecord, AuditReport } from './types';

interface TelegramConfig {
  botToken: string;
  chatId: string;
  threadId?: number;
}

function readTelegramConfig(): TelegramConfig | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_SUPPORT_CHAT_ID ?? process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    return null;
  }
  const threadRaw = process.env.TELEGRAM_AUDIT_THREAD_ID
    ?? process.env.TELEGRAM_SUPPORT_THREAD_ID
    ?? process.env.TELEGRAM_THREAD_ID;
  if (threadRaw) {
    const parsed = Number(threadRaw);
    if (Number.isInteger(parsed) && parsed > 0) {
      return { botToken, chatId, threadId: parsed };
    }
  }
  return { botToken, chatId };
}

function formatReportSummary(report: AuditReport): string {
  const header = `${report.company || 'Unknown company'} — ${report.one_liner}`;
  if (report.playbook === 'ai-readiness') {
    return [
      header,
      `Readiness: ${report.readiness}`,
      ...report.top_opportunities.map(
        (o, i) =>
          `${i + 1}. ${o.title} (${o.effort}, ${o.rough_cost_band}, save ${o.hours_saved_per_month} hrs/mo)`,
      ),
      `Brian would start with: ${report.what_brian_would_do_first}`,
    ].join('\n');
  }
  if (report.playbook === 'cloud-cost') {
    return [
      header,
      `Cloud: ${report.cloud} | Spend: ${report.spend_tier} | Est. savings: ${report.estimated_savings_band}`,
      ...report.top_opportunities.map(
        (o, i) =>
          `${i + 1}. ${o.title} — ${o.monthly_savings_band}/mo (${o.effort}, risk: ${o.risk_level})`,
      ),
      `Brian would start with: ${report.what_brian_would_do_first}`,
    ].join('\n');
  }
  // security
  return [
    header,
    `Posture: ${report.current_posture} | Compliance: ${report.compliance_pressure}`,
    ...report.top_findings.map(
      (f, i) =>
        `${i + 1}. [${f.severity.toUpperCase()}] ${f.title} (${f.effort}, ${f.cost_band})`,
    ),
    `Brian would start with: ${report.what_brian_would_do_first}`,
  ].join('\n');
}

export interface AuditNotificationInput {
  lead: AuditLeadRecord;
  origin?: string;
}

/**
 * Fires a Telegram notification when an audit is completed (lead saved).
 * Silent no-op if the bot is not configured.
 */
export async function notifyAuditCompletion(
  input: AuditNotificationInput,
): Promise<void> {
  const cfg = readTelegramConfig();
  if (!cfg) {
    return;
  }
  const { lead } = input;
  const playbookLabel = PLAYBOOKS[lead.playbook as PlaybookId]?.label ?? lead.playbook;
  const lines: string[] = [
    `New ${playbookLabel} lead`,
    `[session:${lead.sessionId}]`,
  ];
  if (lead.name) {
    lines.push(`Name: ${lead.name}`);
  }
  if (lead.email) {
    lines.push(`Email: ${lead.email}`);
  }
  if (lead.company) {
    lines.push(`Company: ${lead.company}`);
  }
  if (lead.companyUrl) {
    lines.push(`URL: ${lead.companyUrl}`);
  }
  if (lead.city) {
    lines.push(`City: ${lead.city}`);
  }
  if (lead.industry) {
    lines.push(`Industry: ${lead.industry}`);
  }
  if (lead.bookedCall) {
    lines.push('Booked call: yes');
  }
  if (input.origin) {
    lines.push(`Origin: ${input.origin}`);
  }
  if (lead.report) {
    lines.push('');
    lines.push(formatReportSummary(lead.report));
  }
  lines.push('');
  lines.push(`Transcript: ${lead.transcript.length} turns`);

  const body: Record<string, unknown> = {
    chat_id: cfg.chatId,
    text: lines.join('\n'),
  };
  if (cfg.threadId) {
    body.message_thread_id = cfg.threadId;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${cfg.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('audit notification telegram error', res.status, errText);
    }
  } catch (err) {
    console.error('audit notification telegram exception', err);
  }
}
