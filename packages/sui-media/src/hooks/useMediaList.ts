/**
 * useMediaList - Fetch paginated media list with filters
 */

import * as React from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useMediaClient } from './MediaApiProvider';
import type { MediaListParams, MediaListResponse } from '../api/types';

export interface UseMediaListOptions extends MediaListParams {
  /** Enable/disable the query */
  enabled?: boolean;
  /** Keep previous data while fetching new data */
  keepPreviousData?: boolean;
  /** Callback when data is fetched successfully */
  onSuccess?: (data: MediaListResponse) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Hook to fetch a paginated list of media items with optional filters
 *
 * @example
 * ```tsx
 * function MediaGallery() {
 *   const [page, setPage] = useState(1);
 *   const { data, isLoading, error } = useMediaList({
 *     page,
 *     limit: 20,
 *     publicity: 'public',
 *     sortBy: 'createdAt',
 *     sortOrder: 'desc',
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {data?.items.map((media) => (
 *         <MediaCard key={media.id} media={media} />
 *       ))}
 *       <Pagination
 *         page={page}
 *         totalPages={data?.totalPages || 1}
 *         onChange={setPage}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useMediaList(
  options: UseMediaListOptions = {},
): UseQueryResult<MediaListResponse, Error> {
  const client = useMediaClient();

  const {
    enabled = true,
    keepPreviousData = true,
    onSuccess,
    onError,
    ...params
  } = options;

  const query = useQuery({
    queryKey: ['media', 'list', params],
    queryFn: async ({ signal }) => client.listMedia(params, signal),
    enabled,
    placeholderData: keepPreviousData ? (prev) => prev : undefined,
  });

  // Handle success/error callbacks via useEffect since they're removed in v5
  React.useEffect(() => {
    if (query.isSuccess && onSuccess) {
      onSuccess(query.data);
    }
  }, [query.isSuccess, query.data, onSuccess]);

  React.useEffect(() => {
    if (query.isError && onError) {
      onError(query.error);
    }
  }, [query.isError, query.error, onError]);

  return query as UseQueryResult<MediaListResponse, Error>;
}
