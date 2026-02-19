#!/usr/bin/env node
"use strict";
/**
 * @stoked-ui/blog-mcp
 *
 * MCP (Model Context Protocol) server that exposes blog CRUD operations as tools,
 * enabling AI agents to author and manage blog posts programmatically.
 *
 * Configuration (environment variables):
 *   BLOG_API_URL   - Base URL of the Blog API (e.g. http://localhost:3001)
 *   BLOG_API_TOKEN - Bearer token for API authentication
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.callApi = exports.apiRequest = exports.server = void 0;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const BLOG_API_URL = (process.env.BLOG_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const BLOG_API_TOKEN = process.env.BLOG_API_TOKEN ?? '';
if (!BLOG_API_TOKEN) {
    process.stderr.write('[blog-mcp] WARNING: BLOG_API_TOKEN is not set. Authenticated requests will fail.\n');
}
async function apiRequest(method, path, body) {
    const url = `${BLOG_API_URL}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };
    if (BLOG_API_TOKEN) {
        headers['Authorization'] = `Bearer ${BLOG_API_TOKEN}`;
    }
    const init = { method, headers };
    if (body !== undefined) {
        init.body = JSON.stringify(body);
    }
    const response = await fetch(url, init);
    // 204 No Content has no body
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
            const errMsg = res.data?.message ??
                `Request failed with status ${res.status}`;
            return errorResult(errMsg, res.status);
        }
        return successResult(res.data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return errorResult(`Network error: ${message}. Please check that BLOG_API_URL is reachable and retry.`);
    }
}
exports.callApi = callApi;
// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------
const server = new mcp_js_1.McpServer({ name: 'blog-mcp', version: '1.0.0' }, {
    capabilities: {
        tools: {},
    },
});
exports.server = server;
// ---------------------------------------------------------------------------
// Tool 1: create_blog_post
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
            .describe('Publication date in ISO 8601 format (e.g. 2026-02-19T00:00:00.000Z)'),
    }),
}, async (args) => {
    return callApi('POST', '/blog', args);
});
// ---------------------------------------------------------------------------
// Tool 2: update_blog_post
// ---------------------------------------------------------------------------
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
}, async ({ slug, ...fields }) => {
    return callApi('PATCH', `/blog/${encodeURIComponent(slug)}`, fields);
});
// ---------------------------------------------------------------------------
// Tool 3: get_blog_post
// ---------------------------------------------------------------------------
server.registerTool('get_blog_post', {
    title: 'Get Blog Post',
    description: 'Retrieve a single blog post by its URL slug. Draft posts require authentication (BLOG_API_TOKEN).',
    inputSchema: zod_1.z.object({
        slug: zod_1.z.string().describe('URL slug of the post to retrieve'),
    }),
}, async ({ slug }) => {
    return callApi('GET', `/blog/${encodeURIComponent(slug)}`);
});
// ---------------------------------------------------------------------------
// Tool 4: list_blog_posts
// ---------------------------------------------------------------------------
server.registerTool('list_blog_posts', {
    title: 'List Blog Posts',
    description: 'List and filter blog posts with pagination. Returns paginated results with total count.',
    inputSchema: zod_1.z.object({
        page: zod_1.z.number().int().min(1).optional().describe('Page number (1-based, default: 1)'),
        limit: zod_1.z
            .number()
            .int()
            .min(1)
            .optional()
            .describe('Posts per page (default: 20)'),
        status: zod_1.z
            .enum(['draft', 'published', 'archived'])
            .optional()
            .describe('Filter by post status'),
        tag: zod_1.z.string().optional().describe('Filter by a specific tag'),
        author: zod_1.z.string().optional().describe('Filter by author identifier'),
        search: zod_1.z
            .string()
            .optional()
            .describe('Full-text search across title, description, and tags'),
        site: zod_1.z.string().optional().describe('Filter by target site'),
    }),
}, async (args) => {
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
    const qs = params.toString();
    return callApi('GET', qs ? `/blog?${qs}` : '/blog');
});
// ---------------------------------------------------------------------------
// Tool 5: publish_blog_post
// ---------------------------------------------------------------------------
server.registerTool('publish_blog_post', {
    title: 'Publish Blog Post',
    description: 'Publish a draft blog post. Sets its status to "published" and records the publication date.',
    inputSchema: zod_1.z.object({
        slug: zod_1.z.string().describe('URL slug of the post to publish'),
    }),
}, async ({ slug }) => {
    return callApi('POST', `/blog/${encodeURIComponent(slug)}/publish`);
});
// ---------------------------------------------------------------------------
// Tool 6: unpublish_blog_post
// ---------------------------------------------------------------------------
server.registerTool('unpublish_blog_post', {
    title: 'Unpublish Blog Post',
    description: 'Unpublish a blog post, reverting its status back to "draft".',
    inputSchema: zod_1.z.object({
        slug: zod_1.z.string().describe('URL slug of the post to unpublish'),
    }),
}, async ({ slug }) => {
    return callApi('POST', `/blog/${encodeURIComponent(slug)}/unpublish`);
});
// ---------------------------------------------------------------------------
// Tool 7: delete_blog_post
// ---------------------------------------------------------------------------
server.registerTool('delete_blog_post', {
    title: 'Delete Blog Post',
    description: 'Soft-delete a blog post by slug. The post will be removed from all listings.',
    inputSchema: zod_1.z.object({
        slug: zod_1.z.string().describe('URL slug of the post to delete'),
    }),
}, async ({ slug }) => {
    return callApi('DELETE', `/blog/${encodeURIComponent(slug)}`);
});
// ---------------------------------------------------------------------------
// Tool 8: list_tags
// ---------------------------------------------------------------------------
server.registerTool('list_tags', {
    title: 'List Tags',
    description: 'Get all tags used in published posts, along with the count of posts for each tag.',
    inputSchema: zod_1.z.object({}),
}, async () => {
    return callApi('GET', '/blog/tags');
});
// ---------------------------------------------------------------------------
// Tool 9: list_authors
// ---------------------------------------------------------------------------
server.registerTool('list_authors', {
    title: 'List Authors',
    description: 'Get all authors who have published posts, along with the count of posts for each author.',
    inputSchema: zod_1.z.object({}),
}, async () => {
    return callApi('GET', '/blog/authors');
});
// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    process.stderr.write('[blog-mcp] Server started on stdio transport\n');
}
main().catch((err) => {
    process.stderr.write(`[blog-mcp] Fatal error: ${String(err)}\n`);
    process.exit(1);
});
//# sourceMappingURL=index.js.map