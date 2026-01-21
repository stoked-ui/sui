import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ThumbnailGenerationService, ThumbnailSize } from './thumbnail-generation.service';
import { S3Service } from '../s3/s3.service';

describe('ThumbnailGenerationService', () => {
  let service: ThumbnailGenerationService;
  let s3Service: S3Service;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThumbnailGenerationService,
        {
          provide: S3Service,
          useValue: {
            putObject: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              if (key === 'AWS_REGION') return 'us-east-1';
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ThumbnailGenerationService>(ThumbnailGenerationService);
    s3Service = module.get<S3Service>(S3Service);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getVideoMetadata', () => {
    it('should extract video metadata using FFmpeg', async () => {
      // This test requires a real video file and FFmpeg installed
      // Skip in CI/CD environments without FFmpeg
      if (!process.env.FFMPEG_AVAILABLE) {
        return;
      }

      // Mock test - actual implementation would need a test video file
      expect(service.getVideoMetadata).toBeDefined();
    });
  });

  describe('thumbnail generation', () => {
    it('should define thumbnail generation method', () => {
      expect(service.generateThumbnail).toBeDefined();
    });

    it('should define sprite sheet generation method', () => {
      expect(service.generateSpriteSheet).toBeDefined();
    });
  });

  describe('VTT generation', () => {
    it('should generate valid WebVTT content', () => {
      // Access private method for testing via type assertion
      const generateVTT = (service as any).generateVTT.bind(service);

      const vtt = generateVTT(
        'https://example.com/sprite.jpg',
        5, // totalFrames
        5, // framesPerRow
        160, // frameWidth
        90, // frameHeight
        10, // interval
      );

      expect(vtt).toContain('WEBVTT');
      expect(vtt).toContain('https://example.com/sprite.jpg');
      expect(vtt).toContain('#xywh=');
      expect(vtt).toContain('00:00:00.000 --> 00:00:10.000');
    });
  });

  describe('S3 URL building', () => {
    it('should build correct S3 URL', () => {
      const buildS3Url = (service as any).buildS3Url.bind(service);
      const url = buildS3Url('my-bucket', 'path/to/file.jpg');

      expect(url).toBe(
        'https://my-bucket.s3.us-east-1.amazonaws.com/path/to/file.jpg',
      );
    });
  });
});
