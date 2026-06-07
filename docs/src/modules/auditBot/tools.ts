import { lookup } from 'dns';
import { Agent, fetch as undiciFetch } from 'undici';
import type OpenAI from 'openai';
import type { PlaybookId } from './playbooks';
import {
  normalizeUrl,
  isBlockedHostname,
  isPrivateOrReservedIp,
  UnsafeUrlError,
} from './urlSafety';

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

// NOTE: there used to be an `email_report` tool here. It was removed because it
// was a dead stub — it told the model a PDF had been emailed when nothing was
// sent. Report emailing now actually happens server-side in
// /api/audit/save-lead (see auditMailer.ts) when the visitor submits an email,
// which is more reliable than hoping the model remembers to call a tool.

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
  SAVE_LEAD,
];

export type ToolName =
  | 'fetch_company_site'
  | 'generate_report'
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
const FETCH_TIMEOUT_MS = 6_000;
const MAX_REDIRECT_HOPS = 3;
const MAX_RESPONSE_BYTES = 2_000_000; // 2MB of HTML is plenty for an about page

/**
 * Reject the destination before any socket is opened. Visitor-supplied URLs
 * are an SSRF vector — without this, a visitor could point the bot at cloud
 * metadata (169.254.169.254), loopback services, or internal RFC-1918 hosts.
 * This is the cheap structural pre-check; the binding enforcement lives in the
 * ssrfSafeAgent lookup hook below, which validates the exact IP being dialed
 * (closing the DNS-rebinding TOCTOU a resolve-then-fetch check would leave).
 */
function assertSafeUrlShape(url: URL): void {
  const hostname = url.hostname.replace(/^\[|\]$/g, ''); // strip IPv6 brackets
  if (isBlockedHostname(hostname)) {
    throw new UnsafeUrlError('that hostname is blocked for safety');
  }
  // IP literal — classify directly (no DNS involved, so no rebinding risk).
  if (/^[\d.]+$/.test(hostname) || hostname.includes(':')) {
    if (isPrivateOrReservedIp(hostname)) {
      throw new UnsafeUrlError('destination is a non-public address (blocked)');
    }
  }
}

/**
 * undici Agent whose DNS hook validates every resolved address at connect
 * time — the IP that passes the check IS the IP that gets dialed, so a
 * malicious DNS server can't pass validation with a public A record and then
 * serve a private one to the actual connection (DNS rebinding).
 */
const ssrfSafeAgent = new Agent({
  connect: {
    lookup(hostname, options, callback) {
      lookup(hostname, { ...options, all: true, verbatim: true }, (err, addresses) => {
        if (err) {
          callback(err, '', 4);
          return;
        }
        const list = Array.isArray(addresses) ? addresses : [];
        if (list.length === 0) {
          callback(new UnsafeUrlError('hostname did not resolve'), '', 4);
          return;
        }
        const unsafe = list.find((a) => isPrivateOrReservedIp(a.address));
        if (unsafe) {
          callback(new UnsafeUrlError('destination resolves to a non-public address (blocked)'), '', 4);
          return;
        }
        if (options.all) {
          callback(null, list as never);
        } else {
          callback(null, list[0].address, list[0].family);
        }
      });
    },
  },
  headersTimeout: FETCH_TIMEOUT_MS,
  bodyTimeout: FETCH_TIMEOUT_MS,
});

/** Minimal structural fetch type so tests can inject a stub. */
export type FetchLike = (url: string) => Promise<{
  status: number;
  ok: boolean;
  headers: { get(name: string): string | null };
  body: ReadableStream<Uint8Array> | null;
}>;

const defaultFetch: FetchLike = (url: string) =>
  undiciFetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (StokedAuditBot/1.0)',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'manual',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    dispatcher: ssrfSafeAgent,
  }) as unknown as ReturnType<FetchLike>;

/**
 * Fetch with redirects validated hop-by-hop. `redirect: 'follow'` would let a
 * public site 302 the bot into a private address, so each Location target is
 * re-checked before it is followed. Exported for tests (inject `fetchImpl`).
 */
export async function fetchPublic(
  startUrl: URL,
  fetchImpl: FetchLike = defaultFetch,
): Promise<Awaited<ReturnType<FetchLike>>> {
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop += 1) {
    assertSafeUrlShape(current);
    // eslint-disable-next-line no-await-in-loop
    const response = await fetchImpl(current.href);
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location || hop === MAX_REDIRECT_HOPS) {
        throw new UnsafeUrlError('too many redirects');
      }
      const next = new URL(location, current);
      if (next.protocol !== 'http:' && next.protocol !== 'https:') {
        throw new UnsafeUrlError('redirect to a non-http(s) URL is not allowed');
      }
      current = next;
      continue;
    }
    return response;
  }
  throw new UnsafeUrlError('too many redirects');
}

/**
 * Read the body with a hard byte cap and wall-clock deadline enforced DURING
 * the read — content-length is server-supplied and can lie, and a trickling
 * body would otherwise hold the function open indefinitely.
 */
async function readBodyCapped(
  body: ReadableStream<Uint8Array> | null,
  maxBytes: number,
  deadlineMs: number,
): Promise<string> {
  if (!body) {
    return '';
  }
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  const deadline = Date.now() + deadlineMs;
  for (;;) {
    if (Date.now() > deadline) {
      await reader.cancel().catch(() => {});
      break;
    }
    // eslint-disable-next-line no-await-in-loop
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    total += value.byteLength;
    chunks.push(value);
    if (total >= maxBytes) {
      await reader.cancel().catch(() => {});
      break;
    }
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function executeFetchCompanySite(input: { url: string }): Promise<ToolExecutionResult> {
  try {
    const parsed = normalizeUrl(input.url || '');
    const response = await fetchPublic(parsed);

    if (!response.ok) {
      return { ok: false, error: `site returned ${response.status}` };
    }

    const html = await readBodyCapped(response.body, MAX_RESPONSE_BYTES, FETCH_TIMEOUT_MS * 2);
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
        url: parsed.href,
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
 * Execute a tool call server-side. `generate_report` and `save_lead` are
 * recognized as "caller-handled" — the conversation runner / API layer surfaces
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
    case 'save_lead':
      return { ok: true, data: { handled_by: 'caller', input } };
    default:
      return { ok: false, error: `unknown tool: ${name as string}` };
  }
}
