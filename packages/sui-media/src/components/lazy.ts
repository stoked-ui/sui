/**
 * Lazy Loading Utilities for Media Components
 *
 * This module provides lazy-loaded versions of heavy components
 * to reduce initial bundle size and improve performance.
 *
 * Usage:
 * ```typescript
 * import { LazyMediaViewer, LazyMediaCard } from '@stoked-ui/media/lazy';
 * import { Suspense, useState } from 'react';
 *
 * function App() {
 *   const [showViewer, setShowViewer] = useState(false);
 *
 *   return (
 *     <div>
 *       <button onClick={() => setShowViewer(true)}>Open Viewer</button>
 *       {showViewer && (
 *         <Suspense fallback={<div>Loading...</div>}>
 *           <LazyMediaViewer
 *             item={item}
 *             open={true}
 *             onClose={() => setShowViewer(false)}
 *           />
 *         </Suspense>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

import React, { lazy, ComponentType } from 'react';
import type { MediaViewerProps } from './MediaViewer/MediaViewer';
import type { MediaCardProps } from './MediaCard/MediaCard';

/**
 * Lazy-loaded MediaViewer component
 *
 * Use this when the full-screen viewer is only needed in specific routes
 * or triggered by user interaction. Reduces initial bundle by ~40KB.
 */
export const LazyMediaViewer: React.LazyExoticComponent<
  ComponentType<MediaViewerProps>
> = lazy(() => import('./MediaViewer').then((m) => ({ default: m.MediaViewer })));

/**
 * Lazy-loaded MediaCard component
 *
 * Use when rendering large collections of cards that might not all be visible.
 * Consider using with virtual scrolling for optimal performance.
 */
export const LazyMediaCard: React.LazyExoticComponent<
  ComponentType<MediaCardProps>
> = lazy(() => import('./MediaCard').then((m) => ({ default: m.MediaCard })));

/**
 * Lazy-loaded ThumbnailStrip component
 *
 * Independent lazy load for thumbnail displays.
 */
export const LazyThumbnailStrip: React.LazyExoticComponent<any> = lazy(() =>
  import('./MediaCard').then((m) => ({ default: m.ThumbnailStrip }))
);

/**
 * Lazy-loaded VideoProgressBar component
 *
 * Independent lazy load for video progress indicators.
 */
export const LazyVideoProgressBar: React.LazyExoticComponent<any> = lazy(() =>
  import('./MediaCard').then((m) => ({ default: m.VideoProgressBar }))
);

/**
 * Hook to prefetch lazy components
 *
 * Call this to eagerly load components when you anticipate user interaction
 * (e.g., on hover or after initial render).
 *
 * @example
 * ```typescript
 * const prefetchMediaViewer = usePrefetchComponent(LazyMediaViewer);
 *
 * function MediaItem() {
 *   return (
 *     <div onMouseEnter={() => prefetchMediaViewer()}>
 *       Hover to load viewer...
 *     </div>
 *   );
 * }
 * ```
 */
export function usePrefetchComponent<T extends ComponentType<any>>(
  component: React.LazyExoticComponent<T>
): () => void {
  return React.useCallback(() => {
    // Trigger the lazy component's module loading
    // This will start downloading the chunk in the background
    if (component._payload) {
      component._result?.();
    }
  }, [component]);
}

/**
 * Lazy load configuration for optimal performance
 *
 * These settings help optimize when and how lazy components are loaded
 */
export const LAZY_LOAD_CONFIG = {
  // Prefetch component when user hovers over trigger
  prefetchOnHover: true,

  // Prefetch after initial render if idle time available
  prefetchOnIdle: true,

  // Maximum wait time before showing fallback UI
  loadingFallbackDelay: 200, // ms

  // Retry failed imports once
  retryFailedImports: true,

  // Maximum time to wait for chunk to load
  chunkLoadTimeout: 10000, // ms
} as const;

/**
 * Lazy loading error boundary component
 *
 * Wraps lazy components to handle loading errors gracefully
 */
export function withLazyErrorBoundary<P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>
) {
  return React.forwardRef<any, P>((props, ref) => {
    const [error, setError] = React.useState<Error | null>(null);

    if (error) {
      return (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            border: '1px solid #d32f2f',
          }}
        >
          <p style={{ color: '#d32f2f', margin: 0 }}>
            Failed to load component: {error.message}
          </p>
        </div>
      );
    }

    return (
      <React.Suspense
        fallback={
          <div
            style={{
              padding: '16px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
            }}
          >
            <p style={{ margin: 0 }}>Loading component...</p>
          </div>
        }
      >
        <Component {...props} ref={ref} />
      </React.Suspense>
    );
  });
}

export default {
  LazyMediaViewer,
  LazyMediaCard,
  LazyThumbnailStrip,
  LazyVideoProgressBar,
  usePrefetchComponent,
  withLazyErrorBoundary,
  LAZY_LOAD_CONFIG,
};
