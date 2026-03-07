/**
 * Next.js Server-Side Proxy Handler
 * 
 * This handler is designed to be used in a Next.js App Router (app/api/sui-media/[[...sui]]/route.ts).
 * It securely proxies requests from the frontend components to the backend sui-media-api
 * while keeping your API keys and source endpoints hidden from the end-user.
 */

import { NextRequest, NextResponse } from 'next/server';

export interface MediaHandlerConfig {
  /** 
   * The private API key for authenticating with the backend sui-media-api.
   * This should be stored in your server-side environment variables (.env).
   */
  privateKey: string;

  /**
   * The base URL of your backend sui-media-api (e.g., https://api.stoked-ui.com).
   * Defaults to the production Stoked UI Media API.
   */
  sourceApiUrl?: string;

  /**
   * Optional custom path prefix for the local proxy endpoint.
   * Defaults to '/api/sui-media'.
   */
  localPath?: string;
}

/**
 * Creates a Next.js App Router compatible route handler.
 * 
 * @example
 * ```typescript
 * // app/api/sui-media/[[...sui]]/route.ts
 * import { createMediaHandler } from '@stoked-ui/media/server';
 * 
 * export const { GET, POST, PUT, DELETE } = createMediaHandler({
 *   privateKey: process.env.STOKED_MEDIA_API_KEY!,
 * });
 * ```
 */
export function createMediaHandler(config: MediaHandlerConfig) {
  const {
    privateKey,
    sourceApiUrl = 'https://api.stoked-ui.com',
    localPath = '/api/sui-media',
  } = config;

  if (!privateKey) {
    console.error('[sui-media] Error: privateKey is missing in MediaHandlerConfig. API requests will fail.');
  }

  const handler = async (req: NextRequest) => {
    try {
      // 1. Resolve the path relative to the local proxy endpoint
      const url = new URL(req.url);
      const relativePath = url.pathname.replace(localPath, '').replace(/^\//, '');
      
      // 2. Build the destination URL on the backend sui-media-api
      const destUrl = new URL(relativePath, `${sourceApiUrl}/api/`);
      
      // Copy search params (pagination, filters, etc.)
      url.searchParams.forEach((value, key) => {
        destUrl.searchParams.append(key, value);
      });

      // 3. Prepare the proxied request
      const headers = new Headers(req.headers);
      
      // Inject the private key securely (this never leaves the server to the browser)
      headers.set('X-API-Key', privateKey);
      headers.set('Authorization', `Bearer ${privateKey}`);
      
      // Clean up headers that might cause issues with the destination
      headers.delete('host');
      headers.delete('connection');

      // 4. Perform the server-to-server request
      const response = await fetch(destUrl.toString(), {
        method: req.method,
        headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined,
        // Disable cache to ensure real-time data from the media API
        cache: 'no-store',
      });

      // 5. Forward the response back to the browser
      const responseData = await response.blob();
      
      // Create a clean response with original status and content type
      const nextResponse = new NextResponse(responseData, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      });

      return nextResponse;
    } catch (error) {
      console.error('[sui-media] Proxy handler error:', error);
      return NextResponse.json(
        { message: 'Internal Media Proxy Error', error: String(error) },
        { status: 500 }
      );
    }
  };

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    DELETE: handler,
    PATCH: handler,
  };
}
