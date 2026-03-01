#!/usr/bin/env node
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.callApi = exports.apiRequest = exports.server = void 0;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const STOKED_API_URL = (process.env.STOKED_API_URL
    ?? process.env.NEXT_API_URL
    ?? process.env.BLOG_API_URL
    ?? 'http://localhost:3000/api').replace(/\/$/, '');
const STOKED_API_TOKEN = (process.env.STOKED_API_TOKEN
    ?? process.env.BLOG_API_TOKEN
    ?? '').trim();
if (!STOKED_API_TOKEN) {
    process.stderr.write('[stoked-mcp] WARNING: STOKED_API_TOKEN is not set. Blog write/draft operations will fail.\n');
}
async function apiRequest(method, path, body) {
    const url = `${STOKED_API_URL}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };
    if (STOKED_API_TOKEN) {
        headers.Authorization = `Bearer ${STOKED_API_TOKEN}`;
    }
    const init = { method, headers };
    if (body !== undefined) {
        init.body = JSON.stringify(body);
    }
    const response = await fetch(url, init);
    if (response.status === 204) {
        return { ok: true, status: 204, data: null };
    }
    let data;
    try {
        data = (await response.json());
    }
    catch {
        data = { message: response.statusText };
    }
    return { ok: response.ok, status: response.status, data };
}
exports.apiRequest = apiRequest;
// ---------------------------------------------------------------------------
// MCP result helpers
// ---------------------------------------------------------------------------
function successResult(data) {
    return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
}
function errorResult(message, status) {
    const prefix = status ? `[HTTP ${status}] ` : '';
    return {
        content: [{ type: 'text', text: `${prefix}${message}` }],
        isError: true,
    };
}
async function callApi(method, path, body) {
    try {
        const res = await apiRequest(method, path, body);
        if (!res.ok) {
            const errMsg = res.data?.message
                ?? `Request failed with status ${res.status}`;
            return errorResult(errMsg, res.status);
        }
        return successResult(res.data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return errorResult(`Network error: ${message}. Please check that STOKED_API_URL is reachable and retry.`);
    }
}
exports.callApi = callApi;
function buildBlogQuery(args) {
    const params = new URLSearchParams();
    if (args.page !== undefined)
        params.set('page', String(args.page));
    if (args.limit !== undefined)
        params.set('limit', String(args.limit));
    if (args.status !== undefined)
        params.set('status', args.status);
    if (args.tag !== undefined)
        params.set('tag', args.tag);
    if (args.author !== undefined)
        params.set('author', args.author);
    if (args.search !== undefined)
        params.set('search', args.search);
    if (args.site !== undefined)
        params.set('site', args.site);
    if (args.sortBy !== undefined)
        params.set('sortBy', args.sortBy);
    const query = params.toString();
    return query ? `?${query}` : '';
}
// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------
const server = new mcp_js_1.McpServer({ name: 'stoked-mcp', version: '1.0.0' }, {
    capabilities: {
        tools: {},
    },
});
exports.server = server;
// ---------------------------------------------------------------------------
// Blog tools
// ---------------------------------------------------------------------------
server.registerTool('create_blog_post', {
    title: 'Create Blog Post',
    description: 'Create a new draft blog post. Returns the created post with its generated slug and ID.',
    inputSchema: zod_1.z.object({
        title: zod_1.z.string().describe('Blog post title'),
        body: zod_1.z.string().describe('Full post body content (supports Markdown)'),
        description: zod_1.z.string().describe('Short description / excerpt shown in listings'),
        tags: zod_1.z.array(zod_1.z.string()).describe('Tags for categorizing the post'),
        authors: zod_1.z
            .array(zod_1.z.string())
            .describe('Author identifiers (email addresses or usernames)'),
        targetSites: zod_1.z
            .array(zod_1.z.string())
            .optional()
            .describe('Sites this post should appear on (default: ["stoked-ui.com"])'),
        image: zod_1.z.string().optional().describe('Cover image URL'),
        slug: zod_1.z
            .string()
            .optional()
            .describe('URL-friendly slug (auto-generated from title if omitted)'),
        date: zod_1.z
            .string()
            .optional()
            .describe('Publication date in ISO 8601 format'),
    }),
}, async (args) => callApi('POST', '/blog', args));
server.registerTool('update_blog_post', {
    title: 'Update Blog Post',
    description: 'Update fields of an existing blog post by slug. Only provided fields are changed.',
    inputSchema: zod_1.z.object({
        slug: zod_1.z.string().describe('URL slug of the post to update'),
        title: zod_1.z.string().optional().describe('New title'),
        body: zod_1.z.string().optional().describe('New body content'),
        description: zod_1.z.string().optional().describe('New description / excerpt'),
        tags: zod_1.z.array(zod_1.z.string()).optional().describe('Replacement tag list'),
        authors: zod_1.z.array(zod_1.z.string()).optional().describe('Replacement author list'),
        targetSites: zod_1.z.array(zod_1.z.string()).optional().describe('Replacement target sites list'),
        image: zod_1.z.string().optional().describe('New cover image URL'),
        date: zod_1.z.string().optional().describe('New publication date (ISO 8601)'),
    }),
}, async ({ slug, ...fields }) => callApi('PATCH', `/blog/${encodeURIComponent(slug)}`, fields));
server.registerTool('get_blog_post', {
    title: 'Get Blog Post',
    description: 'Retrieve a single blog post by its URL slug. Draft posts require STOKED_API_TOKEN.',
    inputSchema: zod_1.z.object({
        slug: zod_1.z.string().describe('URL slug of the post to retrieve'),
    }),
}, async ({ slug }) => callApi('GET', `/blog/${encodeURIComponent(slug)}`));
server.registerTool('list_blog_posts', {
    title: 'List Blog Posts',
    description: 'List and filter blog posts with pagination. Public listing is default; set includeDrafts=true to query authenticated /blog.',
    inputSchema: zod_1.z.object({
        page: zod_1.z.number().int().min(1).optional().describe('Page number (1-based, default: 1)'),
        limit: zod_1.z.number().int().min(1).optional().describe('Posts per page (default: 20)'),
        status: zod_1.z.enum(['draft', 'published', 'archived']).optional().describe('Filter by post status'),
        tag: zod_1.z.string().optional().describe('Filter by a specific tag'),
        author: zod_1.z.string().optional().describe('Filter by author identifier'),
        search: zod_1.z
            .string()
            .optional()
            .describe('Full-text search across title, description, and tags'),
        site: zod_1.z.string().optional().describe('Filter by target site'),
        sortBy: zod_1.z.enum(['date', 'title', 'createdAt']).optional().describe('Sort field'),
        includeDrafts: zod_1.z
            .boolean()
            .optional()
            .describe('When true, uses /blog endpoint (requires STOKED_API_TOKEN)'),
    }),
}, async ({ includeDrafts, ...queryArgs }) => {
    const query = buildBlogQuery(queryArgs);
    const path = includeDrafts ? '/blog' : '/blog/public';
    return callApi('GET', `${path}${query}`);
});
server.registerTool('publish_blog_post', {
    title: 'Publish Blog Post',
    description: 'Publish a draft blog post. Sets its status to "published" and records the publication date.',
    inputSchema: zod_1.z.object({
        slug: zod_1.z.string().describe('URL slug of the post to publish'),
    }),
}, async ({ slug }) => callApi('POST', `/blog/${encodeURIComponent(slug)}/publish`));
server.registerTool('unpublish_blog_post', {
    title: 'Unpublish Blog Post',
    description: 'Unpublish a blog post, reverting its status back to "draft".',
    inputSchema: zod_1.z.object({
        slug: zod_1.z.string().describe('URL slug of the post to unpublish'),
    }),
}, async ({ slug }) => callApi('POST', `/blog/${encodeURIComponent(slug)}/unpublish`));
server.registerTool('delete_blog_post', {
    title: 'Delete Blog Post',
    description: 'Soft-delete a blog post by slug. The post will be removed from all listings.',
    inputSchema: zod_1.z.object({
        slug: zod_1.z.string().describe('URL slug of the post to delete'),
    }),
}, async ({ slug }) => callApi('DELETE', `/blog/${encodeURIComponent(slug)}`));
server.registerTool('list_tags', {
    title: 'List Tags',
    description: 'Get all tags used in published posts with per-tag post counts.',
    inputSchema: zod_1.z.object({}),
}, async () => callApi('GET', '/blog/tags'));
server.registerTool('list_authors', {
    title: 'List Authors',
    description: 'Get all authors who have published posts with per-author post counts.',
    inputSchema: zod_1.z.object({}),
}, async () => callApi('GET', '/blog/authors'));
// ---------------------------------------------------------------------------
// License and product tools
// ---------------------------------------------------------------------------
server.registerTool('list_license_products', {
    title: 'List License Products',
    description: 'List products available for license checkout.',
    inputSchema: zod_1.z.object({}),
}, async () => callApi('GET', '/licenses/products'));
server.registerTool('create_license_checkout', {
    title: 'Create License Checkout',
    description: 'Create a Stripe checkout session URL for a license product.',
    inputSchema: zod_1.z.object({
        productId: zod_1.z.string().describe('License product identifier'),
        email: zod_1.z.string().email().describe('Customer email address'),
        successUrl: zod_1.z.string().url().describe('Redirect URL after successful checkout'),
        cancelUrl: zod_1.z.string().url().describe('Redirect URL after canceled checkout'),
    }),
}, async (args) => callApi('POST', '/licenses/checkout', args));
server.registerTool('activate_license', {
    title: 'Activate License',
    description: 'Activate a license key on a specific hardware ID.',
    inputSchema: zod_1.z.object({
        key: zod_1.z.string().describe('License key'),
        hardwareId: zod_1.z.string().describe('Hardware identifier for activation'),
        machineName: zod_1.z.string().optional().describe('Optional machine name'),
    }),
}, async (args) => callApi('POST', '/licenses/activate', args));
server.registerTool('validate_license', {
    title: 'Validate License',
    description: 'Validate a license key and hardware ID pair.',
    inputSchema: zod_1.z.object({
        key: zod_1.z.string().describe('License key'),
        hardwareId: zod_1.z.string().describe('Hardware identifier to validate'),
    }),
}, async (args) => callApi('POST', '/licenses/validate', args));
server.registerTool('deactivate_license', {
    title: 'Deactivate License',
    description: 'Deactivate an active license from a hardware ID.',
    inputSchema: zod_1.z.object({
        key: zod_1.z.string().describe('License key'),
        hardwareId: zod_1.z.string().describe('Hardware identifier currently bound to the key'),
    }),
}, async (args) => callApi('POST', '/licenses/deactivate', args));
// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    process.stderr.write('[stoked-mcp] Server started on stdio transport\n');
}
if (require.main === module) {
    main().catch((err) => {
        process.stderr.write(`[stoked-mcp] Fatal error: ${String(err)}\n`);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map