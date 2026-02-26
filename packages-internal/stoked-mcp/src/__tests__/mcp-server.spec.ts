/**
 * Tests for the stoked-mcp server HTTP helpers.
 *
 * Coverage:
 * - Base URL + auth header wiring
 * - Env var fallback behavior
 * - Error mapping in callApi
 * - Blog + license endpoint path usage
 */

type MockFetchFn = jest.MockedFunction<typeof globalThis.fetch>;

let mockFetch: MockFetchFn;

beforeEach(() => {
  mockFetch = jest.fn();
  globalThis.fetch = mockFetch as unknown as typeof fetch;

  process.env.STOKED_API_URL = 'http://localhost:3000/api';
  process.env.STOKED_API_TOKEN = 'test-token-abc123';

  delete process.env.NEXT_API_URL;
  delete process.env.BLOG_API_URL;
  delete process.env.BLOG_API_TOKEN;
});

afterEach(() => {
  jest.resetAllMocks();
  jest.resetModules();

  delete process.env.STOKED_API_URL;
  delete process.env.STOKED_API_TOKEN;
  delete process.env.NEXT_API_URL;
  delete process.env.BLOG_API_URL;
  delete process.env.BLOG_API_TOKEN;
});

function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => body,
  } as unknown as Response;
}

function mockNoContent(): Response {
  return {
    ok: true,
    status: 204,
    statusText: 'No Content',
    json: async () => null,
  } as unknown as Response;
}

async function getHelpers() {
  jest.resetModules();
  const mod = await import('../index');
  return { apiRequest: mod.apiRequest, callApi: mod.callApi };
}

describe('apiRequest', () => {
  it('builds URL from STOKED_API_URL and includes Authorization header', async () => {
    mockFetch.mockResolvedValue(mockResponse({ ok: true }));

    const { apiRequest } = await getHelpers();
    await apiRequest('GET', '/blog/tags');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];

    expect(url).toBe('http://localhost:3000/api/blog/tags');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-token-abc123');
  });

  it('omits Authorization header when no token is set', async () => {
    process.env.STOKED_API_TOKEN = '';
    mockFetch.mockResolvedValue(mockResponse({ ok: true }));

    const { apiRequest } = await getHelpers();
    await apiRequest('GET', '/blog/public');

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('supports BLOG_API_URL/BLOG_API_TOKEN fallbacks', async () => {
    delete process.env.STOKED_API_URL;
    delete process.env.STOKED_API_TOKEN;
    process.env.BLOG_API_URL = 'http://localhost:9000/api';
    process.env.BLOG_API_TOKEN = 'legacy-token';

    mockFetch.mockResolvedValue(mockResponse({ ok: true }));

    const { apiRequest } = await getHelpers();
    await apiRequest('GET', '/licenses/products');

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:9000/api/licenses/products');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer legacy-token');
  });

  it('returns null data for 204 responses', async () => {
    mockFetch.mockResolvedValue(mockNoContent());

    const { apiRequest } = await getHelpers();
    const result = await apiRequest('DELETE', '/blog/test-post');

    expect(result.ok).toBe(true);
    expect(result.status).toBe(204);
    expect(result.data).toBeNull();
  });
});

describe('callApi', () => {
  it('returns success content with JSON string payload', async () => {
    const payload = { checkoutUrl: 'https://checkout.stripe.com/session/123' };
    mockFetch.mockResolvedValue(mockResponse(payload));

    const { callApi } = await getHelpers();
    const result = await callApi('POST', '/licenses/checkout', {
      productId: 'pro',
      email: 'a@b.com',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    });

    expect(result.content[0].type).toBe('text');
    expect(JSON.parse(result.content[0].text as string)).toEqual(payload);
    expect((result as { isError?: boolean }).isError).toBeUndefined();
  });

  it('returns HTTP-tagged error content on API errors', async () => {
    mockFetch.mockResolvedValue(mockResponse({ message: 'License not found' }, 404));

    const { callApi } = await getHelpers();
    const result = await callApi('POST', '/licenses/activate', {
      key: 'ABC-1234-AAAA-BBBB',
      hardwareId: 'machine-1',
    });

    expect((result as { isError?: boolean }).isError).toBe(true);
    expect(result.content[0].text).toContain('[HTTP 404]');
    expect(result.content[0].text).toContain('License not found');
  });

  it('returns network error content when fetch rejects', async () => {
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

    const { callApi } = await getHelpers();
    const result = await callApi('GET', '/blog/public');

    expect((result as { isError?: boolean }).isError).toBe(true);
    expect(result.content[0].text).toContain('Network error');
    expect(result.content[0].text).toContain('STOKED_API_URL');
  });
});

describe('endpoint path mapping', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue(mockResponse({ ok: true }));
  });

  async function captureRequest(fn: () => Promise<unknown>) {
    await fn();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    return { url, method: init.method as string };
  }

  it('maps blog public list path', async () => {
    const { callApi } = await getHelpers();
    const { url, method } = await captureRequest(() =>
      callApi('GET', '/blog/public?page=1&limit=10'),
    );

    expect(method).toBe('GET');
    expect(url).toBe('http://localhost:3000/api/blog/public?page=1&limit=10');
  });

  it('maps blog publish path', async () => {
    const { callApi } = await getHelpers();
    const { url, method } = await captureRequest(() =>
      callApi('POST', '/blog/my-post/publish'),
    );

    expect(method).toBe('POST');
    expect(url).toBe('http://localhost:3000/api/blog/my-post/publish');
  });

  it('maps list_license_products path', async () => {
    const { callApi } = await getHelpers();
    const { url, method } = await captureRequest(() =>
      callApi('GET', '/licenses/products'),
    );

    expect(method).toBe('GET');
    expect(url).toBe('http://localhost:3000/api/licenses/products');
  });

  it('maps create_license_checkout path', async () => {
    const { callApi } = await getHelpers();
    const { url, method } = await captureRequest(() =>
      callApi('POST', '/licenses/checkout', {
        productId: 'pro',
        email: 'person@example.com',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      }),
    );

    expect(method).toBe('POST');
    expect(url).toBe('http://localhost:3000/api/licenses/checkout');
  });

  it('maps activate/validate/deactivate paths', async () => {
    const { callApi } = await getHelpers();

    let captured = await captureRequest(() =>
      callApi('POST', '/licenses/activate', { key: 'KEY', hardwareId: 'HW' }),
    );
    expect(captured.url).toBe('http://localhost:3000/api/licenses/activate');

    mockFetch.mockClear();
    captured = await captureRequest(() =>
      callApi('POST', '/licenses/validate', { key: 'KEY', hardwareId: 'HW' }),
    );
    expect(captured.url).toBe('http://localhost:3000/api/licenses/validate');

    mockFetch.mockClear();
    captured = await captureRequest(() =>
      callApi('POST', '/licenses/deactivate', { key: 'KEY', hardwareId: 'HW' }),
    );
    expect(captured.url).toBe('http://localhost:3000/api/licenses/deactivate');
  });
});
