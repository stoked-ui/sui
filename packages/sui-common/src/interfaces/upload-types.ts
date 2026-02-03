/**
 * Client-safe TypeScript interfaces for upload operations
 * These are plain interfaces without NestJS decorators for client-side usage
 *
 * For NestJS DTO classes with validation decorators, use @stoked-ui/common-api
 */

// ─────────────────────────────────────────────────────────────────────────────
// Request Interfaces (client sends these)
// ─────────────────────────────────────────────────────────────────────────────

export interface InitiateUploadDto {
  /** Original filename of the file being uploaded */
  filename: string;
  /** MIME type of the file */
  mimeType: string;
  /** Total file size in bytes */
  totalSize: number;
  /** SHA-256 hash of the file content for deduplication (base64 encoded) */
  hash?: string;
  /** Chunk size in bytes (default: 10MB, min: 5MB, max: 100MB) */
  chunkSize?: number;
}

export interface GetMoreUrlsDto {
  /** Array of part numbers to get presigned URLs for (1-based) */
  partNumbers: number[];
}

export interface PartCompletionDto {
  /** ETag returned by S3 after uploading the part */
  etag: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Response Interfaces (client receives these)
// ─────────────────────────────────────────────────────────────────────────────

export interface PresignedUrlDto {
  /** Part number (1-based) */
  partNumber: number;
  /** Presigned PUT URL for uploading the part directly to S3 */
  url: string;
}

export interface InitiateUploadResponseDto {
  /** Upload session ID (use this for all subsequent operations) */
  sessionId: string;
  /** S3 multipart upload ID */
  uploadId: string;
  /** Presigned URLs for the first batch of parts */
  presignedUrls: PresignedUrlDto[];
  /** Total number of parts to upload */
  totalParts: number;
  /** Chunk size in bytes */
  chunkSize: number;
  /** When the upload session expires */
  expiresAt: Date;
  /** If set, a duplicate file was found and no upload is needed */
  existingMedia?: {
    type: 'video' | 'image';
    id: string;
  };
}

export interface UploadStatusResponseDto {
  /** Upload session ID */
  sessionId: string;
  /** Current status of the upload */
  status: 'pending' | 'in_progress' | 'completed' | 'aborted' | 'expired';
  /** Original filename */
  filename: string;
  /** Total file size in bytes */
  totalSize: number;
  /** Total number of parts */
  totalParts: number;
  /** Number of completed parts */
  completedParts: number;
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Part numbers that still need to be uploaded */
  pendingPartNumbers: number[];
  /** Fresh presigned URLs for pending parts (up to 50) */
  presignedUrls?: PresignedUrlDto[];
  /** When the upload session expires */
  expiresAt: Date;
}

export interface PartCompletionResponseDto {
  /** Number of completed parts */
  completedParts: number;
  /** Total number of parts */
  totalParts: number;
  /** Upload progress percentage (0-100) */
  progress: number;
}

export interface CompleteUploadResponseDto {
  /** ID of the created media document */
  mediaId: string;
  /** Type of media created */
  mediaType: 'video' | 'image';
}

export interface ActiveUploadDto {
  /** Upload session ID */
  sessionId: string;
  /** Original filename */
  filename: string;
  /** Total file size in bytes */
  totalSize: number;
  /** Upload progress percentage (0-100) */
  progress: number;
  /** When the upload was started */
  createdAt: Date;
  /** When the upload session expires */
  expiresAt: Date;
}

export interface ActiveUploadsResponseDto {
  /** List of active uploads that can be resumed */
  uploads: ActiveUploadDto[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Upload Session Types
// ─────────────────────────────────────────────────────────────────────────────

export type UploadPartStatus = 'pending' | 'uploading' | 'completed' | 'failed';
export type UploadSessionStatus = 'pending' | 'in_progress' | 'completed' | 'aborted' | 'expired';

export interface UploadPart {
  partNumber: number;
  etag?: string;
  size: number;
  status: UploadPartStatus;
  uploadedAt?: Date;
  retryCount: number;
}

export interface UploadSession {
  uploadId: string;
  s3Key: string;
  filename: string;
  mimeType: string;
  totalSize: number;
  chunkSize: number;
  totalParts: number;
  parts: UploadPart[];
  hash?: string;
  status: UploadSessionStatus;
  authorId?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadSessionDocument extends UploadSession {
  _id: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Media Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Media {
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Bucket: string;
  url?: string;
  /** File URL (alias for url, for backward compatibility) */
  file?: string;
  /** Media type indicator */
  mediaType?: 'video' | 'image';
  thumbnail?: string;
  spriteSheet?: string;
  width?: number;
  height?: number;
  duration?: number;
  bitrate?: number;
  codec?: string;
  fps?: number;
  title?: string;
  description?: string;
  tags?: string[];
  publicity?: 'public' | 'private' | 'paid' | 'deleted';
  embedVisibility?: 'public' | 'authenticated' | 'private';
  price?: number;
  rating?: 'ga' | 'nc17';
  views?: number;
  score?: number;
  authorId?: string;
  hash?: string;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
