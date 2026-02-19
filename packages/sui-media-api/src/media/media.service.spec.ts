import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MediaService } from './media.service';
import { S3Service } from '../s3/s3.service';
import { MetadataExtractionService } from './metadata/metadata-extraction.service';

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: S3Service,
          useValue: {
            objectExists: jest.fn(),
            deleteObject: jest.fn(),
            getSignedDownloadUrl: jest.fn(),
          },
        },
        {
          provide: MetadataExtractionService,
          useValue: {
            extractMetadata: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => defaultValue),
          },
        },
      ],
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
