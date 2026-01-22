/**
 * useResumeUpload - Resume interrupted uploads
 */

import { useQuery } from '@tanstack/react-query';
import { useUploadClient } from './MediaApiProvider';
import type { ActiveUploadsResponseDto } from '../api/types';

/**
 * Hook to fetch active uploads that can be resumed
 *
 * @example
 * ```tsx
 * function ResumeUploadList() {
 *   const { data: activeUploads, isLoading } = useActiveUploads();
 *   const { resumeUpload, isResuming } = useMediaUpload();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!activeUploads?.uploads.length) return <div>No active uploads</div>;
 *
 *   return (
 *     <div>
 *       {activeUploads.uploads.map((upload) => (
 *         <div key={upload.sessionId}>
 *           <p>{upload.filename} - {upload.progress}%</p>
 *           <button onClick={() => resumeUpload(upload.sessionId, file)}>
 *             Resume
 *           </button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useActiveUploads(options?: { enabled?: boolean }) {
  const client = useUploadClient();

  return useQuery({
    queryKey: ['uploads', 'active'],
    queryFn: async ({ signal }) => client.getActiveUploads(signal),
    enabled: options?.enabled ?? true,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
