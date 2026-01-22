/**
 * MediaApiClient - Type-safe client for Media API operations
 *
 * Provides methods for all CRUD operations on media resources with:
 * - TypeScript type safety
 * - Automatic error handling
 * - Request cancellation support
 * - Authentication header injection
 * - Configurable base URL and timeout
 */

import type {
  MediaApiClientConfig,
  MediaListParams,
  MediaListResponse,
  UpdateMediaDto,
  MediaDocument,
  MediaApiError,
  ApiErrorResponse,
} from './types';

/**
 * HTTP client for making requests to the Media API
 */
export class MediaApiClient {
  private baseUrl: string;
  private authToken?: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config: MediaApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
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
   * Remove the authentication token
   */
  clearAuthToken(): void {
    this.authToken = undefined;
  }

  /**
   * Make an HTTP request with error handling and timeout
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    signal?: AbortSignal,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Merge headers
    const headers: Record<string, string> = {
      ...this.headers,
      ...(options.headers as Record<string, string> || {}),
    };

    // Add auth token if available
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    // Combine timeout signal with provided signal
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

      // Handle non-OK responses
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({
          statusCode: response.status,
          message: response.statusText,
        }));

        const error = new Error(
          Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message || response.statusText,
        ) as MediaApiError;

        error.statusCode = response.status;
        error.response = errorData;
        throw error;
      }

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        if (signal?.aborted) {
          throw new Error('Request was cancelled');
        }
        throw new Error('Request timeout');
      }

      throw error;
    }
  }

  /**
   * Combine multiple abort signals into one
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

  // ─────────────────────────────────────────────────────────────────────────
  // Media CRUD Operations
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get a single media item by ID
   */
  async getMedia(id: string, signal?: AbortSignal): Promise<MediaDocument> {
    return this.request<MediaDocument>(`/media/${id}`, { method: 'GET' }, signal);
  }

  /**
   * List media items with optional filters and pagination
   */
  async listMedia(
    params?: MediaListParams,
    signal?: AbortSignal,
  ): Promise<MediaListResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/media${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<MediaListResponse>(endpoint, { method: 'GET' }, signal);
  }

  /**
   * Update media metadata
   */
  async updateMedia(
    id: string,
    data: UpdateMediaDto,
    signal?: AbortSignal,
  ): Promise<MediaDocument> {
    return this.request<MediaDocument>(
      `/media/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      signal,
    );
  }

  /**
   * Delete a media item (soft delete - sets publicity to 'deleted')
   */
  async deleteMedia(id: string, signal?: AbortSignal): Promise<void> {
    await this.request<void>(`/media/${id}`, { method: 'DELETE' }, signal);
  }

  /**
   * Permanently delete a media item from storage
   */
  async permanentlyDeleteMedia(id: string, signal?: AbortSignal): Promise<void> {
    await this.request<void>(
      `/media/${id}/permanent`,
      { method: 'DELETE' },
      signal,
    );
  }

  /**
   * Get media by author
   */
  async getMediaByAuthor(
    authorId: string,
    params?: Omit<MediaListParams, 'authorId'>,
    signal?: AbortSignal,
  ): Promise<MediaListResponse> {
    return this.listMedia({ ...params, authorId }, signal);
  }

  /**
   * Search media by query
   */
  async searchMedia(
    query: string,
    params?: Omit<MediaListParams, 'search'>,
    signal?: AbortSignal,
  ): Promise<MediaListResponse> {
    return this.listMedia({ ...params, search: query }, signal);
  }

  /**
   * Get public media (for public galleries)
   */
  async getPublicMedia(
    params?: Omit<MediaListParams, 'publicity'>,
    signal?: AbortSignal,
  ): Promise<MediaListResponse> {
    return this.listMedia({ ...params, publicity: 'public' }, signal);
  }

  /**
   * Like a media item
   */
  async likeMedia(id: string, signal?: AbortSignal): Promise<MediaDocument> {
    return this.request<MediaDocument>(
      `/media/${id}/like`,
      { method: 'POST' },
      signal,
    );
  }

  /**
   * Unlike a media item
   */
  async unlikeMedia(id: string, signal?: AbortSignal): Promise<MediaDocument> {
    return this.request<MediaDocument>(
      `/media/${id}/unlike`,
      { method: 'POST' },
      signal,
    );
  }

  /**
   * Dislike a media item
   */
  async dislikeMedia(id: string, signal?: AbortSignal): Promise<MediaDocument> {
    return this.request<MediaDocument>(
      `/media/${id}/dislike`,
      { method: 'POST' },
      signal,
    );
  }

  /**
   * Record a view for a media item
   */
  async viewMedia(id: string, signal?: AbortSignal): Promise<MediaDocument> {
    return this.request<MediaDocument>(
      `/media/${id}/view`,
      { method: 'POST' },
      signal,
    );
  }

  /**
   * Get media statistics
   */
  async getMediaStats(id: string, signal?: AbortSignal): Promise<{
    views: number;
    uniqueViews: number;
    likes: number;
    dislikes: number;
    score: number;
  }> {
    return this.request(
      `/media/${id}/stats`,
      { method: 'GET' },
      signal,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Metadata & Thumbnail Operations
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Extract metadata from a media file
   */
  async extractMetadata(id: string, signal?: AbortSignal): Promise<{
    duration?: number;
    width?: number;
    height?: number;
    codec?: string;
    bitrate?: number;
    fps?: number;
    hasAudio?: boolean;
    audioBitrate?: number;
    audioCodec?: string;
    fileSize?: number;
  }> {
    return this.request(
      `/media/${id}/extract-metadata`,
      { method: 'POST' },
      signal,
    );
  }

  /**
   * Generate a thumbnail for a video at a specific timestamp
   */
  async generateThumbnail(
    id: string,
    timestamp: number,
    size?: { width?: number; height?: number },
    signal?: AbortSignal,
  ): Promise<{
    thumbnailUrl: string;
    thumbnailKey: string;
    timestamp: number;
    width: number;
    height: number;
  }> {
    return this.request(
      `/media/${id}/generate-thumbnail`,
      {
        method: 'POST',
        body: JSON.stringify({ timestamp, size }),
      },
      signal,
    );
  }

  /**
   * Generate sprite sheet for video scrubbing
   */
  async generateSpriteSheet(
    id: string,
    options?: {
      frameWidth?: number;
      frameHeight?: number;
      framesPerRow?: number;
      interval?: number;
    },
    signal?: AbortSignal,
  ): Promise<{
    spriteSheetUrl: string;
    spriteSheetKey: string;
    spriteConfig: {
      frameWidth: number;
      frameHeight: number;
      framesPerRow: number;
      totalFrames: number;
      interval: number;
    };
    totalFrames: number;
  }> {
    return this.request(
      `/media/${id}/generate-sprites`,
      {
        method: 'POST',
        body: JSON.stringify(options || {}),
      },
      signal,
    );
  }
}

/**
 * Create a configured MediaApiClient instance
 */
export function createMediaApiClient(config: MediaApiClientConfig): MediaApiClient {
  return new MediaApiClient(config);
}
