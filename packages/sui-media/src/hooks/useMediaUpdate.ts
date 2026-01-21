/**
 * useMediaUpdate - Update media metadata
 */

import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { useMediaClient } from './MediaApiProvider';
import type { MediaDocument, UpdateMediaDto } from '../api/types';

export interface UseMediaUpdateOptions {
  /** Callback when update is successful */
  onSuccess?: (data: MediaDocument, variables: UpdateMediaDto) => void;
  /** Callback when an error occurs */
  onError?: (error: Error, variables: UpdateMediaDto) => void;
  /** Invalidate related queries after successful update */
  invalidateQueries?: boolean;
}

/**
 * Hook to update media metadata
 *
 * @example
 * ```tsx
 * function MediaEditor({ mediaId }: { mediaId: string }) {
 *   const { mutate: updateMedia, isLoading } = useMediaUpdate(mediaId);
 *
 *   const handleSubmit = (formData) => {
 *     updateMedia({
 *       title: formData.title,
 *       description: formData.description,
 *       tags: formData.tags,
 *       publicity: formData.publicity,
 *     }, {
 *       onSuccess: () => {
 *         toast.success('Media updated successfully!');
 *       },
 *     });
 *   };
 *
 *   return <MediaForm onSubmit={handleSubmit} isLoading={isLoading} />;
 * }
 * ```
 */
export function useMediaUpdate(
  mediaId: string,
  options: UseMediaUpdateOptions = {},
): UseMutationResult<MediaDocument, Error, UpdateMediaDto> {
  const client = useMediaClient();
  const queryClient = useQueryClient();
  const { invalidateQueries = true, ...mutationOptions } = options;

  return useMutation({
    mutationFn: async (data: UpdateMediaDto) => client.updateMedia(mediaId, data),
    onSuccess: (data, variables, context) => {
      // Update the cached media item
      queryClient.setQueryData(['media', mediaId], data);

      // Invalidate list queries to refetch
      if (invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['media', 'list'] });
      }

      // Call user-provided onSuccess
      if (options.onSuccess) {
        options.onSuccess(data, variables);
      }
    },
    ...mutationOptions,
  });
}
