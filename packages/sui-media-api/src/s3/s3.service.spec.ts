import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';
import {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('S3Service', () => {
  let service: S3Service;
  let configService: ConfigService;
  let mockS3Client: jest.Mocked<S3Client>;

  const mockBucket = 'test-bucket';
  const mockRegion = 'us-east-1';
  const mockKey = 'test-key.mp4';

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock S3Client with proper typing
    mockS3Client = {
      send: jest.fn() as jest.MockedFunction<any>,
    } as any;

    (S3Client as jest.Mock).mockImplementation(() => mockS3Client);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config: Record<string, any> = {
                AWS_REGION: mockRegion,
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('objectExists', () => {
    it('should return true if object exists', async () => {
      mockS3Client.send.mockResolvedValueOnce({});

      const result = await service.objectExists({
        bucket: mockBucket,
        key: mockKey,
      });

      expect(result).toBe(true);
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(HeadObjectCommand),
      );
    });

    it('should return false if object does not exist (NotFound)', async () => {
      const error = new Error('Not Found');
      (error as any).name = 'NotFound';
      mockS3Client.send.mockRejectedValueOnce(error);

      const result = await service.objectExists({
        bucket: mockBucket,
        key: mockKey,
      });

      expect(result).toBe(false);
    });

    it('should return false if object does not exist (NoSuchKey)', async () => {
      const error = new Error('No Such Key');
      (error as any).name = 'NoSuchKey';
      mockS3Client.send.mockRejectedValueOnce(error);

      const result = await service.objectExists({
        bucket: mockBucket,
        key: mockKey,
      });

      expect(result).toBe(false);
    });

    it('should return false if object does not exist (404 status)', async () => {
      const error = new Error('Not Found');
      (error as any).$metadata = { httpStatusCode: 404 };
      mockS3Client.send.mockRejectedValueOnce(error);

      const result = await service.objectExists({
        bucket: mockBucket,
        key: mockKey,
      });

      expect(result).toBe(false);
    });

    it('should return false and log error on other errors', async () => {
      const error = new Error('Access Denied');
      mockS3Client.send.mockRejectedValueOnce(error);

      const result = await service.objectExists({
        bucket: mockBucket,
        key: mockKey,
      });

      expect(result).toBe(false);
    });
  });

  describe('getObjectMetadata', () => {
    it('should return object metadata', async () => {
      const mockMetadata = {
        ContentLength: 1024,
        ContentType: 'video/mp4',
        LastModified: new Date('2024-01-01'),
      };

      mockS3Client.send.mockResolvedValueOnce(mockMetadata);

      const result = await service.getObjectMetadata({
        bucket: mockBucket,
        key: mockKey,
      });

      expect(result).toEqual({
        contentLength: 1024,
        contentType: 'video/mp4',
        lastModified: mockMetadata.LastModified,
      });
    });

    it('should use default values for missing metadata', async () => {
      mockS3Client.send.mockResolvedValueOnce({});

      const result = await service.getObjectMetadata({
        bucket: mockBucket,
        key: mockKey,
      });

      expect(result).toEqual({
        contentLength: 0,
        contentType: 'application/octet-stream',
        lastModified: undefined,
      });
    });

    it('should throw error on failure', async () => {
      const error = new Error('Failed to get metadata');
      mockS3Client.send.mockRejectedValueOnce(error);

      await expect(
        service.getObjectMetadata({
          bucket: mockBucket,
          key: mockKey,
        }),
      ).rejects.toThrow('Failed to get object metadata');
    });
  });

  describe('downloadObject', () => {
    it('should download object successfully', async () => {
      const mockResponse = {
        Body: Buffer.from('test data'),
        ContentType: 'video/mp4',
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse);

      const result = await service.downloadObject({
        bucket: mockBucket,
        key: mockKey,
      });

      expect(result).toEqual(mockResponse);
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(GetObjectCommand),
      );
    });

    it('should throw error on download failure', async () => {
      const error = new Error('Download failed');
      mockS3Client.send.mockRejectedValueOnce(error);

      await expect(
        service.downloadObject({
          bucket: mockBucket,
          key: mockKey,
        }),
      ).rejects.toThrow(error);
    });
  });

  describe('putObject', () => {
    it('should upload object successfully', async () => {
      const mockBuffer = Buffer.from('test data');
      const mockResponse = { ETag: '"abc123"' };

      mockS3Client.send.mockResolvedValueOnce(mockResponse);

      const result = await service.putObject({
        buffer: mockBuffer,
        key: mockKey,
        bucket: mockBucket,
        contentType: 'video/mp4',
      });

      expect(result).toEqual(mockResponse);
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(PutObjectCommand),
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete single file successfully', async () => {
      mockS3Client.send.mockResolvedValueOnce({});

      await service.deleteFile({
        key: mockKey,
        bucket: mockBucket,
      });

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(DeleteObjectCommand),
      );
    });

    it('should throw error on delete failure', async () => {
      const error = new Error('Delete failed');
      mockS3Client.send.mockRejectedValueOnce(error);

      await expect(
        service.deleteFile({
          key: mockKey,
          bucket: mockBucket,
        }),
      ).rejects.toThrow(error);
    });
  });

  describe('deleteFiles', () => {
    it('should delete multiple files successfully', async () => {
      const mockKeys = ['file1.mp4', 'file2.mp4', 'file3.mp4'];
      const mockResponse = {
        Deleted: mockKeys.map((key) => ({ Key: key })),
        Errors: [],
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse);

      await service.deleteFiles({
        keys: mockKeys,
        bucket: mockBucket,
      });

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(DeleteObjectsCommand),
      );
    });

    it('should handle empty keys array', async () => {
      await service.deleteFiles({
        keys: [],
        bucket: mockBucket,
      });

      expect(mockS3Client.send).not.toHaveBeenCalled();
    });

    it('should log errors for failed deletions', async () => {
      const mockKeys = ['file1.mp4', 'file2.mp4'];
      const mockResponse = {
        Deleted: [{ Key: 'file1.mp4' }],
        Errors: [{ Key: 'file2.mp4', Code: 'AccessDenied' }],
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse);

      await service.deleteFiles({
        keys: mockKeys,
        bucket: mockBucket,
      });

      expect(mockS3Client.send).toHaveBeenCalled();
    });
  });

  describe('deleteMediaAndThumbnails', () => {
    it('should delete media and all thumbnails', async () => {
      const fileKey = 'media/video.mp4';
      const thumbnailKeys = ['thumbs/video-1.jpg', 'thumbs/video-2.jpg'];
      const mockResponse = {
        Deleted: [
          { Key: fileKey },
          { Key: thumbnailKeys[0] },
          { Key: thumbnailKeys[1] },
        ],
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse);

      await service.deleteMediaAndThumbnails({
        fileKey,
        thumbnailKeys,
        bucket: mockBucket,
      });

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(DeleteObjectsCommand),
      );
    });

    it('should delete only media file if no thumbnails', async () => {
      const fileKey = 'media/video.mp4';
      const mockResponse = {
        Deleted: [{ Key: fileKey }],
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse);

      await service.deleteMediaAndThumbnails({
        fileKey,
        bucket: mockBucket,
      });

      expect(mockS3Client.send).toHaveBeenCalled();
    });
  });

  describe('extractS3Key', () => {
    it('should return key as-is if no protocol', () => {
      const key = 'path/to/file.mp4';
      expect(service.extractS3Key(key)).toBe(key);
    });

    it('should extract key from CloudFront URL', () => {
      const url = 'https://d111111abcdef8.cloudfront.net/path/to/file.mp4';
      expect(service.extractS3Key(url)).toBe('path/to/file.mp4');
    });

    it('should extract key from S3 bucket URL', () => {
      const url = 'https://mybucket.s3.us-east-1.amazonaws.com/path/to/file.mp4';
      expect(service.extractS3Key(url)).toBe('path/to/file.mp4');
    });

    it('should extract key from S3 regional URL', () => {
      const url = 'https://s3.us-east-1.amazonaws.com/mybucket/path/to/file.mp4';
      expect(service.extractS3Key(url)).toBe('path/to/file.mp4');
    });

    it('should return null for empty input', () => {
      expect(service.extractS3Key('')).toBe(null);
    });

    it('should return input as-is if URL parsing fails', () => {
      const invalidUrl = 'not-a-valid-url';
      expect(service.extractS3Key(invalidUrl)).toBe(invalidUrl);
    });
  });

  describe('createMultipartUpload', () => {
    it('should create multipart upload successfully', async () => {
      const mockUploadId = 'test-upload-id';
      mockS3Client.send.mockResolvedValueOnce({ UploadId: mockUploadId });

      const result = await service.createMultipartUpload({
        bucket: mockBucket,
        key: mockKey,
        contentType: 'video/mp4',
      });

      expect(result).toEqual({ uploadId: mockUploadId });
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(CreateMultipartUploadCommand),
      );
    });

    it('should throw error if no UploadId returned', async () => {
      mockS3Client.send.mockResolvedValueOnce({});

      await expect(
        service.createMultipartUpload({
          bucket: mockBucket,
          key: mockKey,
          contentType: 'video/mp4',
        }),
      ).rejects.toThrow('S3 did not return an UploadId');
    });
  });

  describe('getPresignedUploadUrls', () => {
    it('should generate presigned URLs for parts', async () => {
      const uploadId = 'test-upload-id';
      const partNumbers = [1, 2, 3];
      const mockUrl = 'https://signed-url.example.com';

      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      const result = await service.getPresignedUploadUrls({
        bucket: mockBucket,
        key: mockKey,
        uploadId,
        partNumbers,
      });

      expect(result).toEqual([
        { partNumber: 1, url: mockUrl },
        { partNumber: 2, url: mockUrl },
        { partNumber: 3, url: mockUrl },
      ]);
      expect(getSignedUrl).toHaveBeenCalledTimes(3);
    });

    it('should use custom expiration time', async () => {
      const uploadId = 'test-upload-id';
      const partNumbers = [1];
      const customExpiry = 7200;
      const mockUrl = 'https://signed-url.example.com';

      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      await service.getPresignedUploadUrls({
        bucket: mockBucket,
        key: mockKey,
        uploadId,
        partNumbers,
        expiresIn: customExpiry,
      });

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: customExpiry },
      );
    });
  });

  describe('completeMultipartUpload', () => {
    it('should complete multipart upload successfully', async () => {
      const uploadId = 'test-upload-id';
      const parts = [
        { PartNumber: 1, ETag: '"etag1"' },
        { PartNumber: 2, ETag: '"etag2"' },
      ];
      const mockResponse = {
        ETag: '"final-etag"',
        Location: `s3://${mockBucket}/${mockKey}`,
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse);

      const result = await service.completeMultipartUpload({
        bucket: mockBucket,
        key: mockKey,
        uploadId,
        parts,
      });

      expect(result).toEqual({
        etag: '"final-etag"',
        location: `s3://${mockBucket}/${mockKey}`,
      });
    });

    it('should sort parts by part number', async () => {
      const uploadId = 'test-upload-id';
      const parts = [
        { PartNumber: 3, ETag: '"etag3"' },
        { PartNumber: 1, ETag: '"etag1"' },
        { PartNumber: 2, ETag: '"etag2"' },
      ];

      mockS3Client.send.mockResolvedValueOnce({
        ETag: '"final-etag"',
        Location: `s3://${mockBucket}/${mockKey}`,
      });

      await service.completeMultipartUpload({
        bucket: mockBucket,
        key: mockKey,
        uploadId,
        parts,
      });

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            MultipartUpload: {
              Parts: [
                { PartNumber: 1, ETag: '"etag1"' },
                { PartNumber: 2, ETag: '"etag2"' },
                { PartNumber: 3, ETag: '"etag3"' },
              ],
            },
          }),
        }),
      );
    });
  });

  describe('abortMultipartUpload', () => {
    it('should abort multipart upload successfully', async () => {
      const uploadId = 'test-upload-id';
      mockS3Client.send.mockResolvedValueOnce({});

      await service.abortMultipartUpload({
        bucket: mockBucket,
        key: mockKey,
        uploadId,
      });

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(AbortMultipartUploadCommand),
      );
    });

    it('should silently succeed if upload already aborted (NoSuchUpload)', async () => {
      const uploadId = 'test-upload-id';
      const error = new Error('No Such Upload');
      (error as any).name = 'NoSuchUpload';
      mockS3Client.send.mockRejectedValueOnce(error);

      await expect(
        service.abortMultipartUpload({
          bucket: mockBucket,
          key: mockKey,
          uploadId,
        }),
      ).resolves.not.toThrow();
    });

    it('should throw error on other failures', async () => {
      const uploadId = 'test-upload-id';
      const error = new Error('Access Denied');
      mockS3Client.send.mockRejectedValueOnce(error);

      await expect(
        service.abortMultipartUpload({
          bucket: mockBucket,
          key: mockKey,
          uploadId,
        }),
      ).rejects.toThrow('Failed to abort multipart upload');
    });
  });

  describe('listParts', () => {
    it('should list uploaded parts', async () => {
      const uploadId = 'test-upload-id';
      const mockResponse = {
        Parts: [
          {
            PartNumber: 1,
            ETag: '"etag1"',
            Size: 1024,
            LastModified: new Date('2024-01-01'),
          },
          {
            PartNumber: 2,
            ETag: '"etag2"',
            Size: 2048,
            LastModified: new Date('2024-01-02'),
          },
        ],
        IsTruncated: false,
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse);

      const result = await service.listParts({
        bucket: mockBucket,
        key: mockKey,
        uploadId,
      });

      expect(result.parts).toHaveLength(2);
      expect(result.parts[0].partNumber).toBe(1);
      expect(result.parts[0].etag).toBe('"etag1"');
      expect(result.isTruncated).toBe(false);
    });

    it('should return empty array if upload does not exist (NoSuchUpload)', async () => {
      const uploadId = 'test-upload-id';
      const error = new Error('No Such Upload');
      (error as any).name = 'NoSuchUpload';
      mockS3Client.send.mockRejectedValueOnce(error);

      const result = await service.listParts({
        bucket: mockBucket,
        key: mockKey,
        uploadId,
      });

      expect(result.parts).toEqual([]);
      expect(result.isTruncated).toBe(false);
    });

    it('should handle pagination', async () => {
      const uploadId = 'test-upload-id';
      const mockResponse = {
        Parts: [
          {
            PartNumber: 1,
            ETag: '"etag1"',
            Size: 1024,
            LastModified: new Date('2024-01-01'),
          },
        ],
        IsTruncated: true,
        NextPartNumberMarker: '1',
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse);

      const result = await service.listParts({
        bucket: mockBucket,
        key: mockKey,
        uploadId,
      });

      expect(result.isTruncated).toBe(true);
      expect(result.nextPartNumberMarker).toBe('1');
    });
  });

  describe('listAllParts', () => {
    it('should fetch all parts across multiple pages', async () => {
      const uploadId = 'test-upload-id';

      // First page
      mockS3Client.send.mockResolvedValueOnce({
        Parts: [
          {
            PartNumber: 1,
            ETag: '"etag1"',
            Size: 1024,
            LastModified: new Date('2024-01-01'),
          },
        ],
        IsTruncated: true,
        NextPartNumberMarker: '1',
      });

      // Second page
      mockS3Client.send.mockResolvedValueOnce({
        Parts: [
          {
            PartNumber: 2,
            ETag: '"etag2"',
            Size: 2048,
            LastModified: new Date('2024-01-02'),
          },
        ],
        IsTruncated: false,
      });

      const result = await service.listAllParts({
        bucket: mockBucket,
        key: mockKey,
        uploadId,
      });

      expect(result).toHaveLength(2);
      expect(result[0].partNumber).toBe(1);
      expect(result[1].partNumber).toBe(2);
      expect(mockS3Client.send).toHaveBeenCalledTimes(2);
    });
  });
});
