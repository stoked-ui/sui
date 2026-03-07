import { useQuery } from '@tanstack/react-query';
import type { MediaGallerySource } from '../components/MediaGallery/MediaGallery.types';
import type { ExtendedMediaItem } from '../components/MediaCard/MediaCard.types';

/**
 * Custom hook to fetch media gallery items from various data sources.
 * Supports direct data, REST API endpoints, and S3-based data.
 * 
 * @param source Data source configuration
 * @returns React Query result with media items
 */
export function useMediaGallery(source: MediaGallerySource) {
  const { data, endpoint, apiKey, s3 } = source;

  return useQuery<ExtendedMediaItem[]>({
    queryKey: ['media-gallery', source],
    queryFn: async () => {
      // 1. Direct Data - Return the data array immediately
      if (data) {
        return data;
      }

      // 2. REST API Endpoint
      if (endpoint) {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (apiKey) {
          // Send as X-API-Key header (common for SUI Media API)
          headers['X-API-Key'] = apiKey;
          // Also send as Bearer token just in case
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await fetch(endpoint, { headers });
        if (!response.ok) {
          throw new Error(`Failed to fetch media from endpoint: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Handle both raw arrays and paginated responses with a 'data' property
        if (Array.isArray(result)) {
          return result;
        } else if (result && Array.isArray(result.data)) {
          return result.data;
        } else if (result && Array.isArray(result.items)) {
          return result.items;
        }
        
        return [];
      }

      // 3. S3-Based Data
      // This assumes a backend proxy at /api/media/s3 that can list the bucket/prefix
      // and generate signed URLs for the frontend to consume.
      if (s3) {
        const s3Query = new URLSearchParams();
        s3Query.append('bucket', s3.bucket);
        if (s3.prefix) s3Query.append('prefix', s3.prefix);
        if (s3.region) s3Query.append('region', s3.region);
        if (s3.endpoint) s3Query.append('endpoint', s3.endpoint);
        
        // Use default S3 proxy endpoint if not specified
        const s3ApiEndpoint = '/api/media/s3';
        
        const response = await fetch(`${s3ApiEndpoint}?${s3Query.toString()}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch media from S3: ${response.statusText}`);
        }

        const result = await response.json();
        return Array.isArray(result) ? result : (result.data || []);
      }

      return [];
    },
    // Don't fetch if no data source is provided
    enabled: !!(data || endpoint || s3),
    // Standard caching settings
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
