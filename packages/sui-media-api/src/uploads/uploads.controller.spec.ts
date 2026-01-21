import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

describe('UploadsController', () => {
  let controller: UploadsController;
  let uploadsService: jest.Mocked<UploadsService>;

  const mockUserId = 'user-123';
  const mockSessionId = 'session-123';

  beforeEach(async () => {
    const mockUploadsService = {
      initiateUpload: jest.fn(),
      getUploadStatus: jest.fn(),
      markPartCompleted: jest.fn(),
      completeUpload: jest.fn(),
      abortUpload: jest.fn(),
      getActiveUploads: jest.fn(),
      getMorePresignedUrls: jest.fn(),
      syncWithS3: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
    uploadsService = module.get(UploadsService) as jest.Mocked<UploadsService>;
  });

  describe('initiateUpload', () => {
    it('should initiate a new upload', async () => {
      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
        hash: 'abc123',
      };

      const mockResponse = {
        sessionId: mockSessionId,
        uploadId: 'upload-123',
        presignedUrls: [
          { partNumber: 1, url: 'https://url-1.example.com' },
        ],
        totalParts: 1,
        chunkSize: 10 * 1024 * 1024,
        expiresAt: new Date(),
      };

      uploadsService.initiateUpload.mockResolvedValue(mockResponse);

      const req = {
        user: { id: mockUserId },
      } as any;

      const result = await controller.initiateUpload(req, dto);

      expect(result).toEqual(mockResponse);
      expect(uploadsService.initiateUpload).toHaveBeenCalledWith(
        mockUserId,
        dto,
      );
    });

    it('should use anonymous user if no user in request', async () => {
      const dto = {
        filename: 'test-video.mp4',
        mimeType: 'video/mp4',
        totalSize: 10 * 1024 * 1024,
      };

      const mockResponse = {
        sessionId: mockSessionId,
        uploadId: 'upload-123',
        presignedUrls: [],
        totalParts: 1,
        chunkSize: 10 * 1024 * 1024,
        expiresAt: new Date(),
      };

      uploadsService.initiateUpload.mockResolvedValue(mockResponse);

      const req = {} as any;

      await controller.initiateUpload(req, dto);

      expect(uploadsService.initiateUpload).toHaveBeenCalledWith(
        'anonymous',
        dto,
      );
    });
  });

  describe('getUploadStatus', () => {
    it('should return upload status', async () => {
      const mockStatus = {
        sessionId: mockSessionId,
        status: 'in_progress' as const,
        filename: 'test-video.mp4',
        totalSize: 10 * 1024 * 1024,
        totalParts: 1,
        completedParts: 0,
        progress: 0,
        pendingPartNumbers: [1],
        presignedUrls: [{ partNumber: 1, url: 'https://url-1.example.com' }],
        expiresAt: new Date(),
      };

      uploadsService.getUploadStatus.mockResolvedValue(mockStatus);

      const req = {
        user: { id: mockUserId },
      } as any;

      const result = await controller.getUploadStatus(
        req,
        mockSessionId,
        'true',
      );

      expect(result).toEqual(mockStatus);
      expect(uploadsService.getUploadStatus).toHaveBeenCalledWith(
        mockUserId,
        mockSessionId,
        true,
      );
    });

    it('should parse includeUrls query parameter', async () => {
      const mockStatus = {
        sessionId: mockSessionId,
        status: 'in_progress' as const,
        filename: 'test-video.mp4',
        totalSize: 10 * 1024 * 1024,
        totalParts: 1,
        completedParts: 0,
        progress: 0,
        pendingPartNumbers: [1],
        expiresAt: new Date(),
      };

      uploadsService.getUploadStatus.mockResolvedValue(mockStatus);

      const req = {
        user: { id: mockUserId },
      } as any;

      await controller.getUploadStatus(req, mockSessionId, 'false');

      expect(uploadsService.getUploadStatus).toHaveBeenCalledWith(
        mockUserId,
        mockSessionId,
        false,
      );
    });
  });

  describe('markPartCompleted', () => {
    it('should mark part as completed', async () => {
      const dto = {
        etag: '"etag-123"',
      };

      const mockResponse = {
        completedParts: 1,
        totalParts: 2,
        progress: 50,
      };

      uploadsService.markPartCompleted.mockResolvedValue(mockResponse);

      const req = {
        user: { id: mockUserId },
      } as any;

      const result = await controller.markPartCompleted(
        req,
        mockSessionId,
        '1',
        dto,
      );

      expect(result).toEqual(mockResponse);
      expect(uploadsService.markPartCompleted).toHaveBeenCalledWith(
        mockUserId,
        mockSessionId,
        1,
        dto.etag,
      );
    });
  });

  describe('completeUpload', () => {
    it('should complete upload', async () => {
      const mockResponse = {
        mediaId: 'media-123',
        mediaType: 'video' as const,
      };

      uploadsService.completeUpload.mockResolvedValue(mockResponse);

      const req = {
        user: { id: mockUserId },
      } as any;

      const result = await controller.completeUpload(req, mockSessionId);

      expect(result).toEqual(mockResponse);
      expect(uploadsService.completeUpload).toHaveBeenCalledWith(
        mockUserId,
        mockSessionId,
      );
    });
  });

  describe('abortUpload', () => {
    it('should abort upload', async () => {
      uploadsService.abortUpload.mockResolvedValue();

      const req = {
        user: { id: mockUserId },
      } as any;

      await controller.abortUpload(req, mockSessionId);

      expect(uploadsService.abortUpload).toHaveBeenCalledWith(
        mockUserId,
        mockSessionId,
      );
    });
  });

  describe('getActiveUploads', () => {
    it('should return active uploads', async () => {
      const mockUploads = [
        {
          sessionId: 'session-1',
          filename: 'video1.mp4',
          totalSize: 10 * 1024 * 1024,
          progress: 50,
          createdAt: new Date(),
          expiresAt: new Date(),
        },
        {
          sessionId: 'session-2',
          filename: 'video2.mp4',
          totalSize: 20 * 1024 * 1024,
          progress: 25,
          createdAt: new Date(),
          expiresAt: new Date(),
        },
      ];

      uploadsService.getActiveUploads.mockResolvedValue(mockUploads);

      const req = {
        user: { id: mockUserId },
      } as any;

      const result = await controller.getActiveUploads(req);

      expect(result).toEqual({ uploads: mockUploads });
      expect(uploadsService.getActiveUploads).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('getMoreUrls', () => {
    it('should generate more presigned URLs', async () => {
      const dto = {
        partNumbers: [1, 2, 3],
      };

      const mockUrls = [
        { partNumber: 1, url: 'https://url-1.example.com' },
        { partNumber: 2, url: 'https://url-2.example.com' },
        { partNumber: 3, url: 'https://url-3.example.com' },
      ];

      uploadsService.getMorePresignedUrls.mockResolvedValue(mockUrls);

      const req = {
        user: { id: mockUserId },
      } as any;

      const result = await controller.getMoreUrls(
        req,
        mockSessionId,
        dto,
      );

      expect(result).toEqual(mockUrls);
      expect(uploadsService.getMorePresignedUrls).toHaveBeenCalledWith(
        mockUserId,
        mockSessionId,
        dto.partNumbers,
      );
    });
  });

  describe('syncUpload', () => {
    it('should sync session with S3', async () => {
      const mockStatus = {
        sessionId: mockSessionId,
        status: 'in_progress' as const,
        filename: 'test-video.mp4',
        totalSize: 10 * 1024 * 1024,
        totalParts: 2,
        completedParts: 1,
        progress: 50,
        pendingPartNumbers: [2],
        presignedUrls: [{ partNumber: 2, url: 'https://url-2.example.com' }],
        expiresAt: new Date(),
      };

      uploadsService.syncWithS3.mockResolvedValue(mockStatus);

      const req = {
        user: { id: mockUserId },
      } as any;

      const result = await controller.syncUpload(req, mockSessionId);

      expect(result).toEqual(mockStatus);
      expect(uploadsService.syncWithS3).toHaveBeenCalledWith(
        mockUserId,
        mockSessionId,
      );
    });
  });
});
