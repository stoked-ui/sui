/**
 * useServerThumbnail Hook
 *
 * Manages server-generated thumbnails with:
 * - Automatic thumbnail generation for videos
 * - Loading states
 * - Error handling with retry
 * - Caching strategy
 */

import * as React from 'react';
import type { MediaApiClient } from '../../api';
import type { ExtendedMediaItem } from './MediaCard.types';

interface ThumbnailState {
  thumbnailUrl?: string;
  isLoading: boolean;
  error?: string;
  canRetry: boolean;
}

interface UseServerThumbnailOptions {
  /** Timestamp for thumbnail generation (default: 0 or duration/2) */
  timestamp?: number;
  /** Enable automatic thumbnail generation */
  autoGenerate?: boolean;
  /** Size of the thumbnail */
  size?: { width?: number; height?: number };
}

/**
 * Hook for server-generated thumbnails
 */
export function useServerThumbnail(
  item: ExtendedMediaItem,
  apiClient?: MediaApiClient,
  options: UseServerThumbnailOptions = {},
): ThumbnailState & { retry: () => void } {
  const { timestamp, autoGenerate = true, size } = options;

  const [state, setState] = React.useState<ThumbnailState>({
    thumbnailUrl: item.thumbnail || item.paidThumbnail,
    isLoading: false,
    error: undefined,
    canRetry: false,
  });

  const [retryCount, setRetryCount] = React.useState(0);

  const retry = React.useCallback(() => {
    setRetryCount(prev => prev + 1);
    setState(prev => ({ ...prev, error: undefined, canRetry: false }));
  }, []);

  React.useEffect(() => {
    // Skip if not a video or already has thumbnail or no API client
    if (
      item.mediaType !== 'video' ||
      !apiClient ||
      !autoGenerate ||
      (state.thumbnailUrl && !retryCount)
    ) {
      return;
    }

    // Skip if media ID is missing
    if (!item._id) {
      return;
    }

    let cancelled = false;
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    const generateThumbnail = async () => {
      try {
        // Determine timestamp: use provided, or middle of video, or 0
        const thumbTimestamp =
          timestamp ?? (item.duration ? item.duration / 2 : 0);

        const result = await apiClient.generateThumbnail(
          item._id!,
          thumbTimestamp,
          size,
        );

        if (cancelled) return;

        setState({
          thumbnailUrl: result.thumbnailUrl,
          isLoading: false,
          error: undefined,
          canRetry: false,
        });
      } catch (error) {
        if (cancelled) return;

        console.error('Thumbnail generation failed:', error);

        setState({
          thumbnailUrl: state.thumbnailUrl, // Keep existing if any
          isLoading: false,
          error: error instanceof Error ? error.message : 'Thumbnail generation failed',
          canRetry: true,
        });
      }
    };

    generateThumbnail();

    return () => {
      cancelled = true;
    };
  }, [item._id, item.mediaType, item.duration, apiClient, autoGenerate, timestamp, size, retryCount, state.thumbnailUrl]);

  return {
    ...state,
    retry,
  };
}
