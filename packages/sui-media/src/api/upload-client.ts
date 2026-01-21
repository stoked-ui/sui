/**
 * UploadClient - Resumable upload client for large media files
 *
 * Features:
 * - Resumable multipart uploads (S3-backed)
 * - Progress tracking with speed estimation
 * - Automatic chunk size calculation
 * - Hash generation for deduplication
 * - Request cancellation support
 * - Retry logic for network errors
 */

import type {
  InitiateUploadDto,
  InitiateUploadResponseDto,
  UploadStatusResponseDto,
  PartCompletionResponseDto,
  CompleteUploadResponseDto,
  GetMoreUrlsDto,
  PartCompletionDto,
  ActiveUploadsResponseDto,
  UploadOptions,
  ResumeUploadOptions,
  UploadProgress,
  UploadResult,
  UploadError as UploadErrorType,
  MediaApiClientConfig,
} from './types';

/**
 * Default chunk size: 10MB (must be between 5MB and 100MB)
 */
const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024;
const MIN_CHUNK_SIZE = 5 * 1024 * 1024;
const MAX_CHUNK_SIZE = 100 * 1024 * 1024;

/**
 * Maximum number of retry attempts for failed uploads
 */
const MAX_RETRIES = 3;

/**
 * Number of presigned URLs to request at once
 */
const URL_BATCH_SIZE = 50;

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

interface UploadState {
  sessionId: string;
  uploadId: string;
  totalParts: number;
  chunkSize: number;
  completedParts: Set<number>;
  pendingUrls: Map<number, string>; // part number -> presigned URL
  file: File;
  startTime: number;
  uploadedBytes: number;
}

export class UploadClient {
  private baseUrl: string;
  private authToken?: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config: MediaApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.authToken = config.authToken;
    this.timeout = config.timeout ?? 30000;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * Update the authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Calculate optimal chunk size based on file size
   */
  private calculateChunkSize(fileSize: number, preferredSize?: number): number {
    if (preferredSize) {
      return Math.max(MIN_CHUNK_SIZE, Math.min(MAX_CHUNK_SIZE, preferredSize));
    }

    // For files under 100MB, use 10MB chunks
    if (fileSize < 100 * 1024 * 1024) {
      return DEFAULT_CHUNK_SIZE;
    }

    // For larger files, use larger chunks (up to 100MB)
    const calculatedSize = Math.ceil(fileSize / 10000); // Max 10000 parts
    return Math.max(
      MIN_CHUNK_SIZE,
      Math.min(MAX_CHUNK_SIZE, calculatedSize),
    );
  }

  /**
   * Generate SHA-256 hash of file for deduplication
   * Uses browser's SubtleCrypto API for performance
   */
  private async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = btoa(String.fromCharCode(...hashArray));
    return hashBase64;
  }

  /**
   * Make API request with auth headers
   */
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    signal?: AbortSignal,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.headers,
      ...options.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const combinedSignal = signal
      ? this.combineSignals([signal, controller.signal])
      : controller.signal;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText,
        }));
        throw new UploadError(
          errorData.message || response.statusText,
          `HTTP_${response.status}`,
        );
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new UploadError(
          signal?.aborted ? 'Upload cancelled' : 'Upload timeout',
          'ABORT',
        );
      }

      throw error;
    }
  }

  /**
   * Combine multiple abort signals
   */
  private combineSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
    return controller.signal;
  }

  /**
   * Upload a file chunk directly to S3 using presigned URL
   */
  private async uploadChunk(
    file: File,
    partNumber: number,
    chunkSize: number,
    presignedUrl: string,
    signal?: AbortSignal,
    retries = 0,
  ): Promise<string> {
    const start = (partNumber - 1) * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: chunk,
        signal,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const etag = response.headers.get('ETag');
      if (!etag) {
        throw new Error('No ETag in response');
      }

      return etag;
    } catch (error) {
      // Retry logic for network errors
      if (retries < MAX_RETRIES && error instanceof Error && error.name !== 'AbortError') {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retries + 1)));
        return this.uploadChunk(file, partNumber, chunkSize, presignedUrl, signal, retries + 1);
      }
      throw error;
    }
  }

  /**
   * Initiate a new upload session
   */
  async initiateUpload(
    file: File,
    options: {
      chunkSize?: number;
      generateHash?: boolean;
      signal?: AbortSignal;
    } = {},
  ): Promise<InitiateUploadResponseDto> {
    const chunkSize = this.calculateChunkSize(file.size, options.chunkSize);

    // Generate hash if requested (for deduplication)
    let hash: string | undefined;
    if (options.generateHash) {
      try {
        hash = await this.generateFileHash(file);
      } catch (error) {
        console.warn('Failed to generate file hash:', error);
      }
    }

    const payload: InitiateUploadDto = {
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      totalSize: file.size,
      chunkSize,
      hash,
    };

    return this.apiRequest<InitiateUploadResponseDto>(
      '/upload/initiate',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      options.signal,
    );
  }

  /**
   * Get upload status and fresh presigned URLs
   */
  async getUploadStatus(
    sessionId: string,
    signal?: AbortSignal,
  ): Promise<UploadStatusResponseDto> {
    return this.apiRequest<UploadStatusResponseDto>(
      `/upload/${sessionId}/status`,
      { method: 'GET' },
      signal,
    );
  }

  /**
   * Get more presigned URLs for pending parts
   */
  async getMoreUrls(
    sessionId: string,
    partNumbers: number[],
    signal?: AbortSignal,
  ): Promise<UploadStatusResponseDto> {
    const payload: GetMoreUrlsDto = { partNumbers };
    return this.apiRequest<UploadStatusResponseDto>(
      `/upload/${sessionId}/urls`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      signal,
    );
  }

  /**
   * Mark a part as completed
   */
  async markPartComplete(
    sessionId: string,
    partNumber: number,
    etag: string,
    signal?: AbortSignal,
  ): Promise<PartCompletionResponseDto> {
    const payload: PartCompletionDto = { etag };
    return this.apiRequest<PartCompletionResponseDto>(
      `/upload/${sessionId}/part/${partNumber}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      signal,
    );
  }

  /**
   * Complete the upload and create the media document
   */
  async completeUpload(
    sessionId: string,
    signal?: AbortSignal,
  ): Promise<CompleteUploadResponseDto> {
    return this.apiRequest<CompleteUploadResponseDto>(
      `/upload/${sessionId}/complete`,
      { method: 'POST' },
      signal,
    );
  }

  /**
   * Abort an upload session
   */
  async abortUpload(sessionId: string, signal?: AbortSignal): Promise<void> {
    await this.apiRequest<void>(
      `/upload/${sessionId}/abort`,
      { method: 'POST' },
      signal,
    );
  }

  /**
   * Get list of active uploads for the current user
   */
  async getActiveUploads(signal?: AbortSignal): Promise<ActiveUploadsResponseDto> {
    return this.apiRequest<ActiveUploadsResponseDto>(
      '/upload/active',
      { method: 'GET' },
      signal,
    );
  }

  /**
   * Upload a file with progress tracking
   */
  async upload(options: UploadOptions): Promise<UploadResult> {
    const {
      file,
      onProgress,
      onChunkComplete,
      chunkSize,
      signal,
    } = options;

    // Check if cancelled before starting
    if (signal?.aborted) {
      throw new UploadError('Upload cancelled', 'ABORT');
    }

    // Initiate upload
    const initResponse = await this.initiateUpload(file, {
      chunkSize,
      generateHash: true,
      signal,
    });

    // Check for duplicate file
    if (initResponse.existingMedia) {
      return {
        mediaId: initResponse.existingMedia.id,
        mediaType: initResponse.existingMedia.type,
      };
    }

    const state: UploadState = {
      sessionId: initResponse.sessionId,
      uploadId: initResponse.uploadId,
      totalParts: initResponse.totalParts,
      chunkSize: initResponse.chunkSize,
      completedParts: new Set(),
      pendingUrls: new Map(
        initResponse.presignedUrls.map((u) => [u.partNumber, u.url]),
      ),
      file,
      startTime: Date.now(),
      uploadedBytes: 0,
    };

    // Upload all parts
    await this.uploadParts(state, { onProgress, onChunkComplete, signal });

    // Complete the upload
    const result = await this.completeUpload(state.sessionId, signal);

    return {
      mediaId: result.mediaId,
      mediaType: result.mediaType,
    };
  }

  /**
   * Resume an interrupted upload
   */
  async resumeUpload(options: ResumeUploadOptions): Promise<UploadResult> {
    const { sessionId, file, onProgress, onChunkComplete, signal } = options;

    // Get current upload status
    const status = await this.getUploadStatus(sessionId, signal);

    if (status.status === 'completed') {
      throw new UploadError('Upload already completed', 'ALREADY_COMPLETED');
    }

    if (status.status === 'aborted' || status.status === 'expired') {
      throw new UploadError(
        `Upload session is ${status.status}`,
        status.status.toUpperCase(),
      );
    }

    const state: UploadState = {
      sessionId: status.sessionId,
      uploadId: '', // Not needed for resume
      totalParts: status.totalParts,
      chunkSize: status.totalSize / status.totalParts,
      completedParts: new Set(
        Array.from({ length: status.totalParts }, (_, i) => i + 1).filter(
          (n) => !status.pendingPartNumbers.includes(n),
        ),
      ),
      pendingUrls: new Map(
        status.presignedUrls?.map((u) => [u.partNumber, u.url]) || [],
      ),
      file,
      startTime: Date.now(),
      uploadedBytes: status.completedParts * (status.totalSize / status.totalParts),
    };

    // Upload remaining parts
    await this.uploadParts(state, { onProgress, onChunkComplete, signal });

    // Complete the upload
    const result = await this.completeUpload(state.sessionId, signal);

    return {
      mediaId: result.mediaId,
      mediaType: result.mediaType,
    };
  }

  /**
   * Upload all pending parts with progress tracking
   */
  private async uploadParts(
    state: UploadState,
    options: {
      onProgress?: (progress: number) => void;
      onChunkComplete?: (completed: number, total: number) => void;
      signal?: AbortSignal;
    },
  ): Promise<void> {
    const { onProgress, onChunkComplete, signal } = options;

    // Get list of pending parts
    const pendingParts = Array.from(
      { length: state.totalParts },
      (_, i) => i + 1,
    ).filter((n) => !state.completedParts.has(n));

    // Upload parts in batches
    for (let i = 0; i < pendingParts.length; i += 1) {
      const partNumber = pendingParts[i];

      // Get presigned URL (request more if needed)
      if (!state.pendingUrls.has(partNumber)) {
        const urlsToRequest = pendingParts
          .slice(i, i + URL_BATCH_SIZE)
          .filter((n) => !state.pendingUrls.has(n));

        const urlResponse = await this.getMoreUrls(
          state.sessionId,
          urlsToRequest,
          signal,
        );

        for (const urlData of urlResponse.presignedUrls || []) {
          state.pendingUrls.set(urlData.partNumber, urlData.url);
        }
      }

      const presignedUrl = state.pendingUrls.get(partNumber);
      if (!presignedUrl) {
        throw new UploadError(
          `No presigned URL for part ${partNumber}`,
          'MISSING_URL',
        );
      }

      // Upload the chunk
      const etag = await this.uploadChunk(
        state.file,
        partNumber,
        state.chunkSize,
        presignedUrl,
        signal,
      );

      // Mark as complete
      await this.markPartComplete(state.sessionId, partNumber, etag, signal);

      state.completedParts.add(partNumber);
      state.uploadedBytes += Math.min(
        state.chunkSize,
        state.file.size - (partNumber - 1) * state.chunkSize,
      );

      // Call progress callbacks
      const progress = Math.round(
        (state.completedParts.size / state.totalParts) * 100,
      );

      if (onProgress) {
        onProgress(progress);
      }

      if (onChunkComplete) {
        onChunkComplete(state.completedParts.size, state.totalParts);
      }
    }
  }
}

/**
 * Create a configured UploadClient instance
 */
export function createUploadClient(config: MediaApiClientConfig): UploadClient {
  return new UploadClient(config);
}
