/**
 * useHybridMetadata Hook
 *
 * Implements hybrid metadata extraction strategy:
 * - Client-side extraction for immediate preview
 * - Server-side extraction for accuracy (async)
 * - Smart defaults based on file size
 * - Graceful fallback handling
 */

import * as React from 'react';
import type { MediaApiClient } from '../../api';
import type { ExtendedMediaItem } from './MediaCard.types';

interface HybridMetadataOptions {
  preferServer?: boolean;
  clientTimeout?: number;
  serverTimeout?: number;
  fallbackToClient?: boolean;
  fileSizeThreshold?: number; // Default: 10MB
}

interface MetadataState {
  duration?: number;
  width?: number;
  height?: number;
  codec?: string;
  bitrate?: number;
  source: 'initial' | 'client' | 'server' | 'error';
  isLoading: boolean;
  error?: string;
}

const DEFAULT_OPTIONS: Required<HybridMetadataOptions> = {
  preferServer: true,
  clientTimeout: 5000,
  serverTimeout: 15000,
  fallbackToClient: true,
  fileSizeThreshold: 10 * 1024 * 1024, // 10MB
};

/**
 * Hook for hybrid metadata extraction
 */
export function useHybridMetadata(
  item: ExtendedMediaItem,
  apiClient?: MediaApiClient,
  options: HybridMetadataOptions = {},
  onMetadataLoaded?: (metadata: Partial<ExtendedMediaItem>) => void,
): MetadataState {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [metadata, setMetadata] = React.useState<MetadataState>({
    duration: item.duration,
    width: item.width,
    height: item.height,
    codec: item.codec,
    bitrate: item.bitrate,
    source: 'initial',
    isLoading: false,
  });

  React.useEffect(() => {
    // Skip if not a video or already has complete metadata
    if (item.mediaType !== 'video') {
      return;
    }

    // Skip if no API client and server is required
    if (!apiClient && opts.preferServer) {
      return;
    }

    // If metadata is already complete, no need to fetch
    if (item.duration && item.width && item.height) {
      return;
    }

    // Determine strategy based on file size and options
    const shouldUseServer =
      apiClient &&
      (opts.preferServer || (item.size && item.size >= opts.fileSizeThreshold));

    if (!shouldUseServer) {
      // No server or prefer client-side
      return;
    }

    // Fetch server-side metadata
    let cancelled = false;
    setMetadata(prev => ({ ...prev, isLoading: true }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), opts.serverTimeout);

    const fetchServerMetadata = async () => {
      try {
        if (!item._id) {
          throw new Error('Media ID is required for server metadata extraction');
        }

        const result = await apiClient.extractMetadata(item._id, controller.signal);

        if (cancelled) return;

        const newMetadata: MetadataState = {
          duration: result.duration ?? item.duration,
          width: result.width ?? item.width,
          height: result.height ?? item.height,
          codec: result.codec ?? item.codec,
          bitrate: result.bitrate ?? item.bitrate,
          source: 'server',
          isLoading: false,
        };

        setMetadata(newMetadata);

        // Notify parent
        if (onMetadataLoaded) {
          onMetadataLoaded({
            duration: newMetadata.duration,
            width: newMetadata.width,
            height: newMetadata.height,
            codec: newMetadata.codec,
            bitrate: newMetadata.bitrate,
          });
        }
      } catch (error) {
        if (cancelled) return;

        console.error('Server metadata extraction failed:', error);

        setMetadata(prev => ({
          ...prev,
          isLoading: false,
          source: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      } finally {
        clearTimeout(timeoutId);
      }
    };

    fetchServerMetadata();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [item._id, item.mediaType, item.duration, item.width, item.height, item.size, apiClient, opts.preferServer, opts.fileSizeThreshold, opts.serverTimeout, onMetadataLoaded]);

  return metadata;
}
