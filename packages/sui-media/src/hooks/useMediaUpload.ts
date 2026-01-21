/**
 * useMediaUpload - Upload media files with progress tracking
 */

import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUploadClient } from './MediaApiProvider';
import type { UploadOptions, UploadResult, UploadProgress } from '../api/types';

export interface UseMediaUploadOptions {
  /** Callback when upload is successful */
  onSuccess?: (result: UploadResult) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback for progress updates */
  onProgress?: (progress: UploadProgress) => void;
  /** Default chunk size for uploads */
  defaultChunkSize?: number;
  /** Invalidate media list after successful upload */
  invalidateQueries?: boolean;
}

export interface UploadState {
  /** Current upload progress (0-100) */
  progress: number;
  /** Upload session ID (for resuming) */
  sessionId?: string;
  /** Number of completed parts */
  completedParts: number;
  /** Total number of parts */
  totalParts: number;
  /** Bytes uploaded so far */
  uploadedBytes: number;
  /** Total file size */
  totalBytes: number;
  /** Upload speed in bytes per second */
  speed?: number;
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number;
}

/**
 * Hook to upload media files with progress tracking and cancellation
 *
 * @example
 * ```tsx
 * function MediaUploader() {
 *   const {
 *     upload,
 *     isUploading,
 *     progress,
 *     cancel,
 *     error,
 *   } = useMediaUpload({
 *     onSuccess: (result) => {
 *       console.log('Upload complete:', result.mediaId);
 *       navigate(`/media/${result.mediaId}`);
 *     },
 *   });
 *
 *   const handleFileSelect = (file: File) => {
 *     upload(file);
 *   };
 *
 *   return (
 *     <div>
 *       <input type="file" onChange={(e) => handleFileSelect(e.target.files[0])} />
 *       {isUploading && (
 *         <div>
 *           <ProgressBar progress={progress.progress} />
 *           <button onClick={cancel}>Cancel</button>
 *         </div>
 *       )}
 *       {error && <div>Error: {error.message}</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMediaUpload(options: UseMediaUploadOptions = {}) {
  const client = useUploadClient();
  const queryClient = useQueryClient();
  const { invalidateQueries = true, ...mutationOptions } = options;

  const [uploadState, setUploadState] = useState<UploadState>({
    progress: 0,
    completedParts: 0,
    totalParts: 0,
    uploadedBytes: 0,
    totalBytes: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastProgressTimeRef = useRef<number>(0);
  const lastUploadedBytesRef = useRef<number>(0);

  // Mutation for the upload
  const mutation = useMutation({
    mutationFn: async (uploadOptions: UploadOptions) => {
      // Create abort controller
      abortControllerRef.current = new AbortController();
      startTimeRef.current = Date.now();
      lastProgressTimeRef.current = Date.now();
      lastUploadedBytesRef.current = 0;

      // Reset state
      setUploadState({
        progress: 0,
        completedParts: 0,
        totalParts: 0,
        uploadedBytes: 0,
        totalBytes: uploadOptions.file.size,
      });

      // Upload with progress tracking
      return client.upload({
        ...uploadOptions,
        signal: abortControllerRef.current.signal,
        onProgress: (progress) => {
          const now = Date.now();
          const timeDiff = (now - lastProgressTimeRef.current) / 1000; // seconds
          const bytesDiff = uploadState.uploadedBytes - lastUploadedBytesRef.current;
          const speed = timeDiff > 0 ? bytesDiff / timeDiff : 0;
          const remainingBytes = uploadOptions.file.size - uploadState.uploadedBytes;
          const estimatedTimeRemaining = speed > 0 ? (remainingBytes / speed) * 1000 : 0;

          const progressData: UploadProgress = {
            sessionId: uploadState.sessionId || '',
            progress,
            completedParts: uploadState.completedParts,
            totalParts: uploadState.totalParts,
            uploadedBytes: uploadState.uploadedBytes,
            totalBytes: uploadOptions.file.size,
            speed,
            estimatedTimeRemaining,
          };

          setUploadState((prev) => ({
            ...prev,
            progress,
            speed,
            estimatedTimeRemaining,
          }));

          if (options.onProgress) {
            options.onProgress(progressData);
          }

          lastProgressTimeRef.current = now;
          lastUploadedBytesRef.current = uploadState.uploadedBytes;
        },
        onChunkComplete: (completedParts, totalParts) => {
          const chunkSize = uploadOptions.chunkSize || (10 * 1024 * 1024);
          const uploadedBytes = completedParts * chunkSize;

          setUploadState((prev) => ({
            ...prev,
            completedParts,
            totalParts,
            uploadedBytes: Math.min(uploadedBytes, uploadOptions.file.size),
          }));
        },
      });
    },
    onSuccess: (result, variables, context) => {
      // Reset state
      setUploadState({
        progress: 100,
        completedParts: uploadState.totalParts,
        totalParts: uploadState.totalParts,
        uploadedBytes: uploadState.totalBytes,
        totalBytes: uploadState.totalBytes,
      });

      // Invalidate queries
      if (invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['media', 'list'] });
      }

      // Call user callback
      if (options.onSuccess) {
        options.onSuccess(result);
      }
    },
    onError: (error, variables, context) => {
      // Reset abort controller
      abortControllerRef.current = null;

      // Call user callback
      if (options.onError) {
        options.onError(error as Error);
      }
    },
    ...mutationOptions,
  });

  /**
   * Start uploading a file
   */
  const upload = useCallback(
    (file: File, uploadOptions?: Partial<UploadOptions>) => {
      mutation.mutate({
        file,
        chunkSize: options.defaultChunkSize,
        ...uploadOptions,
      });
    },
    [mutation, options.defaultChunkSize],
  );

  /**
   * Cancel the current upload
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    mutation.reset();
  }, [mutation]);

  return {
    /** Upload a file */
    upload,
    /** Whether an upload is in progress */
    isUploading: mutation.isPending,
    /** Whether the upload succeeded */
    isSuccess: mutation.isSuccess,
    /** Whether the upload failed */
    isError: mutation.isError,
    /** Upload error if any */
    error: mutation.error,
    /** Upload result (mediaId, mediaType) */
    result: mutation.data,
    /** Current upload progress and statistics */
    progress: uploadState,
    /** Cancel the current upload */
    cancel,
    /** Reset the upload state */
    reset: mutation.reset,
  };
}
