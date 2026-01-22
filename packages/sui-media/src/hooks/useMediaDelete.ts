/**
 * useMediaDelete - Delete media items
 */

import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { useMediaClient } from './MediaApiProvider';

export interface UseMediaDeleteOptions {
  /** Callback when deletion is successful */
  onSuccess?: (mediaId: string) => void;
  /** Callback when an error occurs */
  onError?: (error: Error, mediaId: string) => void;
  /** Permanently delete (default: false for soft delete) */
  permanent?: boolean;
  /** Invalidate related queries after successful deletion */
  invalidateQueries?: boolean;
}

/**
 * Hook to delete a media item
 *
 * @example
 * ```tsx
 * function MediaActions({ mediaId }: { mediaId: string }) {
 *   const { mutate: deleteMedia, isLoading } = useMediaDelete({
 *     onSuccess: () => {
 *       navigate('/media');
 *       toast.success('Media deleted successfully');
 *     },
 *   });
 *
 *   return (
 *     <button
 *       onClick={() => deleteMedia(mediaId)}
 *       disabled={isLoading}
 *     >
 *       {isLoading ? 'Deleting...' : 'Delete'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useMediaDelete(
  options: UseMediaDeleteOptions = {},
): UseMutationResult<void, Error, string> {
  const client = useMediaClient();
  const queryClient = useQueryClient();
  const { invalidateQueries = true, permanent = false, ...mutationOptions } = options;

  return useMutation({
    mutationFn: async (mediaId: string) => {
      if (permanent) {
        return client.permanentlyDeleteMedia(mediaId);
      }
      return client.deleteMedia(mediaId);
    },
    onSuccess: (data, variables) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['media', variables] });

      // Invalidate list queries to refetch
      if (invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['media', 'list'] });
      }

      // Call user-provided onSuccess
      if (options.onSuccess) {
        options.onSuccess(variables);
      }
    },
    onError: (error, variables) => {
      // Call user-provided onError
      if (options.onError) {
        options.onError(error, variables);
      }
    },
  });
}
