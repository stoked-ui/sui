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