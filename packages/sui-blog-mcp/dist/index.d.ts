#!/usr/bin/env node
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
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
interface ApiResponse<T = unknown> {
    ok: boolean;
    status: number;
    data: T;
}
declare function apiRequest<T = unknown>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>>;
declare function callApi<T = unknown>(method: string, path: string, body?: unknown): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
declare const server: McpServer;
export { server, apiRequest, callApi };
//# sourceMappingURL=index.d.ts.map