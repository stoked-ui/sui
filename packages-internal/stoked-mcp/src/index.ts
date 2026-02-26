#!/usr/bin/env node
/**
 * @stoked-ui/stoked-mcp
 *
 * Unified MCP (Model Context Protocol) server for Stoked Next API tools:
 * - Blog CRUD/publish workflows
 * - License + Stripe checkout workflows
 *
 * Configuration (environment variables):
 *   STOKED_API_URL   - Base URL of the Next API (e.g. http://localhost:3000/api)
 *   STOKED_API_TOKEN - Bearer token for blog authenticated operations
 *
 * Compatibility fallbacks:
 *   NEXT_API_URL, BLOG_API_URL
 *   BLOG_API_TOKEN
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const STOKED_API_URL = (
  process.env.STOKED_API_URL
  ?? process.env.NEXT_API_URL
  ?? process.env.BLOG_API_URL
  ?? 'http://localhost:3000/api'
).replace(/\/$/, '');

const STOKED_API_TOKEN = (
  process.env.STOKED_API_TOKEN
  ?? process.env.BLOG_API_TOKEN
  ?? ''
).trim();

if (!STOKED_API_TOKEN) {
  process.stderr.write(
    '[stoked-mcp] WARNING: STOKED_API_TOKEN is not set. Blog write/draft operations will fail.\n',
  );
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

async function apiRequest<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const url = `${STOKED_API_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (STOKED_API_TOKEN) {
    headers.Authorization = `Bearer ${STOKED_API_TOKEN}`;
  }

  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const response = await fetch(url, init);

  if (response.status === 204) {
    return { ok: true, status: 204, data: null as T };
  }

  let data: T;
  try {
    data = (await response.json()) as T;
  } catch {
    data = { message: response.statusText } as T;
  }

  return { ok: response.ok, status: response.status, data };
}

// ---------------------------------------------------------------------------
// MCP result helpers
// ---------------------------------------------------------------------------

function successResult(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

function errorResult(message: string, status?: number) {
  const prefix = status ? `[HTTP ${status}] ` : '';
  return {
    content: [{ type: 'text' as const, text: `${prefix}${message}` }],
    isError: true,
  };
}

async function callApi<T = unknown>(method: string, path: string, body?: unknown) {
  try {
    const res = await apiRequest<T>(method, path, body);
    if (!res.ok) {
      const errMsg =
        (res.data as { message?: string })?.message
        ?? `Request failed with status ${res.status}`;
      return errorResult(errMsg, res.status);
    }
    return successResult(res.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResult(
      `Network error: ${message}. Please check that STOKED_API_URL is reachable and retry.`,
    );
  }
}

function buildBlogQuery(args: {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'archived';
  tag?: string;
  author?: string;
  search?: string;
  site?: string;
  sortBy?: 'date' | 'title' | 'createdAt';
}) {
  const params = new URLSearchParams();

  if (args.page !== undefined) params.set('page', String(args.page));
  if (args.limit !== undefined) params.set('limit', String(args.limit));
  if (args.status !== undefined) params.set('status', args.status);
  if (args.tag !== undefined) params.set('tag', args.tag);
  if (args.author !== undefined) params.set('author', args.author);
  if (args.search !== undefined) params.set('search', args.search);
  if (args.site !== undefined) params.set('site', args.site);
  if (args.sortBy !== undefined) params.set('sortBy', args.sortBy);

  const query = params.toString();
  return query ? `?${query}` : '';
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const server = new McpServer(
  { name: 'stoked-mcp', version: '1.0.0' },
  {
    capabilities: {
      tools: {},
    },
  },
);

// ---------------------------------------------------------------------------
// Blog tools
// ---------------------------------------------------------------------------

server.registerTool(
  'create_blog_post',
  {
    title: 'Create Blog Post',
    description:
      'Create a new draft blog post. Returns the created post with its generated slug and ID.',
    inputSchema: z.object({
      title: z.string().describe('Blog post title'),
      body: z.string().describe('Full post body content (supports Markdown)'),
      description: z.string().describe('Short description / excerpt shown in listings'),
      tags: z.array(z.string()).describe('Tags for categorizing the post'),
      authors: z
        .array(z.string())
        .describe('Author identifiers (email addresses or usernames)'),
      targetSites: z
        .array(z.string())
        .optional()
        .describe('Sites this post should appear on (default: ["stoked-ui.com"])'),
      image: z.string().optional().describe('Cover image URL'),
      slug: z
        .string()
        .optional()
        .describe('URL-friendly slug (auto-generated from title if omitted)'),
      date: z
        .string()
        .optional()
        .describe('Publication date in ISO 8601 format'),
    }),
  },
  async (args) => callApi('POST', '/blog', args),
);

server.registerTool(
  'update_blog_post',
  {
    title: 'Update Blog Post',
    description: 'Update fields of an existing blog post by slug. Only provided fields are changed.',
    inputSchema: z.object({
      slug: z.string().describe('URL slug of the post to update'),
      title: z.string().optional().describe('New title'),
      body: z.string().optional().describe('New body content'),
      description: z.string().optional().describe('New description / excerpt'),
      tags: z.array(z.string()).optional().describe('Replacement tag list'),
      authors: z.array(z.string()).optional().describe('Replacement author list'),
      targetSites: z.array(z.string()).optional().describe('Replacement target sites list'),
      image: z.string().optional().describe('New cover image URL'),
      date: z.string().optional().describe('New publication date (ISO 8601)'),
    }),
  },
  async ({ slug, ...fields }) => callApi('PATCH', `/blog/${encodeURIComponent(slug)}`, fields),
);

server.registerTool(
  'get_blog_post',
  {
    title: 'Get Blog Post',
    description:
      'Retrieve a single blog post by its URL slug. Draft posts require STOKED_API_TOKEN.',
    inputSchema: z.object({
      slug: z.string().describe('URL slug of the post to retrieve'),
    }),
  },
  async ({ slug }) => callApi('GET', `/blog/${encodeURIComponent(slug)}`),
);

server.registerTool(
  'list_blog_posts',
  {
    title: 'List Blog Posts',
    description:
      'List and filter blog posts with pagination. Public listing is default; set includeDrafts=true to query authenticated /blog.',
    inputSchema: z.object({
      page: z.number().int().min(1).optional().describe('Page number (1-based, default: 1)'),
      limit: z.number().int().min(1).optional().describe('Posts per page (default: 20)'),
      status: z.enum(['draft', 'published', 'archived']).optional().describe('Filter by post status'),
      tag: z.string().optional().describe('Filter by a specific tag'),
      author: z.string().optional().describe('Filter by author identifier'),
      search: z
        .string()
        .optional()
        .describe('Full-text search across title, description, and tags'),
      site: z.string().optional().describe('Filter by target site'),
      sortBy: z.enum(['date', 'title', 'createdAt']).optional().describe('Sort field'),
      includeDrafts: z
        .boolean()
        .optional()
        .describe('When true, uses /blog endpoint (requires STOKED_API_TOKEN)'),
    }),
  },
  async ({ includeDrafts, ...queryArgs }) => {
    const query = buildBlogQuery(queryArgs);
    const path = includeDrafts ? '/blog' : '/blog/public';
    return callApi('GET', `${path}${query}`);
  },
);

server.registerTool(
  'publish_blog_post',
  {
    title: 'Publish Blog Post',
    description:
      'Publish a draft blog post. Sets its status to "published" and records the publication date.',
    inputSchema: z.object({
      slug: z.string().describe('URL slug of the post to publish'),
    }),
  },
  async ({ slug }) => callApi('POST', `/blog/${encodeURIComponent(slug)}/publish`),
);

server.registerTool(
  'unpublish_blog_post',
  {
    title: 'Unpublish Blog Post',
    description: 'Unpublish a blog post, reverting its status back to "draft".',
    inputSchema: z.object({
      slug: z.string().describe('URL slug of the post to unpublish'),
    }),
  },
  async ({ slug }) => callApi('POST', `/blog/${encodeURIComponent(slug)}/unpublish`),
);

server.registerTool(
  'delete_blog_post',
  {
    title: 'Delete Blog Post',
    description: 'Soft-delete a blog post by slug. The post will be removed from all listings.',
    inputSchema: z.object({
      slug: z.string().describe('URL slug of the post to delete'),
    }),
  },
  async ({ slug }) => callApi('DELETE', `/blog/${encodeURIComponent(slug)}`),
);

server.registerTool(
  'list_tags',
  {
    title: 'List Tags',
    description: 'Get all tags used in published posts with per-tag post counts.',
    inputSchema: z.object({}),
  },
  async () => callApi('GET', '/blog/tags'),
);

server.registerTool(
  'list_authors',
  {
    title: 'List Authors',
    description: 'Get all authors who have published posts with per-author post counts.',
    inputSchema: z.object({}),
  },
  async () => callApi('GET', '/blog/authors'),
);

// ---------------------------------------------------------------------------
// License and product tools
// ---------------------------------------------------------------------------

server.registerTool(
  'list_license_products',
  {
    title: 'List License Products',
    description: 'List products available for license checkout.',
    inputSchema: z.object({}),
  },
  async () => callApi('GET', '/licenses/products'),
);

server.registerTool(
  'create_license_checkout',
  {
    title: 'Create License Checkout',
    description: 'Create a Stripe checkout session URL for a license product.',
    inputSchema: z.object({
      productId: z.string().describe('License product identifier'),
      email: z.string().email().describe('Customer email address'),
      successUrl: z.string().url().describe('Redirect URL after successful checkout'),
      cancelUrl: z.string().url().describe('Redirect URL after canceled checkout'),
    }),
  },
  async (args) => callApi('POST', '/licenses/checkout', args),
);

server.registerTool(
  'activate_license',
  {
    title: 'Activate License',
    description: 'Activate a license key on a specific hardware ID.',
    inputSchema: z.object({
      key: z.string().describe('License key'),
      hardwareId: z.string().describe('Hardware identifier for activation'),
      machineName: z.string().optional().describe('Optional machine name'),
    }),
  },
  async (args) => callApi('POST', '/licenses/activate', args),
);

server.registerTool(
  'validate_license',
  {
    title: 'Validate License',
    description: 'Validate a license key and hardware ID pair.',
    inputSchema: z.object({
      key: z.string().describe('License key'),
      hardwareId: z.string().describe('Hardware identifier to validate'),
    }),
  },
  async (args) => callApi('POST', '/licenses/validate', args),
);

server.registerTool(
  'deactivate_license',
  {
    title: 'Deactivate License',
    description: 'Deactivate an active license from a hardware ID.',
    inputSchema: z.object({
      key: z.string().describe('License key'),
      hardwareId: z.string().describe('Hardware identifier currently bound to the key'),
    }),
  },
  async (args) => callApi('POST', '/licenses/deactivate', args),
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('[stoked-mcp] Server started on stdio transport\n');
}

if (require.main === module) {
  main().catch((err) => {
    process.stderr.write(`[stoked-mcp] Fatal error: ${String(err)}\n`);
    process.exit(1);
  });
}

export { server, apiRequest, callApi };
