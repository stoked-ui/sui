import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  S3Client,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand,
  UploadPartCommand,
  CompletedPart,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3: S3Client;
  private readonly MULTIPART_URL_EXPIRY = 60 * 60; // 1 hour in seconds

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.s3 = new S3Client({ region });
  }

  /**
   * Get S3 client with optional region override
   */
  private getS3Client(region?: string): S3Client {
    if (!region) {
      return this.s3;
    }
    return new S3Client({ region });
  }

  /**
   * Check if an object exists in S3
   * Uses HeadObject which is more efficient than GetObject for existence checks
   */
  async objectExists({
    region,
    bucket,
    key,
  }: {
    region?: string;
    bucket: string;
    key: string;
  }): Promise<boolean> {
    const client = this.getS3Client(region);
    const command = new HeadObjectCommand({ Bucket: bucket, Key: key });

    try {
      await client.send(command);
      return true;
    } catch (error: any) {
      // NotFound or NoSuchKey means the object doesn't exist
      if (
        error.name === 'NotFound' ||
        error.name === 'NoSuchKey' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      // For other errors (permission issues, etc.), log and return false
      this.logger.error(`Error checking object existence for ${key}:`, error);
      return false;
    }
  }

  /**
   * Get object metadata without downloading the file (HEAD request)
   * Useful for getting file size before streaming
   */
  async getObjectMetadata({
    region,
    bucket,
    key,
  }: {
    region?: string;
    bucket: string;
    key: string;
  }): Promise<{
    contentLength: number;
    contentType: string;
    lastModified?: Date;
  }> {
    const client = this.getS3Client(region);
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      const response = await client.send(command);

      return {
        contentLength: response.ContentLength || 0,
        contentType: response.ContentType || 'application/octet-stream',
        lastModified: response.LastModified,
      };
    } catch (error) {
      throw new Error(
        `Failed to get object metadata: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Download raw object data from S3
   * Returns the object with Body as a readable stream
   */
  async downloadObject({
    region,
    bucket,
    key,
  }: {
    region?: string;
    bucket: string;
    key: string;
  }) {
    const client = this.getS3Client(region);
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });

    try {
      const response = await client.send(command);
      return response;
    } catch (error) {
      this.logger.error(`Failed to download object ${key}:`, error);
      throw error;
    }
  }

  /**
   * Upload an object to S3
   */
  async putObject({
    buffer,
    key,
    bucket,
    region,
    contentType,
  }: {
    buffer: Buffer;
    key: string;
    bucket: string;
    region?: string;
    contentType?: string;
  }) {
    const client = this.getS3Client(region);
    const params = {
      Body: buffer,
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    const result = await client.send(command);
    return result;
  }

  /**
   * Delete a single file from S3
   * @param key - S3 object key
   * @param bucket - S3 bucket name
   * @param region - Optional region override
   */
  async deleteFile({
    key,
    bucket,
    region,
  }: {
    key: string;
    bucket: string;
    region?: string;
  }): Promise<void> {
    try {
      const client = this.getS3Client(region);
      const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
      await client.send(command);
      this.logger.log(`Deleted S3 file: s3://${bucket}/${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete S3 file ${key}: ${(error as Error).message}`, error);
      throw error;
    }
  }

  /**
   * Delete multiple files from S3
   * @param keys - Array of S3 object keys
   * @param bucket - S3 bucket name
   * @param region - Optional region override
   */
  async deleteFiles({
    keys,
    bucket,
    region,
  }: {
    keys: string[];
    bucket: string;
    region?: string;
  }): Promise<void> {
    if (!keys || keys.length === 0) {
      return;
    }

    try {
      const client = this.getS3Client(region);
      const objects = keys.map((key) => ({ Key: key }));

      const command = new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: objects },
      });

      const response = await client.send(command);
      const deletedCount = response.Deleted?.length || 0;

      this.logger.log(`Deleted ${deletedCount} S3 files from s3://${bucket}/`);

      if (response.Errors && response.Errors.length > 0) {
        this.logger.error(`Failed to delete ${response.Errors.length} files:`, response.Errors);
      }
    } catch (error) {
      this.logger.error(`Failed to delete S3 files: ${(error as Error).message}`, error);
      throw error;
    }
  }

  /**
   * Delete media file and all associated thumbnails
   * @param fileKey - Main media file S3 key
   * @param thumbnailKeys - Array of thumbnail S3 keys
   * @param bucket - S3 bucket name
   * @param region - Optional region override
   */
  async deleteMediaAndThumbnails({
    fileKey,
    thumbnailKeys,
    bucket,
    region,
  }: {
    fileKey: string;
    thumbnailKeys?: string[];
    bucket: string;
    region?: string;
  }): Promise<void> {
    const keysToDelete = [fileKey];

    if (thumbnailKeys && thumbnailKeys.length > 0) {
      keysToDelete.push(...thumbnailKeys);
    }

    await this.deleteFiles({ keys: keysToDelete, bucket, region });
  }

  /**
   * Extract S3 key from URL or path
   * Handles various URL formats (CloudFront, S3 direct, relative paths)
   */
  extractS3Key(urlOrPath: string): string | null {
    if (!urlOrPath) {
      return null;
    }

    try {
      // If it's already a key (no protocol), return as-is
      if (!urlOrPath.startsWith('http://') && !urlOrPath.startsWith('https://')) {
        return urlOrPath;
      }

      const url = new URL(urlOrPath);

      // CloudFront or custom domain - extract path
      if (url.hostname.includes('cloudfront.net') || url.hostname.includes('cdn.')) {
        return url.pathname.substring(1); // Remove leading slash
      }

      // S3 direct URL - extract key from path
      if (url.hostname.includes('s3') || url.hostname.includes('amazonaws.com')) {
        // Format: https://bucket.s3.region.amazonaws.com/key or https://s3.region.amazonaws.com/bucket/key
        const pathParts = url.pathname.split('/').filter(Boolean);
        return pathParts.length > 1 ? pathParts.slice(1).join('/') : pathParts[0];
      }

      // Default: use pathname
      return url.pathname.substring(1);
    } catch (error) {
      this.logger.warn(`Failed to parse S3 URL: ${urlOrPath}`);
      return urlOrPath; // Return as-is if parsing fails
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Multipart Upload Operations
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Initiate a new multipart upload
   * @returns The S3 uploadId needed for all subsequent part operations
   */
  async createMultipartUpload({
    region,
    bucket,
    key,
    contentType,
  }: {
    region?: string;
    bucket: string;
    key: string;
    contentType: string;
  }): Promise<{ uploadId: string }> {
    try {
      const client = this.getS3Client(region);
      const command = new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      });

      const response = await client.send(command);

      if (!response.UploadId) {
        throw new Error('S3 did not return an UploadId');
      }

      return { uploadId: response.UploadId };
    } catch (error) {
      throw new Error(
        `Failed to create multipart upload: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Generate presigned PUT URLs for uploading parts directly from the browser
   * @param partNumbers - Array of part numbers to generate URLs for (1-based)
   * @param expiresIn - URL expiration in seconds (default: 1 hour)
   * @returns Array of presigned URLs with their part numbers
   */
  async getPresignedUploadUrls({
    region,
    bucket,
    key,
    uploadId,
    partNumbers,
    expiresIn = this.MULTIPART_URL_EXPIRY,
  }: {
    region?: string;
    bucket: string;
    key: string;
    uploadId: string;
    partNumbers: number[];
    expiresIn?: number;
  }): Promise<Array<{ partNumber: number; url: string }>> {
    try {
      const client = this.getS3Client(region);
      const urlPromises = partNumbers.map(async (partNumber) => {
        const command = new UploadPartCommand({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
        });

        const url = await getSignedUrl(client, command, { expiresIn });

        return { partNumber, url };
      });

      return Promise.all(urlPromises);
    } catch (error) {
      throw new Error(
        `Failed to generate presigned upload URLs: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Complete a multipart upload after all parts have been uploaded
   * @param parts - Ordered array of completed parts with ETags
   * @returns The final object ETag and location
   */
  async completeMultipartUpload({
    region,
    bucket,
    key,
    uploadId,
    parts,
  }: {
    region?: string;
    bucket: string;
    key: string;
    uploadId: string;
    parts: CompletedPart[];
  }): Promise<{ etag: string; location: string }> {
    try {
      const client = this.getS3Client(region);
      // Ensure parts are sorted by part number (required by S3)
      const sortedParts = [...parts].sort(
        (a, b) => (a.PartNumber || 0) - (b.PartNumber || 0),
      );

      const command = new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: sortedParts,
        },
      });

      const response = await client.send(command);

      return {
        etag: response.ETag || '',
        location: response.Location || `s3://${bucket}/${key}`,
      };
    } catch (error) {
      throw new Error(
        `Failed to complete multipart upload: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Abort a multipart upload and clean up any uploaded parts
   * Should be called when an upload is cancelled or expires
   */
  async abortMultipartUpload({
    region,
    bucket,
    key,
    uploadId,
  }: {
    region?: string;
    bucket: string;
    key: string;
    uploadId: string;
  }): Promise<void> {
    try {
      const client = this.getS3Client(region);
      const command = new AbortMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
      });

      await client.send(command);
    } catch (error: any) {
      // NoSuchUpload means it was already cleaned up (by S3 lifecycle or previous abort)
      if (error.name === 'NoSuchUpload') {
        return; // Silently succeed - the upload is already gone
      }
      throw new Error(
        `Failed to abort multipart upload: ${(error as Error).message}`,
      );
    }
  }

  /**
   * List parts that have been uploaded for a multipart upload
   * Used for resume functionality to determine which parts need to be re-uploaded
   * @returns Array of completed parts with their ETags and sizes
   */
  async listParts({
    region,
    bucket,
    key,
    uploadId,
    maxParts = 1000,
    partNumberMarker,
  }: {
    region?: string;
    bucket: string;
    key: string;
    uploadId: string;
    maxParts?: number;
    partNumberMarker?: string;
  }): Promise<{
    parts: Array<{
      partNumber: number;
      etag: string;
      size: number;
      lastModified: Date;
    }>;
    isTruncated: boolean;
    nextPartNumberMarker?: string;
  }> {
    try {
      const client = this.getS3Client(region);
      const command = new ListPartsCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MaxParts: maxParts,
        PartNumberMarker: partNumberMarker,
      });

      const response = await client.send(command);

      const parts = (response.Parts || []).map((part) => ({
        partNumber: part.PartNumber || 0,
        etag: part.ETag || '',
        size: part.Size || 0,
        lastModified: part.LastModified || new Date(),
      }));

      return {
        parts,
        isTruncated: response.IsTruncated || false,
        nextPartNumberMarker: response.NextPartNumberMarker,
      };
    } catch (error: any) {
      // NoSuchUpload means the upload doesn't exist (expired or completed)
      if (error.name === 'NoSuchUpload') {
        return {
          parts: [],
          isTruncated: false,
        };
      }
      throw new Error(
        `Failed to list upload parts: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Get all parts for a multipart upload (handles pagination)
   * Convenience method that fetches all parts across multiple pages
   */
  async listAllParts({
    region,
    bucket,
    key,
    uploadId,
  }: {
    region?: string;
    bucket: string;
    key: string;
    uploadId: string;
  }): Promise<
    Array<{
      partNumber: number;
      etag: string;
      size: number;
      lastModified: Date;
    }>
  > {
    const allParts: Array<{
      partNumber: number;
      etag: string;
      size: number;
      lastModified: Date;
    }> = [];

    let partNumberMarker: string | undefined;
    let isTruncated = true;

    while (isTruncated) {
      const result = await this.listParts({
        region,
        bucket,
        key,
        uploadId,
        partNumberMarker,
      });

      allParts.push(...result.parts);
      isTruncated = result.isTruncated;
      partNumberMarker = result.nextPartNumberMarker;
    }

    return allParts;
  }
}
