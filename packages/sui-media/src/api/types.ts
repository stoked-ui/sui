/**
 * TypeScript types for Media API Client
 * Re-exports and extends types from @stoked-ui/common
 */

// Re-export DTOs from common package
export type {
  InitiateUploadDto,
  GetMoreUrlsDto,
  PartCompletionDto,
  PresignedUrlDto,
  InitiateUploadResponseDto,
  UploadStatusResponseDto,
  PartCompletionResponseDto,
  CompleteUploadResponseDto,
  ActiveUploadDto,
  ActiveUploadsResponseDto,
} from '@stoked-ui/common';

// Re-export models from common package
export type { Media, MediaDocument } from '@stoked-ui/common';
export type {
  UploadSession,
  UploadSessionDocument,
  UploadPart,
  UploadPartStatus,
  UploadSessionStatus,
} from '@stoked-ui/common';

// ─────────────────────────────────────────────────────────────────────────────
// Client-specific types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configuration for the Media API Client
 */
export interface MediaApiClientConfig {
  /** Base URL of the media API (e.g., 'https://api.example.com') */
  baseUrl: string;
  /** Authentication token (if required) */
  authToken?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Additional headers to include in all requests */
  headers?: Record<string, string>;
}

/**
 * Options for file upload
 */
export interface UploadOptions {
  /** File to upload */
  file: File;
  /** Optional metadata for the media */
  metadata?: Partial<MediaMetadata>;
  /** Progress callback (0-100) */
  onProgress?: (progress: number) => void;
  /** Callback when a chunk is uploaded */
  onChunkComplete?: (completedParts: number, totalParts: number) => void;
  /** Custom chunk size (default: 10MB, min: 5MB, max: 100MB) */
  chunkSize?: number;
  /** AbortController signal for cancellation */
  signal?: AbortSignal;
}

/**
 * Metadata for media items
 */
export interface MediaMetadata {
  title: string;
  description?: string;
  tags?: string[];
  publicity?: 'public' | 'private' | 'paid' | 'deleted';
  embedVisibility?: 'public' | 'authenticated' | 'private';
  price?: number;
  rating?: 'ga' | 'nc17';
}

/**
 * Query parameters for listing media
 */
export interface MediaListParams {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Filter by media type */
  mediaType?: 'video' | 'image';
  /** Filter by publicity */
  publicity?: 'public' | 'private' | 'paid' | 'deleted';
  /** Filter by author ID */
  authorId?: string;
  /** Search query (searches title, description, tags) */
  search?: string;
  /** Sort field */
  sortBy?: 'createdAt' | 'updatedAt' | 'views' | 'score' | 'title';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response for media list
 */
export interface MediaListResponse {
  items: MediaDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Update request for media metadata
 */
export interface UpdateMediaDto {
  title?: string;
  description?: string;
  tags?: string[];
  publicity?: 'public' | 'private' | 'paid' | 'deleted';
  embedVisibility?: 'public' | 'authenticated' | 'private';
  price?: number;
  rating?: 'ga' | 'nc17';
  thumbnail?: string;
}

/**
 * Error response from the API
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}

/**
 * Upload progress state
 */
export interface UploadProgress {
  /** Upload session ID */
  sessionId: string;
  /** Current progress percentage (0-100) */
  progress: number;
  /** Number of completed parts */
  completedParts: number;
  /** Total number of parts */
  totalParts: number;
  /** Bytes uploaded so far */
  uploadedBytes: number;
  /** Total file size in bytes */
  totalBytes: number;
  /** Upload speed in bytes per second (calculated over recent chunks) */
  speed?: number;
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number;
}

/**
 * Result of a completed upload
 */
export interface UploadResult {
  /** Created media ID */
  mediaId: string;
  /** Media type */
  mediaType: 'video' | 'image';
  /** Complete media document */
  media?: MediaDocument;
}

/**
 * Options for resuming an upload
 */
export interface ResumeUploadOptions {
  /** Upload session ID to resume */
  sessionId: string;
  /** File to upload (must match the original file) */
  file: File;
  /** Progress callback */
  onProgress?: (progress: number) => void;
  /** Callback when a chunk is uploaded */
  onChunkComplete?: (completedParts: number, totalParts: number) => void;
  /** AbortController signal for cancellation */
  signal?: AbortSignal;
}

/**
 * Custom error class for Media API errors
 */
export class MediaApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: ApiErrorResponse,
  ) {
    super(message);
    this.name = 'MediaApiError';
    Object.setPrototypeOf(this, MediaApiError.prototype);
  }
}

/**
 * Custom error class for upload errors
 */
export class UploadError extends Error {
  constructor(
    message: string,
    public code?: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'UploadError';
    Object.setPrototypeOf(this, UploadError.prototype);
  }
}
