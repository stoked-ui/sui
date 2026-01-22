/**
 * useMediaItem - Fetch and cache a single media item
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useMediaClient } from './MediaApiProvider';
import type { MediaDocument } from '../api/types';

export interface UseMediaItemOptions {
  /** Enable/disable the query */
  enabled?: boolean;
  /** Refetch interval in milliseconds */
  refetchInterval?: number;
  /** Callback when data is fetched successfully */
  onSuccess?: (data: MediaDocument) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Hook to fetch a single media item by ID
 *
 * @example
 * ```tsx
 * function MediaDetail({ mediaId }: { mediaId: string }) {
 *   const { data: media, isLoading, error } = useMediaItem(mediaId);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!media) return null;
 *
 *   return (
 *     <div>
 *       <h1>{media.title}</h1>
 *       <p>{media.description}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMediaItem(
  mediaId: string | null | undefined,
  options: UseMediaItemOptions = {},
): UseQueryResult<MediaDocument, Error> {
  const client = useMediaClient();

  return useQuery({
    queryKey: ['media', mediaId],
    queryFn: async ({ signal }) => {
      if (!mediaId) {
        throw new Error('Media ID is required');
      }
      return client.getMedia(mediaId, signal);
    },
    enabled: !!mediaId && (options.enabled ?? true),
    refetchInterval: options.refetchInterval,
    ...options,
  });
}
