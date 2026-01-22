import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaService],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return media info', () => {
    const result = service.getInfo();
    expect(result).toHaveProperty('name', '@stoked-ui/media-api');
    expect(result).toHaveProperty('version', '0.1.0');
    expect(result).toHaveProperty('description');
  });
});
