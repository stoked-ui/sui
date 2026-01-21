/**
 * Media Entity
 * Based on v3 ExtendedMediaItem interface
 * Represents a media file (image, video, album) with metadata
 */
export class MediaEntity {
  // Core identification
  _id: string;
  author: string; // User ID of the owner

  // Basic metadata
  title?: string;
  description?: string;

  // Media properties
  mediaType: 'image' | 'video' | 'album';
  mime: string;
  file: string; // S3 key or URL
  bucket?: string; // S3 bucket name

  // Dimensions
  width?: number;
  height?: number;
  duration?: number; // For videos, in seconds
  size?: number; // File size in bytes

  // Thumbnails
  thumbnail?: string; // Main thumbnail URL
  paidThumbnail?: string; // Blurred thumbnail for paid content
  thumbnailKeys?: string[]; // S3 keys for all thumbnails
  thumbs?: string[]; // Array of thumbnail URLs (for multiple sizes)
  thumbnailGenerationFailed?: boolean; // Track failed thumbnail generation attempts

  // Access control
  publicity: 'public' | 'private' | 'paid' | 'subscription';
  rating?: 'ga' | 'nc17';

  // Pricing
  price?: number; // Price in satoshis for paid content

  // Social features
  starring?: string[]; // Array of tagged user IDs
  views?: number;
  tags?: string[]; // User-defined tags

  // MediaClass integration (for branded content)
  mediaClass?: string; // MediaClass ID
  videoBug?: string; // Watermark/branding overlay

  // Video-specific metadata
  codec?: string;
  container?: 'mp4' | 'mov' | 'webm' | 'mkv';
  moovAtomPosition?: 'start' | 'end';
  bitrate?: number; // Video bitrate in kbps
  framerate?: number;

  // Audio metadata
  audioCodec?: string;
  audioBitrate?: number; // Audio bitrate in kbps
  audioSampleRate?: number;
  audioChannels?: number;

  // Image metadata
  imageFormat?: string;
  exifData?: Record<string, any>;

  // Scrubber sprite for hover preview
  scrubberSprite?: string; // S3 key for sprite image
  scrubberSpriteConfig?: {
    totalFrames: number;
    framesPerRow: number;
    frameWidth: number;
    frameHeight: number;
    spriteSheetWidth: number;
    spriteSheetHeight: number;
    interval: number; // seconds between frames
  };
  scrubberGenerated?: boolean;
  scrubberGenerationFailed?: boolean;

  // Processing metadata
  processingStatus?: 'pending' | 'processing' | 'complete' | 'failed';
  processingTasks?: {
    thumbnails?: boolean;
    duration?: boolean;
    dimensions?: boolean;
    blurredThumbnail?: boolean;
    sprites?: boolean;
    metadata?: boolean;
  };

  // Metadata extraction failures tracking
  metadataProcessingFailures?: Array<{
    task: string;
    error: string;
    timestamp: Date;
    attemptCount: number;
  }>;

  // Upload session tracking
  uploadSessionId?: string;

  // Soft delete
  deleted?: boolean;
  deletedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<MediaEntity>) {
    Object.assign(this, partial);

    // Set defaults
    this.publicity = this.publicity || 'private';
    this.views = this.views || 0;
    this.deleted = this.deleted || false;
    this.processingStatus = this.processingStatus || 'complete';
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = this.updatedAt || new Date();
  }
}
