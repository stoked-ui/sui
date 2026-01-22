/**
 * Mock implementation of MediaApiClient for testing
 */
export class MockMediaApiClient {
  private mockResponses: Map<string, any> = new Map();
  private mockErrors: Map<string, Error> = new Map();

  // Track calls for verification
  public calls: {
    method: string;
    args: any[];
  }[] = [];

  constructor() {
    this.reset();
  }

  /**
   * Reset all mocks and call tracking
   */
  reset() {
    this.mockResponses.clear();
    this.mockErrors.clear();
    this.calls = [];
  }

  /**
   * Set a mock response for a specific method
   */
  setMockResponse(method: string, response: any) {
    this.mockResponses.set(method, response);
  }

  /**
   * Set a mock error for a specific method
   */
  setMockError(method: string, error: Error) {
    this.mockErrors.set(method, error);
  }

  /**
   * Track a method call
   */
  private trackCall(method: string, args: any[]) {
    this.calls.push({ method, args });
  }

  /**
   * Get calls for a specific method
   */
  getCallsFor(method: string) {
    return this.calls.filter((call) => call.method === method);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Upload Methods
  // ─────────────────────────────────────────────────────────────────────────────

  async initiateUpload(data: {
    filename: string;
    mimeType: string;
    totalSize: number;
    hash?: string;
  }) {
    this.trackCall('initiateUpload', [data]);

    if (this.mockErrors.has('initiateUpload')) {
      throw this.mockErrors.get('initiateUpload');
    }

    return (
      this.mockResponses.get('initiateUpload') || {
        sessionId: 'session-123',
        uploadId: 'upload-123',
        presignedUrls: [
          { partNumber: 1, url: 'https://test-url.example.com' },
        ],
        totalParts: 1,
        chunkSize: 10 * 1024 * 1024,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    );
  }

  async getUploadStatus(sessionId: string, includeUrls = true) {
    this.trackCall('getUploadStatus', [sessionId, includeUrls]);

    if (this.mockErrors.has('getUploadStatus')) {
      throw this.mockErrors.get('getUploadStatus');
    }

    return (
      this.mockResponses.get('getUploadStatus') || {
        sessionId,
        status: 'in_progress',
        filename: 'test-video.mp4',
        totalSize: 10 * 1024 * 1024,
        totalParts: 1,
        completedParts: 0,
        progress: 0,
        pendingPartNumbers: [1],
        presignedUrls: includeUrls
          ? [{ partNumber: 1, url: 'https://test-url.example.com' }]
          : undefined,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    );
  }

  async markPartCompleted(sessionId: string, partNumber: number, etag: string) {
    this.trackCall('markPartCompleted', [sessionId, partNumber, etag]);

    if (this.mockErrors.has('markPartCompleted')) {
      throw this.mockErrors.get('markPartCompleted');
    }

    return (
      this.mockResponses.get('markPartCompleted') || {
        completedParts: 1,
        totalParts: 1,
        progress: 100,
      }
    );
  }

  async completeUpload(sessionId: string) {
    this.trackCall('completeUpload', [sessionId]);

    if (this.mockErrors.has('completeUpload')) {
      throw this.mockErrors.get('completeUpload');
    }

    return (
      this.mockResponses.get('completeUpload') || {
        mediaId: 'media-123',
        mediaType: 'video',
      }
    );
  }

  async abortUpload(sessionId: string) {
    this.trackCall('abortUpload', [sessionId]);

    if (this.mockErrors.has('abortUpload')) {
      throw this.mockErrors.get('abortUpload');
    }

    return this.mockResponses.get('abortUpload') || undefined;
  }

  async getActiveUploads() {
    this.trackCall('getActiveUploads', []);

    if (this.mockErrors.has('getActiveUploads')) {
      throw this.mockErrors.get('getActiveUploads');
    }

    return (
      this.mockResponses.get('getActiveUploads') || {
        uploads: [],
      }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Media Methods
  // ─────────────────────────────────────────────────────────────────────────────

  async listMedia(query?: {
    type?: 'video' | 'image';
    limit?: number;
    offset?: number;
  }) {
    this.trackCall('listMedia', [query]);

    if (this.mockErrors.has('listMedia')) {
      throw this.mockErrors.get('listMedia');
    }

    return (
      this.mockResponses.get('listMedia') || {
        items: [],
        total: 0,
        limit: query?.limit || 20,
        offset: query?.offset || 0,
      }
    );
  }

  async getMedia(id: string) {
    this.trackCall('getMedia', [id]);

    if (this.mockErrors.has('getMedia')) {
      throw this.mockErrors.get('getMedia');
    }

    return (
      this.mockResponses.get('getMedia') || {
        id,
        userId: 'user-123',
        type: 'video',
        file: 'uploads/user-123/video.mp4',
        filename: 'test-video.mp4',
        mime: 'video/mp4',
        size: 10 * 1024 * 1024,
        bucket: 'test-bucket',
        region: 'us-east-1',
        publicity: 'private',
        deleted: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }
    );
  }

  async updateMedia(id: string, data: any) {
    this.trackCall('updateMedia', [id, data]);

    if (this.mockErrors.has('updateMedia')) {
      throw this.mockErrors.get('updateMedia');
    }

    return (
      this.mockResponses.get('updateMedia') || {
        id,
        ...data,
        updatedAt: new Date(),
      }
    );
  }

  async deleteMedia(id: string) {
    this.trackCall('deleteMedia', [id]);

    if (this.mockErrors.has('deleteMedia')) {
      throw this.mockErrors.get('deleteMedia');
    }

    return this.mockResponses.get('deleteMedia') || undefined;
  }

  async extractMetadata(id: string) {
    this.trackCall('extractMetadata', [id]);

    if (this.mockErrors.has('extractMetadata')) {
      throw this.mockErrors.get('extractMetadata');
    }

    return (
      this.mockResponses.get('extractMetadata') || {
        duration: 120,
        width: 1920,
        height: 1080,
        codec: 'h264',
        bitrate: 5000000,
      }
    );
  }

  async generateThumbnail(id: string, options?: { timestamp?: number }) {
    this.trackCall('generateThumbnail', [id, options]);

    if (this.mockErrors.has('generateThumbnail')) {
      throw this.mockErrors.get('generateThumbnail');
    }

    return (
      this.mockResponses.get('generateThumbnail') || {
        thumbnail: 'thumbs/video-thumb.jpg',
      }
    );
  }
}

/**
 * Create a new mock API client instance
 */
export function createMockApiClient() {
  return new MockMediaApiClient();
}

/**
 * Global mock instance for simple use cases
 */
export const mockApiClient = new MockMediaApiClient();
