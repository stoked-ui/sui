import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import * as fs from 'fs';

/**
 * StorageService
 *
 * Manages file storage operations for video rendering:
 * 1. Upload final rendered videos to S3
 * 2. Store temporary files during processing
 * 3. Generate signed URLs for secure downloads
 * 4. Clean up temporary and expired files
 * 5. Handle multi-part uploads for large files
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('S3_BUCKET') || '';
    const region = this.configService.get<string>('S3_REGION') || 'us-east-1';

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  /**
   * Upload rendered video to S3 from local file
   */
  async uploadVideo(
    localPath: string,
    key: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    this.logger.log(`Uploading video to S3: ${key}`);

    try {
      // Read file from disk
      const fileStream = fs.createReadStream(localPath);

      await this.uploadVideoStream(fileStream, key, metadata);

      const region = this.configService.get<string>('S3_REGION') || 'us-east-1';
      return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
    } catch (error) {
      this.logger.error(`Failed to upload video: ${error}`);
      throw new Error(`S3 upload failed: ${error}`);
    }
  }

  /**
   * Upload video stream to S3 (for FFmpeg pipe output)
   */
  async uploadVideoStream(
    stream: Readable,
    key: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    this.logger.log(`Uploading video stream to S3: ${key}`);

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: stream,
        ContentType: 'video/mp4',
        Metadata: metadata,
        StorageClass: 'INTELLIGENT_TIERING',
      });

      await this.s3Client.send(command);

      const region = this.configService.get<string>('S3_REGION') || 'us-east-1';
      return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
    } catch (error) {
      this.logger.error(`Failed to upload video stream: ${error}`);
      throw new Error(`S3 stream upload failed: ${error}`);
    }
  }

  /**
   * Upload file in multiple parts for large files
   */
  async uploadMultipart(
    localPath: string,
    key: string,
    partSize = 5 * 1024 * 1024, // 5MB default
  ): Promise<string> {
    this.logger.log(`Uploading large file via multipart: ${key}`);

    // TODO: Implement multipart upload:
    // 1. Initiate multipart upload
    // 2. Split file into parts
    // 3. Upload parts in parallel (with retry logic)
    // 4. Complete multipart upload
    // 5. Handle upload failures and cleanup

    return await this.uploadVideo(localPath, key);
  }

  /**
   * Generate signed URL for secure download
   */
  async generateSignedUrl(
    key: string,
    expiresIn = 3600, // 1 hour default
  ): Promise<string> {
    this.logger.debug(`Generating signed URL for: ${key}`);

    // TODO: Implement signed URL generation:
    // 1. Get S3 client
    // 2. Create GetObjectCommand
    // 3. Generate presigned URL with expiration
    // 4. Return signed URL

    return `https://example.com/signed-url/${key}`;
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    this.logger.debug(`Deleting file from S3: ${key}`);

    // TODO: Implement file deletion:
    // 1. Get S3 client
    // 2. Send DeleteObjectCommand
    // 3. Handle errors gracefully
  }

  /**
   * Check if file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    // TODO: Implement existence check:
    // Use HeadObjectCommand to check if file exists

    return false;
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<Record<string, any>> {
    this.logger.debug(`Fetching metadata for: ${key}`);

    // TODO: Implement metadata retrieval:
    // 1. Use HeadObjectCommand
    // 2. Return file size, content-type, custom metadata, etc.

    return {};
  }

  /**
   * Create temporary directory for frame processing
   */
  async createTempDirectory(jobId: string): Promise<string> {
    // TODO: Implement temp directory creation:
    // 1. Generate unique path based on jobId
    // 2. Create directory structure
    // 3. Return path for frame storage

    return `/tmp/render-jobs/${jobId}`;
  }

  /**
   * Clean up temporary files for a job
   */
  async cleanupTempFiles(jobId: string): Promise<void> {
    this.logger.debug(`Cleaning up temp files for job: ${jobId}`);

    // TODO: Implement cleanup:
    // 1. Delete all temporary frames
    // 2. Delete intermediate video/audio files
    // 3. Remove job directory
  }

  /**
   * Get available storage space
   */
  async getAvailableSpace(): Promise<number> {
    // TODO: Implement storage space check:
    // Check available disk space for temporary processing

    return 0;
  }

  /**
   * Copy file within S3
   */
  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    this.logger.debug(`Copying ${sourceKey} to ${destinationKey}`);

    // TODO: Implement S3 copy operation:
    // Use CopyObjectCommand for efficient server-side copy
  }

  /**
   * List files with prefix
   */
  async listFiles(prefix: string): Promise<string[]> {
    // TODO: Implement S3 listing:
    // Use ListObjectsV2Command to get files matching prefix

    return [];
  }
}
