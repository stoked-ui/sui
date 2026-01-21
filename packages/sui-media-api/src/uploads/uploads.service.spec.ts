import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { S3Service } from '../s3/s3.service';

describe('UploadsService', () => {
  let service: UploadsService;
  let s3Service: jest.Mocked<S3Service>;
  let configService: jest.Mocked<ConfigService>;

  const mockUserId = 'user-123';
  const mockBucket = 'test-bucket';
  const mockRegion = 'us-east-1';

  beforeEach(async () => {
    const mockS3Service = {
      createMultipartUpload: jest.fn(),
      getPresignedUploadUrls: jest.fn(),
      completeMultipartUpload: jest.fn(),
      abortMultipartUpload: jest.fn(),
      listAllParts: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          NEXT_PUBLIC_VIDEO_BUCKET: mockBucket,
          VIDEO_BUCKET_REGION: mockRegion,
        };
        return config[key] || defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
    s3Service = module.get(S3Service) as jest.Mocked<S3Service>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
  });

  describe('initiateUpload', () => {
    it('should initiate a new multipart upload', async () => {
      const mockUploadId = 'upload-123';
      const mockPresignedUrls = [
        { partNumber: 1, url: 'https://signed-url-1.example.com' },
        { partNumber: 2, url: 'https://signed-url-2.example.com' },
      ];

      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue(mockPresignedUrls);

      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 20 * 1024 * 1024, // 20 MB
        hash: 'abc123',
      };

      const result = await service.initiateUpload(mockUserId, dto);

      expect(result.sessionId).toBeDefined();
      expect(result.uploadId).toBe(mockUploadId);
      expect(result.presignedUrls).toEqual(mockPresignedUrls);
      expect(result.totalParts).toBe(2); // 20MB / 10MB chunk = 2 parts
      expect(result.chunkSize).toBe(10 * 1024 * 1024);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(s3Service.createMultipartUpload).toHaveBeenCalled();
    });

    it('should use custom chunk size if provided', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);

      const customChunkSize = 5 * 1024 * 1024; // 5 MB
      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 20 * 1024 * 1024,
        chunkSize: customChunkSize,
      };

      const result = await service.initiateUpload(mockUserId, dto);

      expect(result.chunkSize).toBe(customChunkSize);
      expect(result.totalParts).toBe(4); // 20MB / 5MB = 4 parts
    });

    it('should return existing media if duplicate hash found', async () => {
      // First create a completed upload
      const existingMediaId = 'media-123';
      (service as any).mediaItems.set(existingMediaId, {
        userId: mockUserId,
        hash: 'duplicate-hash',
        type: 'video',
        duration: 120,
        deleted: false,
      });

      const dto = {
        filename: 'duplicate-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
        hash: 'duplicate-hash',
      };

      const result = await service.initiateUpload(mockUserId, dto);

      expect(result.existingMedia).toBeDefined();
      expect(result.existingMedia?.type).toBe('video');
      expect(result.existingMedia?.id).toBe(existingMediaId);
      expect(result.sessionId).toBe('');
      expect(s3Service.createMultipartUpload).not.toHaveBeenCalled();
    });

    it('should not return deleted media as duplicate', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);

      // Create deleted media with same hash
      (service as any).mediaItems.set('media-deleted', {
        userId: mockUserId,
        hash: 'same-hash',
        type: 'video',
        deleted: true,
      });

      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
        hash: 'same-hash',
      };

      const result = await service.initiateUpload(mockUserId, dto);

      expect(result.existingMedia).toBeUndefined();
      expect(result.sessionId).toBeDefined();
    });
  });

  describe('getUploadStatus', () => {
    it('should return upload status', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);

      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 20 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);

      const status = await service.getUploadStatus(mockUserId, sessionId);

      expect(status.sessionId).toBe(sessionId);
      expect(status.status).toBe('pending');
      expect(status.filename).toBe('test-video.mp4');
      expect(status.completedParts).toBe(0);
      expect(status.progress).toBe(0);
    });

    it('should throw NotFoundException if session not found', async () => {
      await expect(
        service.getUploadStatus(mockUserId, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if userId does not match', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);

      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);

      await expect(
        service.getUploadStatus('different-user', sessionId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should generate presigned URLs for pending parts', async () => {
      const mockUploadId = 'upload-123';
      const mockUrls = [
        { partNumber: 1, url: 'https://url-1.example.com' },
      ];

      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue(mockUrls);

      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);

      // Clear previous calls
      s3Service.getPresignedUploadUrls.mockClear();
      s3Service.getPresignedUploadUrls.mockResolvedValue(mockUrls);

      const status = await service.getUploadStatus(mockUserId, sessionId, true);

      expect(status.presignedUrls).toBeDefined();
      expect(s3Service.getPresignedUploadUrls).toHaveBeenCalled();
    });
  });

  describe('markPartCompleted', () => {
    it('should mark part as completed', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);

      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 20 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);

      const result = await service.markPartCompleted(
        mockUserId,
        sessionId,
        1,
        '"etag-123"',
      );

      expect(result.completedParts).toBe(1);
      expect(result.totalParts).toBe(2);
      expect(result.progress).toBe(50);

      // Verify session status changed to in_progress
      const status = await service.getUploadStatus(mockUserId, sessionId, false);
      expect(status.status).toBe('in_progress');
    });

    it('should strip quotes from ETag', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);

      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);

      await service.markPartCompleted(mockUserId, sessionId, 1, '"etag-123"');

      const session = (service as any).sessions.get(sessionId);
      expect(session.parts[0].etag).toBe('etag-123'); // Quotes removed
    });

    it('should throw NotFoundException if session not found', async () => {
      await expect(
        service.markPartCompleted(mockUserId, 'non-existent', 1, 'etag'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid part number', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);

      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);

      await expect(
        service.markPartCompleted(mockUserId, sessionId, 999, 'etag'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if upload already completed', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);
      s3Service.completeMultipartUpload.mockResolvedValue({
        etag: 'final-etag',
        location: 's3://bucket/key',
      });

      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);
      await service.markPartCompleted(mockUserId, sessionId, 1, 'etag');
      await service.completeUpload(mockUserId, sessionId);

      await expect(
        service.markPartCompleted(mockUserId, sessionId, 1, 'etag'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('completeUpload', () => {
    it('should complete multipart upload successfully', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);
      s3Service.completeMultipartUpload.mockResolvedValue({
        etag: 'final-etag',
        location: 's3://bucket/key',
      });

      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);
      await service.markPartCompleted(mockUserId, sessionId, 1, 'etag-1');

      const result = await service.completeUpload(mockUserId, sessionId);

      expect(result.mediaId).toBeDefined();
      expect(result.mediaType).toBe('video');
      expect(s3Service.completeMultipartUpload).toHaveBeenCalled();
    });

    it('should create image media type for image MIME types', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);
      s3Service.completeMultipartUpload.mockResolvedValue({
        etag: 'final-etag',
        location: 's3://bucket/key',
      });

      const dto = {
        filename: 'test-image.jpg',
        mimeType: 'image/jpeg',
        totalSize: 1 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);
      await service.markPartCompleted(mockUserId, sessionId, 1, 'etag-1');

      const result = await service.completeUpload(mockUserId, sessionId);

      expect(result.mediaType).toBe('image');
    });

    it('should throw BadRequestException if parts are incomplete', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);

      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 20 * 1024 * 1024, // 2 parts
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);
      // Only complete one part
      await service.markPartCompleted(mockUserId, sessionId, 1, 'etag-1');

      await expect(
        service.completeUpload(mockUserId, sessionId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if already completed', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);
      s3Service.completeMultipartUpload.mockResolvedValue({
        etag: 'final-etag',
        location: 's3://bucket/key',
      });

      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);
      await service.markPartCompleted(mockUserId, sessionId, 1, 'etag-1');
      await service.completeUpload(mockUserId, sessionId);

      await expect(
        service.completeUpload(mockUserId, sessionId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('abortUpload', () => {
    it('should abort upload successfully', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);
      s3Service.abortMultipartUpload.mockResolvedValue();

      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);

      await service.abortUpload(mockUserId, sessionId);

      expect(s3Service.abortMultipartUpload).toHaveBeenCalled();

      const status = await service.getUploadStatus(mockUserId, sessionId, false);
      expect(status.status).toBe('aborted');
    });

    it('should throw ConflictException if upload already completed', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);
      s3Service.completeMultipartUpload.mockResolvedValue({
        etag: 'final-etag',
        location: 's3://bucket/key',
      });

      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);
      await service.markPartCompleted(mockUserId, sessionId, 1, 'etag-1');
      await service.completeUpload(mockUserId, sessionId);

      await expect(
        service.abortUpload(mockUserId, sessionId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getActiveUploads', () => {
    it('should return active uploads for user', async () => {
      const mockUploadId1 = 'upload-123';
      const mockUploadId2 = 'upload-456';

      s3Service.createMultipartUpload
        .mockResolvedValueOnce({ uploadId: mockUploadId1 })
        .mockResolvedValueOnce({ uploadId: mockUploadId2 });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);

      const dto1 = {
        filename: 'video1.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
      };

      const dto2 = {
        filename: 'video2.mp4',
        mimeType: 'video/mp4',
        totalSize: 20 * 1024 * 1024,
      };

      await service.initiateUpload(mockUserId, dto1);
      await service.initiateUpload(mockUserId, dto2);

      const activeUploads = await service.getActiveUploads(mockUserId);

      expect(activeUploads).toHaveLength(2);
      expect(activeUploads[0].filename).toBe('video1.mp4');
      expect(activeUploads[1].filename).toBe('video2.mp4');
    });

    it('should not return uploads from other users', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);

      const dto = {
        filename: 'video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
      };

      await service.initiateUpload('other-user', dto);

      const activeUploads = await service.getActiveUploads(mockUserId);

      expect(activeUploads).toHaveLength(0);
    });

    it('should not return completed uploads', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);
      s3Service.completeMultipartUpload.mockResolvedValue({
        etag: 'final-etag',
        location: 's3://bucket/key',
      });

      const dto = {
        filename: 'video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);
      await service.markPartCompleted(mockUserId, sessionId, 1, 'etag-1');
      await service.completeUpload(mockUserId, sessionId);

      const activeUploads = await service.getActiveUploads(mockUserId);

      expect(activeUploads).toHaveLength(0);
    });
  });

  describe('syncWithS3', () => {
    it('should sync session with S3 parts', async () => {
      const mockUploadId = 'upload-123';
      const mockS3Parts = [
        {
          partNumber: 1,
          etag: '"etag-1"',
          size: 1024,
          lastModified: new Date(),
        },
      ];

      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);
      s3Service.listAllParts.mockResolvedValue(mockS3Parts);

      const dto = {
        filename: 'video.mp4',
        mimeType: 'video/mp4',
        totalSize: 20 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);

      const result = await service.syncWithS3(mockUserId, sessionId);

      expect(result.completedParts).toBe(1);
      expect(s3Service.listAllParts).toHaveBeenCalled();
    });

    it('should throw ConflictException if S3 upload expired', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);
      s3Service.listAllParts.mockResolvedValue([]);

      const dto = {
        filename: 'video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);

      // Mark a part as completed locally
      await service.markPartCompleted(mockUserId, sessionId, 1, 'etag-1');

      // Sync should detect mismatch
      await expect(
        service.syncWithS3(mockUserId, sessionId),
      ).rejects.toThrow(ConflictException);
    });

    it('should reset parts that are not in S3', async () => {
      const mockUploadId = 'upload-123';
      const mockS3Parts = [
        {
          partNumber: 1,
          etag: '"etag-1"',
          size: 1024,
          lastModified: new Date(),
        },
      ];

      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);
      s3Service.listAllParts.mockResolvedValue(mockS3Parts);

      const dto = {
        filename: 'video.mp4',
        mimeType: 'video/mp4',
        totalSize: 20 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);

      // Mark both parts as completed locally
      await service.markPartCompleted(mockUserId, sessionId, 1, 'etag-1');
      await service.markPartCompleted(mockUserId, sessionId, 2, 'etag-2');

      // Only part 1 exists in S3
      s3Service.listAllParts.mockResolvedValue(mockS3Parts);

      const result = await service.syncWithS3(mockUserId, sessionId);

      // Part 2 should be reset to pending
      expect(result.completedParts).toBe(1);
      expect(result.pendingPartNumbers).toContain(2);
    });
  });

  describe('getMorePresignedUrls', () => {
    it('should generate presigned URLs for specific parts', async () => {
      const mockUploadId = 'upload-123';
      const mockUrls = [
        { partNumber: 1, url: 'https://url-1.example.com' },
        { partNumber: 2, url: 'https://url-2.example.com' },
      ];

      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue(mockUrls);

      const dto = {
        filename: 'video.mp4',
        mimeType: 'video/mp4',
        totalSize: 20 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);

      s3Service.getPresignedUploadUrls.mockClear();
      s3Service.getPresignedUploadUrls.mockResolvedValue(mockUrls);

      const urls = await service.getMorePresignedUrls(mockUserId, sessionId, [
        1, 2,
      ]);

      expect(urls).toEqual(mockUrls);
      expect(s3Service.getPresignedUploadUrls).toHaveBeenCalledWith(
        expect.objectContaining({
          partNumbers: [1, 2],
        }),
      );
    });

    it('should throw BadRequestException if too many URLs requested', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);

      const dto = {
        filename: 'video.mp4',
        mimeType: 'video/mp4',
        totalSize: 100 * 1024 * 1024,
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);

      const tooManyParts = Array.from({ length: 51 }, (_, i) => i + 1);

      await expect(
        service.getMorePresignedUrls(mockUserId, sessionId, tooManyParts),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid part numbers', async () => {
      const mockUploadId = 'upload-123';
      s3Service.createMultipartUpload.mockResolvedValue({
        uploadId: mockUploadId,
      });
      s3Service.getPresignedUploadUrls.mockResolvedValue([]);

      const dto = {
        filename: 'video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024, // Only 1 part
      };

      const { sessionId } = await service.initiateUpload(mockUserId, dto);

      await expect(
        service.getMorePresignedUrls(mockUserId, sessionId, [1, 2, 999]), // Part 2 and 999 are invalid
      ).rejects.toThrow(BadRequestException);
    });
  });
});
