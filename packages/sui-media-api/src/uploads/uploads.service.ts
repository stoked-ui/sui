import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CompletedPart } from '@aws-sdk/client-s3';
import { S3Service } from '../s3/s3.service';
import { ConfigService } from '@nestjs/config';

/**
 * Default chunk size: 10 MB
 * S3 minimum is 5MB, but 10MB provides a good balance of:
 * - Fewer parts (fewer API calls)
 * - Reasonable retry size
 * - Good progress granularity
 */
const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Maximum number of presigned URLs to generate per request
 */
const MAX_URLS_PER_REQUEST = 50;

/**
 * Session expiration time: 7 days (matches S3 multipart upload expiration)
 */
const SESSION_EXPIRATION_DAYS = 7;

/**
 * Status of a part within a multipart upload
 */
export type UploadPartStatus = 'pending' | 'uploading' | 'completed' | 'failed';

/**
 * Status of the overall upload session
 */
export type UploadSessionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'aborted'
  | 'expired';

/**
 * Subdocument representing a single part in a multipart upload
 */
export interface UploadPart {
  partNumber: number;
  etag?: string;
  status: UploadPartStatus;
  size: number;
  uploadedAt?: Date;
}

/**
 * Upload session data structure
 */
export interface UploadSession {
  id: string;
  userId: string;
  uploadId: string;
  s3Key: string;
  bucket: string;
  region: string;
  filename: string;
  mimeType: string;
  totalSize: number;
  chunkSize: number;
  totalParts: number;
  hash?: string;
  status: UploadSessionStatus;
  parts: UploadPart[];
  expiresAt: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InitiateUploadDto {
  filename: string;
  mimeType: string;
  totalSize: number;
  hash?: string;
  chunkSize?: number;
}

export interface UploadStatusResponse {
  sessionId: string;
  status: UploadSessionStatus;
  filename: string;
  totalSize: number;
  totalParts: number;
  completedParts: number;
  progress: number;
  pendingPartNumbers: number[];
  presignedUrls?: Array<{ partNumber: number; url: string }>;
  expiresAt: Date;
}

export interface PartCompletionDto {
  etag: string;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  // In-memory storage for upload sessions (temporary until MongoDB is set up)
  private sessions: Map<string, UploadSession> = new Map();
  // In-memory storage for media items (temporary)
  private mediaItems: Map<string, any> = new Map();

  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate a unique S3 key for the upload
   */
  private generateS3Key(userId: string, filename: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `uploads/${userId}/${timestamp}-${randomSuffix}-${safeFilename}`;
  }

  /**
   * Calculate the number of parts needed for a file
   */
  private calculateTotalParts(totalSize: number, chunkSize: number): number {
    return Math.ceil(totalSize / chunkSize);
  }

  /**
   * Create initial parts array for the upload session
   */
  private createInitialParts(
    totalParts: number,
    chunkSize: number,
    totalSize: number,
  ): UploadPart[] {
    const parts: UploadPart[] = [];
    for (let i = 1; i <= totalParts; i++) {
      // Last part may be smaller
      const isLastPart = i === totalParts;
      const partSize = isLastPart ? totalSize - (i - 1) * chunkSize : chunkSize;
      parts.push({
        partNumber: i,
        status: 'pending',
        size: partSize,
      });
    }
    return parts;
  }

  /**
   * Check for duplicate upload by hash
   * Only returns existing media if it was successfully processed
   */
  async findExistingByHash(
    userId: string,
    hash: string,
  ): Promise<{ type: 'video' | 'image'; id: string } | null> {
    // Search through in-memory media items
    for (const [id, item] of this.mediaItems.entries()) {
      if (item.userId === userId && item.hash === hash && !item.deleted) {
        // For videos, ensure it was successfully processed
        if (item.type === 'video') {
          const hasMetadata =
            item.duration > 0 || item.thumbnail || item.thumbs?.length > 0;
          if (hasMetadata) {
            this.logger.log(
              `Found valid duplicate video ${id} with duration=${item.duration}`,
            );
            return { type: 'video', id };
          }
        } else {
          return { type: 'image', id };
        }
      }
    }
    return null;
  }

  /**
   * Initiate a new multipart upload
   */
  async initiateUpload(
    userId: string,
    dto: InitiateUploadDto,
  ): Promise<{
    sessionId: string;
    uploadId: string;
    presignedUrls: Array<{ partNumber: number; url: string }>;
    totalParts: number;
    chunkSize: number;
    expiresAt: Date;
    existingMedia?: { type: 'video' | 'image'; id: string };
  }> {
    // Check for duplicate by hash if provided
    if (dto.hash) {
      const existing = await this.findExistingByHash(userId, dto.hash);
      if (existing) {
        this.logger.log(
          `Duplicate detected for user ${userId}, hash: ${dto.hash}`,
        );
        return {
          sessionId: '',
          uploadId: '',
          presignedUrls: [],
          totalParts: 0,
          chunkSize: 0,
          expiresAt: new Date(),
          existingMedia: existing,
        };
      }
    }

    const chunkSize = dto.chunkSize || DEFAULT_CHUNK_SIZE;
    const totalParts = this.calculateTotalParts(dto.totalSize, chunkSize);
    const s3Key = this.generateS3Key(userId, dto.filename);
    const bucket =
      this.configService.get<string>('NEXT_PUBLIC_VIDEO_BUCKET') || '';
    const region =
      this.configService.get<string>('VIDEO_BUCKET_REGION') || 'us-east-1';

    // Create S3 multipart upload
    const { uploadId } = await this.s3Service.createMultipartUpload({
      bucket,
      region,
      key: s3Key,
      contentType: dto.mimeType,
    });

    // Calculate expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRATION_DAYS);

    // Create upload session
    const sessionId = this.generateSessionId();
    const session: UploadSession = {
      id: sessionId,
      userId,
      uploadId,
      s3Key,
      bucket,
      region,
      filename: dto.filename,
      mimeType: dto.mimeType,
      totalSize: dto.totalSize,
      chunkSize,
      totalParts,
      hash: dto.hash,
      status: 'pending',
      parts: this.createInitialParts(totalParts, chunkSize, dto.totalSize),
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, session);

    // Generate presigned URLs for the first batch of parts
    const initialPartNumbers = Array.from(
      { length: Math.min(totalParts, MAX_URLS_PER_REQUEST) },
      (_, i) => i + 1,
    );

    const presignedUrls = await this.s3Service.getPresignedUploadUrls({
      bucket,
      region,
      key: s3Key,
      uploadId,
      partNumbers: initialPartNumbers,
    });

    this.logger.log(
      `Initiated upload session ${sessionId} for user ${userId}, file: ${dto.filename}, parts: ${totalParts}`,
    );

    return {
      sessionId,
      uploadId,
      presignedUrls,
      totalParts,
      chunkSize,
      expiresAt,
    };
  }

  /**
   * Get upload status with option to sync with S3 and get fresh presigned URLs
   */
  async getUploadStatus(
    userId: string,
    sessionId: string,
    includeUrls = true,
  ): Promise<UploadStatusResponse> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException(
        'Not authorized to access this upload session',
      );
    }

    // Find pending parts
    const pendingPartNumbers = session.parts
      .filter((p) => p.status !== 'completed')
      .map((p) => p.partNumber);

    const completedParts = session.parts.filter(
      (p) => p.status === 'completed',
    ).length;
    const progress = Math.round((completedParts / session.totalParts) * 100);

    let presignedUrls: Array<{ partNumber: number; url: string }> | undefined;

    // Generate fresh presigned URLs for pending parts if requested
    if (includeUrls && pendingPartNumbers.length > 0) {
      const urlPartNumbers = pendingPartNumbers.slice(0, MAX_URLS_PER_REQUEST);
      presignedUrls = await this.s3Service.getPresignedUploadUrls({
        bucket: session.bucket,
        region: session.region,
        key: session.s3Key,
        uploadId: session.uploadId,
        partNumbers: urlPartNumbers,
      });
    }

    return {
      sessionId: session.id,
      status: session.status,
      filename: session.filename,
      totalSize: session.totalSize,
      totalParts: session.totalParts,
      completedParts,
      progress,
      pendingPartNumbers,
      presignedUrls,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Get more presigned URLs for specific parts
   */
  async getMorePresignedUrls(
    userId: string,
    sessionId: string,
    partNumbers: number[],
  ): Promise<Array<{ partNumber: number; url: string }>> {
    if (partNumbers.length > MAX_URLS_PER_REQUEST) {
      throw new BadRequestException(
        `Maximum ${MAX_URLS_PER_REQUEST} URLs per request`,
      );
    }

    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException(
        'Not authorized to access this upload session',
      );
    }

    if (
      session.status === 'completed' ||
      session.status === 'aborted' ||
      session.status === 'expired'
    ) {
      throw new ConflictException(`Upload session is ${session.status}`);
    }

    // Validate part numbers
    const validPartNumbers = partNumbers.filter(
      (pn) => pn >= 1 && pn <= session.totalParts,
    );
    if (validPartNumbers.length !== partNumbers.length) {
      throw new BadRequestException('Invalid part numbers provided');
    }

    return this.s3Service.getPresignedUploadUrls({
      bucket: session.bucket,
      region: session.region,
      key: session.s3Key,
      uploadId: session.uploadId,
      partNumbers: validPartNumbers,
    });
  }

  /**
   * Mark a part as completed with its ETag
   */
  async markPartCompleted(
    userId: string,
    sessionId: string,
    partNumber: number,
    etag: string,
  ): Promise<{ completedParts: number; totalParts: number; progress: number }> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException(
        'Not authorized to access this upload session',
      );
    }

    if (
      session.status === 'completed' ||
      session.status === 'aborted' ||
      session.status === 'expired'
    ) {
      throw new ConflictException(`Upload session is ${session.status}`);
    }

    // Find and update the part
    const partIndex = session.parts.findIndex(
      (p) => p.partNumber === partNumber,
    );
    if (partIndex === -1) {
      throw new BadRequestException(`Invalid part number: ${partNumber}`);
    }

    // Update the part status
    session.parts[partIndex].status = 'completed';
    session.parts[partIndex].etag = etag.replace(/"/g, ''); // Remove quotes from ETag
    session.parts[partIndex].uploadedAt = new Date();

    // Update session status to in_progress if it was pending
    if (session.status === 'pending') {
      session.status = 'in_progress';
    }

    session.updatedAt = new Date();

    const completedParts = session.parts.filter(
      (p) => p.status === 'completed',
    ).length;
    const progress = Math.round((completedParts / session.totalParts) * 100);

    return {
      completedParts,
      totalParts: session.totalParts,
      progress,
    };
  }

  /**
   * Complete the multipart upload after all parts are uploaded
   */
  async completeUpload(
    userId: string,
    sessionId: string,
  ): Promise<{ mediaId: string; mediaType: 'video' | 'image' }> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException(
        'Not authorized to access this upload session',
      );
    }

    if (session.status === 'completed') {
      throw new ConflictException('Upload already completed');
    }

    if (session.status === 'aborted' || session.status === 'expired') {
      throw new ConflictException(`Upload session is ${session.status}`);
    }

    // Verify all parts are completed
    const incompleteParts = session.parts.filter(
      (p) => p.status !== 'completed',
    );
    if (incompleteParts.length > 0) {
      throw new BadRequestException(
        `Upload incomplete. Missing parts: ${incompleteParts
          .map((p) => p.partNumber)
          .join(', ')}`,
      );
    }

    // Build the parts array for S3 completion
    const completedParts: CompletedPart[] = session.parts.map((p) => ({
      PartNumber: p.partNumber,
      ETag: p.etag,
    }));

    // Complete the S3 multipart upload
    await this.s3Service.completeMultipartUpload({
      bucket: session.bucket,
      region: session.region,
      key: session.s3Key,
      uploadId: session.uploadId,
      parts: completedParts,
    });

    // Determine media type from MIME type
    const isVideo = session.mimeType.startsWith('video/');
    const mediaType = isVideo ? 'video' : 'image';

    // Create the media document (in-memory for now)
    const mediaId = this.generateSessionId();
    const mediaData = {
      id: mediaId,
      userId: session.userId,
      type: mediaType,
      file: session.s3Key,
      filename: session.filename,
      mime: session.mimeType,
      size: session.totalSize,
      hash: session.hash,
      bucket: session.bucket,
      region: session.region,
      publicity: 'private',
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mediaItems.set(mediaId, mediaData);

    // Update session status
    session.status = 'completed';
    session.updatedAt = new Date();

    this.logger.log(
      `Completed upload session ${sessionId}, created ${mediaType} ${mediaId}`,
    );

    return { mediaId, mediaType };
  }

  /**
   * Abort an upload and clean up S3 resources
   */
  async abortUpload(userId: string, sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException(
        'Not authorized to access this upload session',
      );
    }

    if (session.status === 'completed') {
      throw new ConflictException('Cannot abort a completed upload');
    }

    // Abort the S3 multipart upload
    await this.s3Service.abortMultipartUpload({
      bucket: session.bucket,
      region: session.region,
      key: session.s3Key,
      uploadId: session.uploadId,
    });

    // Update session status
    session.status = 'aborted';
    session.updatedAt = new Date();

    this.logger.log(`Aborted upload session ${sessionId}`);
  }

  /**
   * Get all active (resumable) uploads for a user
   */
  async getActiveUploads(userId: string): Promise<
    Array<{
      sessionId: string;
      filename: string;
      totalSize: number;
      progress: number;
      createdAt: Date;
      expiresAt: Date;
    }>
  > {
    const now = new Date();
    const activeSessions = Array.from(this.sessions.values()).filter(
      (session) =>
        session.userId === userId &&
        (session.status === 'pending' || session.status === 'in_progress') &&
        session.expiresAt > now,
    );

    return activeSessions.map((session) => {
      const completedParts = session.parts.filter(
        (p) => p.status === 'completed',
      ).length;
      const progress = Math.round((completedParts / session.totalParts) * 100);

      return {
        sessionId: session.id,
        filename: session.filename,
        totalSize: session.totalSize,
        progress,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      };
    });
  }

  /**
   * Sync session with S3 to recover from any inconsistencies
   * Called during resume to ensure DB matches S3 state
   */
  async syncWithS3(
    userId: string,
    sessionId: string,
  ): Promise<UploadStatusResponse> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException(
        'Not authorized to access this upload session',
      );
    }

    if (
      session.status === 'completed' ||
      session.status === 'aborted' ||
      session.status === 'expired'
    ) {
      throw new ConflictException(`Upload session is ${session.status}`);
    }

    // Get actual parts from S3
    const s3Parts = await this.s3Service.listAllParts({
      bucket: session.bucket,
      region: session.region,
      key: session.s3Key,
      uploadId: session.uploadId,
    });

    // If S3 returns no parts and the session has completed parts, the upload may have expired
    if (
      s3Parts.length === 0 &&
      session.parts.some((p) => p.status === 'completed')
    ) {
      session.status = 'expired';
      session.errorMessage = 'S3 multipart upload expired';
      session.updatedAt = new Date();
      throw new ConflictException('S3 multipart upload has expired');
    }

    // Build a map of S3 parts by part number
    const s3PartsMap = new Map(s3Parts.map((p) => [p.partNumber, p]));

    // Update session parts based on S3 state
    for (const part of session.parts) {
      const s3Part = s3PartsMap.get(part.partNumber);
      if (s3Part) {
        part.status = 'completed';
        part.etag = s3Part.etag.replace(/"/g, '');
        part.uploadedAt = s3Part.lastModified;
      } else if (part.status === 'completed') {
        // Part was marked complete but not in S3 - reset it
        part.status = 'pending';
        part.etag = undefined;
        part.uploadedAt = undefined;
      }
    }

    session.updatedAt = new Date();

    // Return updated status
    return this.getUploadStatus(userId, sessionId, true);
  }
}
