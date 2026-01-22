/**
 * Router abstraction for sui-media components
 *
 * This abstraction provides a framework-agnostic interface for routing operations,
 * allowing media components to work with any router library (Next.js, React Router,
 * Tanstack Router, etc.).
 *
 * @example
 * ```typescript
 * // Implementation with Next.js router
 * import { useRouter } from 'next/router';
 *
 * const NextJsRouterAdapter: IRouter = {
 *   navigate: (path) => router.push(path),
 *   getQueryParam: (key) => router.query[key] as string | undefined,
 *   getAllQueryParams: () => router.query,
 *   getPathname: () => router.pathname,
 * };
 *
 * // Implementation with React Router
 * import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
 *
 * const ReactRouterAdapter: IRouter = {
 *   navigate: (path) => navigate(path),
 *   getQueryParam: (key) => searchParams.get(key) ?? undefined,
 *   getAllQueryParams: () => Object.fromEntries(searchParams),
 *   getPathname: () => location.pathname,
 * };
 *
 * // Pass to media components via context or props
 * <MediaViewer router={NextJsRouterAdapter} />
 * ```
 */

/**
 * Router interface for navigation and URL management
 */
export interface IRouter {
  /**
   * Navigate to a new route
   * @param path - The path to navigate to (can be relative or absolute)
   * @param options - Optional navigation options
   */
  navigate: (path: string, options?: NavigationOptions) => void | Promise<void>;

  /**
   * Get a specific query parameter value
   * @param key - The query parameter key
   * @returns The query parameter value or undefined if not found
   */
  getQueryParam: (key: string) => string | undefined;

  /**
   * Get all query parameters as an object
   * @returns Object containing all query parameters
   */
  getAllQueryParams: () => Record<string, string | string[] | undefined>;

  /**
   * Get the current pathname
   * @returns The current pathname (e.g., "/media/viewer")
   */
  getPathname: () => string;
}

/**
 * Options for navigation operations
 */
export interface NavigationOptions {
  /**
   * Whether to replace the current history entry instead of pushing a new one
   */
  replace?: boolean;

  /**
   * Scroll to top of page after navigation
   */
  scroll?: boolean;

  /**
   * Shallow routing (update URL without running data fetching - Next.js specific)
   */
  shallow?: boolean;
}

/**
 * No-op router implementation that does nothing
 *
 * Use this as a default router for applications that don't need routing functionality,
 * or as a placeholder during development/testing.
 *
 * @example
 * ```typescript
 * import { NoOpRouter } from '@stoked-ui/sui-media';
 *
 * // Use as default when router is optional
 * function MediaCard({ router = NoOpRouter }) {
 *   // Component will work but navigation won't do anything
 * }
 * ```
 */
export class NoOpRouter implements IRouter {
  navigate(path: string, options?: NavigationOptions): void {
    // No-op: does nothing
  }

  getQueryParam(key: string): string | undefined {
    return undefined;
  }

  getAllQueryParams(): Record<string, string | string[] | undefined> {
    return {};
  }

  getPathname(): string {
    return '/';
  }
}

/**
 * Singleton instance of NoOpRouter for convenience
 */
export const noOpRouter = new NoOpRouter();
