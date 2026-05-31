import type OpenAI from 'openai';
import type { PlaybookId } from './playbooks';

type ToolDefinition = OpenAI.Chat.Completions.ChatCompletionTool;

const FETCH_COMPANY_SITE: ToolDefinition = {
  type: 'function',
  function: {
    name: 'fetch_company_site',
    description:
      "Fetches the visitor's company website (about page, services, anything publicly listed) and returns the visible text. Call this as soon as the visitor shares a URL — it grounds the rest of the audit in their actual product.",
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The company URL. Accepts with or without scheme; normalize to https:// if missing.',
        },
      },
      required: ['url'],
    },
  },
};

const GENERATE_REPORT: ToolDefinition = {
  type: 'function',
  function: {
    name: 'generate_report',
    description:
      "Emit the final 1-page audit report as a structured object. Call this exactly once, when you have enough information to write the ranked top-3 opportunities. The frontend renders the report in the chat. The shape varies by playbook — follow the JSON schema in your system prompt exactly. Do not include a 'playbook' field in your output; the server stamps it from the active session.",
    parameters: {
      type: 'object',
      additionalProperties: true,
      properties: {
        company: { type: 'string' },
        one_liner: { type: 'string' },
      },
      required: ['company', 'one_liner'],
    },
  },
};

const EMAIL_REPORT: ToolDefinition = {
  type: 'function',
  function: {
    name: 'email_report',
    description:
      "Send the generated PDF report to the visitor's email and CC Brian. Only call after generate_report has been called and the visitor has provided an email address. Returns { sent: true } on success.",
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Visitor email.' },
        name: { type: 'string', description: 'Visitor name if known.' },
      },
      required: ['to'],
    },
  },
};

const SAVE_LEAD: ToolDefinition = {
  type: 'function',
  function: {
    name: 'save_lead',
    description:
      "Persist the lead + transcript + (optional) report to the database, and fire a Telegram notification to Brian. Call this once at the end of the conversation, regardless of whether the visitor booked a call or shared an email. Returns { saved: true, leadId }.",
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        company: { type: 'string' },
        companyUrl: { type: 'string' },
        industry: { type: 'string' },
        city: { type: 'string' },
        bookedCall: { type: 'boolean' },
      },
    },
  },
};

export const AUDIT_TOOLS: ToolDefinition[] = [
  FETCH_COMPANY_SITE,
  GENERATE_REPORT,
  EMAIL_REPORT,
  SAVE_LEAD,
];

export type ToolName =
  | 'fetch_company_site'
  | 'generate_report'
  | 'email_report'
  | 'save_lead';

export interface ToolExecutionContext {
  sessionId: string;
  playbook: PlaybookId;
}

export interface ToolExecutionResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

const MAX_SCRAPED_CHARS = 12_000;

async function executeFetchCompanySite(input: { url: string }): Promise<ToolExecutionResult> {
  try {
    const raw = (input.url || '').trim();
    if (!raw) {
      return { ok: false, error: 'url is required' };
    }
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const parsed = new URL(url);
    if (!/^https?:$/i.test(parsed.protocol)) {
      return { ok: false, error: 'only http/https URLs are supported' };
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (StokedAuditBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return { ok: false, error: `site returned ${response.status}` };
    }

    const html = await response.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    return {
      ok: true,
      data: {
        url,
        title,
        text: text.slice(0, MAX_SCRAPED_CHARS),
        truncated: text.length > MAX_SCRAPED_CHARS,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'fetch failed';
    return { ok: false, error: message };
  }
}

/**
 * Execute a tool call server-side. `generate_report`, `email_report`, and `save_lead`
 * are recognized as "caller-handled" — the conversation runner / API layer surfaces
 * those upstream rather than executing them here because they need session context.
 */
export async function executeTool(
  name: ToolName,
  input: Record<string, unknown>,
  _ctx: ToolExecutionContext,
): Promise<ToolExecutionResult> {
  switch (name) {
    case 'fetch_company_site':
      return executeFetchCompanySite(input as { url: string });
    case 'generate_report':
    case 'email_report':
    case 'save_lead':
      return { ok: true, data: { handled_by: 'caller', input } };
    default:
      return { ok: false, error: `unknown tool: ${name as string}` };
  }
}
