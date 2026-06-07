import { expect } from 'chai';
import { executeTool, AUDIT_TOOLS, type ToolExecutionResult } from './tools';

const ctx = { sessionId: 'test-session-0000', playbook: 'ai-readiness' as const };

function expectBlocked(result: ToolExecutionResult, label: string) {
  expect(result.ok, `${label} should be rejected`).to.equal(false);
  expect(result.error, `${label} should be rejected by the SSRF guard, not by a network error`)
    .to.match(/not allowed|blocked|unsafe|not.*public|private/i);
}

describe('auditBot tools — fetch_company_site SSRF guard', () => {
  it('rejects loopback IP literals without attempting the request', async () => {
    const result = await executeTool('fetch_company_site', { url: 'http://127.0.0.1:1/' }, ctx);
    expectBlocked(result, 'loopback IPv4');
  });

  it('rejects cloud metadata endpoint', async () => {
    const result = await executeTool(
      'fetch_company_site',
      { url: 'http://169.254.169.254/latest/meta-data/' },
      ctx,
    );
    expectBlocked(result, 'link-local metadata IP');
  });

  it('rejects RFC-1918 private addresses', async () => {
    const result = await executeTool('fetch_company_site', { url: 'https://192.168.1.10/admin' }, ctx);
    expectBlocked(result, 'private IPv4');
  });

  it('rejects localhost by hostname', async () => {
    const result = await executeTool('fetch_company_site', { url: 'http://localhost:5199/' }, ctx);
    expectBlocked(result, 'localhost hostname');
  });

  it('rejects IPv6 loopback literals', async () => {
    const result = await executeTool('fetch_company_site', { url: 'http://[::1]/' }, ctx);
    expectBlocked(result, 'IPv6 loopback');
  });

  it('rejects non-http(s) schemes', async () => {
    const result = await executeTool('fetch_company_site', { url: 'ftp://example.com/' }, ctx);
    expect(result.ok).to.equal(false);
  });

  it('rejects URLs with embedded credentials', async () => {
    const result = await executeTool('fetch_company_site', { url: 'https://a:b@example.com/' }, ctx);
    expect(result.ok).to.equal(false);
  });

  it('rejects empty url', async () => {
    const result = await executeTool('fetch_company_site', { url: '' }, ctx);
    expect(result.ok).to.equal(false);
  });
});

describe('auditBot tools — redirect re-validation', () => {
  it('refuses to follow a redirect into a private address', async () => {
    const { fetchPublic } = await import('./tools');
    const calls: string[] = [];
    const stubFetch = (async (url: string) => {
      calls.push(String(url));
      return new Response(null, {
        status: 302,
        headers: { location: 'http://169.254.169.254/latest/meta-data/' },
      });
    }) as unknown as typeof fetch;

    let error: Error | null = null;
    try {
      await fetchPublic(new URL('https://example.com/'), stubFetch);
    } catch (err) {
      error = err as Error;
    }
    expect(error, 'redirect into metadata IP must throw').to.not.equal(null);
    expect(error!.message).to.match(/not allowed|blocked|unsafe|non-public|private/i);
    // The private target must never have been fetched.
    expect(calls).to.have.length(1);
    expect(calls[0]).to.contain('example.com');
  });

  it('gives up after the redirect hop limit', async () => {
    const { fetchPublic } = await import('./tools');
    const stubFetch = (async (url: string) =>
      new Response(null, {
        status: 301,
        headers: { location: `${String(url)}x` },
      })) as unknown as typeof fetch;

    let error: Error | null = null;
    try {
      await fetchPublic(new URL('https://example.com/'), stubFetch);
    } catch (err) {
      error = err as Error;
    }
    expect(error).to.not.equal(null);
    expect(error!.message).to.match(/too many redirects/i);
  });
});

describe('auditBot tools — tool surface', () => {
  it('does not advertise the removed email_report tool to the model', () => {
    const names = AUDIT_TOOLS.map((t) => t.function.name);
    expect(names).to.not.include('email_report');
    expect(names).to.have.members(['fetch_company_site', 'generate_report', 'save_lead']);
  });

  it('returns a structured error for unknown tools', async () => {
    const result = await executeTool('nope' as never, {}, ctx);
    expect(result.ok).to.equal(false);
  });
});
