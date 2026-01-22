import { Test, TestingModule } from '@nestjs/testing';
import { MetadataExtractionService } from './metadata-extraction.service';
import { VideoProcessingService } from './video-processing.service';

describe('MetadataExtractionService', () => {
  let service: MetadataExtractionService;
  let videoProcessingService: VideoProcessingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetadataExtractionService, VideoProcessingService],
    }).compile();

    service = module.get<MetadataExtractionService>(MetadataExtractionService);
    videoProcessingService = module.get<VideoProcessingService>(VideoProcessingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTools', () => {
    it('should check for ffprobe availability', async () => {
      const result = await service.validateTools();
      expect(result).toHaveProperty('ffprobe');
      expect(result).toHaveProperty('exiftool');
      expect(typeof result.ffprobe).toBe('boolean');
      expect(typeof result.exiftool).toBe('boolean');
    });
  });

  describe('extractMetadata', () => {
    it('should reject unsupported MIME types', async () => {
      await expect(
        service.extractMetadata('test.txt', 'text/plain'),
      ).rejects.toThrow('Unsupported MIME type');
    });

    it('should route video files to video processing', async () => {
      const spy = jest
        .spyOn(videoProcessingService, 'processVideoFile')
        .mockResolvedValue({
          codec: 'h264',
          container: 'mp4',
          duration: 120,
          width: 1920,
          height: 1080,
        });

      const result = await service.extractMetadata(
        'test.mp4',
        'video/mp4',
      );

      expect(spy).toHaveBeenCalledWith('test.mp4');
      expect(result.type).toBe('video');
      expect(result.video).toBeDefined();
      expect(result.video?.codec).toBe('h264');
    });

    it('should route audio files to audio processing', async () => {
      const spy = jest
        .spyOn(videoProcessingService, 'processAudioFile')
        .mockResolvedValue({
          codec: 'aac',
          duration: 180,
          bitrate: 128,
        });

      const result = await service.extractMetadata(
        'test.mp3',
        'audio/mp3',
      );

      expect(spy).toHaveBeenCalledWith('test.mp3');
      expect(result.type).toBe('audio');
      expect(result.audio).toBeDefined();
    });
  });
});
