/**
 * React Query Integration for Media Metadata Caching
 *
 * Implements intelligent caching strategies for media metadata using React Query.
 * Automatically handles cache invalidation, background refetching, and optimistic updates.
 *
 * Installation required:
 * ```bash
 * pnpm add @tanstack/react-query
 * ```
 *
 * Usage:
 * ```typescript
 * import { useMediaMetadata } from '@stoked-ui/media/hooks';
 * import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
 *
 * const queryClient = new QueryClient({
 *   defaultOptions: {
 *     queries: MEDIA_QUERY_CONFIG,
 *   },
 * });
 *
 * function App() {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <MediaComponent />
 *     </QueryClientProvider>
 *   );
 * }
 *
 * function MediaComponent() {
 *   const { data, isLoading } = useMediaMetadata(file);
 *   // ...
 * }
 * ```
 */

/**
 * Recommended React Query configuration for media metadata
 *
 * These settings balance cache freshness with network efficiency
 */
export const MEDIA_QUERY_CONFIG = {
  // Metadata cache duration: 5 minutes
  staleTime: 5 * 60 * 1000,

  // Cache garbage collection: 10 minutes
  gcTime: 10 * 60 * 1000,

  // Retry failed requests once after 1 second
  retry: 1,
  retryDelay: 1000,

  // Don't refetch in background by default
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  refetchOnMount: false,

  // Abort stale requests
  structuralSharing: true,
};

/**
 * Query configuration for different metadata types
 */
export const METADATA_QUERY_CONFIGS = {
  // Thumbnail metadata - higher freshness
  thumbnail: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },

  // File metadata - very stable, rarely changes
  fileInfo: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },

  // Video duration/codec - stable after extraction
  videoMetadata: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },

  // Image dimensions - very stable
  imageDimensions: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  },

  // Search results - moderate freshness
  searchResults: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
};

/**
 * Query key factory for media operations
 * Ensures consistent key generation and enables targeted cache invalidation
 *
 * @example
 * ```typescript
 * queryClient.invalidateQueries({
 *   queryKey: mediaQueryKeys.metadata(fileId),
 * });
 * ```
 */
export const mediaQueryKeys = {
  all: () => ['media'] as const,
  metadata: {
    all: () => [...mediaQueryKeys.all(), 'metadata'] as const,
    byFile: (fileId: string) =>
      [...mediaQueryKeys.metadata.all(), { fileId }] as const,
    byUrl: (url: string) => [...mediaQueryKeys.metadata.all(), { url }] as const,
  },
  thumbnails: {
    all: () => [...mediaQueryKeys.all(), 'thumbnails'] as const,
    byFile: (fileId: string, size?: string) =>
      [...mediaQueryKeys.thumbnails.all(), { fileId, size }] as const,
  },
  search: {
    all: () => [...mediaQueryKeys.all(), 'search'] as const,
    list: (query: string, filters?: Record<string, any>) =>
      [...mediaQueryKeys.search.all(), { query, filters }] as const,
  },
  extraction: {
    all: () => [...mediaQueryKeys.all(), 'extraction'] as const,
    client: (fileId: string) =>
      [...mediaQueryKeys.extraction.all(), 'client', { fileId }] as const,
    server: (fileId: string) =>
      [...mediaQueryKeys.extraction.all(), 'server', { fileId }] as const,
  },
} as const;

/**
 * Cache invalidation strategies
 *
 * Use these to invalidate relevant caches when data changes
 *
 * @example
 * ```typescript
 * // Invalidate specific file's metadata
 * await queryClient.invalidateQueries({
 *   queryKey: mediaQueryKeys.metadata.byFile(fileId),
 * });
 *
 * // Invalidate all thumbnails for a file
 * await queryClient.invalidateQueries({
 *   queryKey: mediaQueryKeys.thumbnails.byFile(fileId),
 * });
 * ```
 */
export const mediaCacheInvalidation = {
  /**
   * Invalidate all media-related caches
   */
  invalidateAll: (queryClient: any) => {
    return queryClient.invalidateQueries({
      queryKey: mediaQueryKeys.all(),
    });
  },

  /**
   * Invalidate caches for a specific file
   */
  invalidateFile: (queryClient: any, fileId: string) => {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: mediaQueryKeys.metadata.byFile(fileId),
      }),
      queryClient.invalidateQueries({
        queryKey: mediaQueryKeys.thumbnails.byFile(fileId),
      }),
    ]);
  },

  /**
   * Invalidate all metadata caches
   */
  invalidateMetadata: (queryClient: any) => {
    return queryClient.invalidateQueries({
      queryKey: mediaQueryKeys.metadata.all(),
    });
  },

  /**
   * Invalidate all thumbnail caches
   */
  invalidateThumbnails: (queryClient: any) => {
    return queryClient.invalidateQueries({
      queryKey: mediaQueryKeys.thumbnails.all(),
    });
  },

  /**
   * Invalidate search results
   */
  invalidateSearch: (queryClient: any) => {
    return queryClient.invalidateQueries({
      queryKey: mediaQueryKeys.search.all(),
    });
  },
};

/**
 * Optimistic update helper for media operations
 *
 * @example
 * ```typescript
 * const queryClient = useQueryClient();
 *
 * const updateMetadata = useMutation({
 *   mutationFn: async (data) => {
 *     return await api.updateMetadata(data);
 *   },
 *   onMutate: async (newData) => {
 *     // Cancel outgoing refetches
 *     await queryClient.cancelQueries({
 *       queryKey: mediaQueryKeys.metadata.byFile(newData.fileId),
 *     });
 *
 *     // Snapshot previous value
 *     const previousData = queryClient.getQueryData(
 *       mediaQueryKeys.metadata.byFile(newData.fileId)
 *     );
 *
 *     // Optimistically update
 *     queryClient.setQueryData(
 *       mediaQueryKeys.metadata.byFile(newData.fileId),
 *       newData
 *     );
 *
 *     return { previousData };
 *   },
 *   onError: (err, newData, context) => {
 *     // Rollback on error
 *     queryClient.setQueryData(
 *       mediaQueryKeys.metadata.byFile(newData.fileId),
 *       context.previousData
 *     );
 *   },
 *   onSuccess: (data, variables) => {
 *     // Refetch to ensure server consistency
 *     queryClient.invalidateQueries({
 *       queryKey: mediaQueryKeys.metadata.byFile(variables.fileId),
 *     });
 *   },
 * });
 * ```
 */
export function createOptimisticUpdate(fileId: string) {
  return {
    prepare: (previousData: any) => ({
      previousData,
    }),

    revert: (queryClient: any, context: any) => {
      queryClient.setQueryData(
        mediaQueryKeys.metadata.byFile(fileId),
        context.previousData
      );
    },

    confirm: (queryClient: any) => {
      queryClient.invalidateQueries({
        queryKey: mediaQueryKeys.metadata.byFile(fileId),
      });
    },
  };
}

/**
 * Pre-fetch helper for anticipatory caching
 *
 * Call this before user interaction to eagerly load data
 *
 * @example
 * ```typescript
 * const queryClient = useQueryClient();
 *
 * function MediaGallery() {
 *   const handleMediaHover = (fileId: string) => {
 *     prefetchMediaMetadata(queryClient, fileId, fetchMetadataFn);
 *   };
 *
 *   return (
 *     <div>
 *       {items.map(item => (
 *         <div
 *           key={item.id}
 *           onMouseEnter={() => handleMediaHover(item.id)}
 *         >
 *           {item.name}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function prefetchMediaMetadata(
  queryClient: any,
  fileId: string,
  fetchFn: (fileId: string) => Promise<any>
) {
  return queryClient.prefetchQuery({
    queryKey: mediaQueryKeys.metadata.byFile(fileId),
    queryFn: () => fetchFn(fileId),
    staleTime: METADATA_QUERY_CONFIGS.fileInfo.staleTime,
  });
}

/**
 * Hook for setting up React Query with media-optimized settings
 *
 * @example
 * ```typescript
 * import { useMediaQueryClient } from '@stoked-ui/media/hooks';
 *
 * function App() {
 *   const queryClient = useMediaQueryClient();
 *
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <YourApp />
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 */
export function getMediaQueryClient() {
  if (typeof window === 'undefined') {
    throw new Error('useMediaQueryClient can only be used in browser environment');
  }

  try {
    // Dynamic import to avoid hard dependency
    const { QueryClient } = require('@tanstack/react-query');

    return new QueryClient({
      defaultOptions: {
        queries: MEDIA_QUERY_CONFIG,
      },
    });
  } catch (error) {
    throw new Error(
      'React Query is required for media caching. Install with: pnpm add @tanstack/react-query'
    );
  }
}

export default {
  MEDIA_QUERY_CONFIG,
  METADATA_QUERY_CONFIGS,
  mediaQueryKeys,
  mediaCacheInvalidation,
  createOptimisticUpdate,
  prefetchMediaMetadata,
  getMediaQueryClient,
};
