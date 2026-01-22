import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTOs for metadata extraction operations
 */

export class ExtractMetadataResponseDto {
  @ApiProperty({
    description: 'Whether extraction was successful',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Extracted metadata',
    example: {
      type: 'video',
      video: {
        codec: 'h264',
        container: 'mp4',
        bitrate: 5000000,
        duration: 120.5,
        width: 1920,
        height: 1080,
        framerate: 30,
        moovAtomPosition: 'start',
      },
      extractedAt: '2024-01-15T00:00:00.000Z',
    },
  })
  metadata?: {
    type: 'video' | 'audio' | 'image';
    video?: {
      codec?: string;
      container?: string;
      bitrate?: number;
      duration?: number;
      width?: number;
      height?: number;
      framerate?: number;
      moovAtomPosition?: 'start' | 'end';
    };
    audio?: {
      codec?: string;
      bitrate?: number;
      duration?: number;
      sampleRate?: number;
      channels?: number;
    };
    image?: {
      width?: number;
      height?: number;
      format?: string;
      exif?: Record<string, any>;
    };
    extractedAt: Date;
  };

  @ApiPropertyOptional({
    description: 'Error message if extraction failed',
    example: 'File not found',
  })
  error?: string;
}

export class MetadataExtractionFailureDto {
  @ApiProperty({
    description: 'Task identifier',
    example: 'extract_metadata',
  })
  task: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Failed to extract metadata',
  })
  error: string;

  @ApiProperty({
    description: 'Timestamp of failure',
    example: '2024-01-15T00:00:00.000Z',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Number of attempts',
    example: 3,
  })
  attemptCount: number;
}
