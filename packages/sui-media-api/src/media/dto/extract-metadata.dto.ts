/**
 * DTOs for metadata extraction operations
 */

export class ExtractMetadataResponseDto {
  success: boolean;
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
  error?: string;
}

export class MetadataExtractionFailureDto {
  task: string;
  error: string;
  timestamp: Date;
  attemptCount: number;
}
