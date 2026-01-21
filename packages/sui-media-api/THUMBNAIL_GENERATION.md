# Thumbnail Generation Service

## Overview

The Thumbnail Generation Service provides comprehensive video thumbnail and sprite sheet generation capabilities for the Stoked UI Media API. It integrates with FFmpeg for frame extraction and Sharp for image processing.

## Features

### 1. Single Thumbnail Generation
- Extract frame at specific timestamp
- Multiple size options (small, medium, large)
- Automatic upload to S3
- JPEG optimization (quality: 85)

### 2. Sprite Sheet Generation
- Automatic frame extraction at intervals
- Intelligent interval calculation based on duration
- Composite sprite sheet creation
- VTT file generation for video scrubbing

### 3. S3 Integration
- Automatic upload of thumbnails
- Upload of sprite sheets
- Upload of VTT files
- URL generation for CDN access

## API Endpoints

### POST /media/:id/generate-thumbnail

Generate a single thumbnail at a specific timestamp.

**Request Body:**
```json
{
  "timestamp": 30.5,
  "size": "medium"
}
```

**Size Options:**
- `small`: 160x90
- `medium`: 320x180 (default)
- `large`: 640x360

**Response:**
```json
{
  "thumbnailUrl": "https://bucket.s3.region.amazonaws.com/media/123/thumbnails/medium-30.5s.jpg",
  "thumbnailKey": "media/123/thumbnails/medium-30.5s.jpg",
  "width": 320,
  "height": 180
}
```

### POST /media/:id/generate-sprites

Generate sprite sheet for video scrubbing.

**Request Body:**
```json
{
  "frameWidth": 160,
  "frameHeight": 90,
  "framesPerRow": 10,
  "interval": 10
}
```

All fields are optional. Defaults will be calculated automatically.

**Default Intervals:**
- Videos < 2 min: 5 seconds
- Videos 2-10 min: 10 seconds
- Videos > 10 min: 15 seconds

**Response:**
```json
{
  "spriteSheetUrl": "https://bucket.s3.region.amazonaws.com/media/123/sprites/sprite-sheet.jpg",
  "spriteSheetKey": "media/123/sprites/sprite-sheet.jpg",
  "vttUrl": "https://bucket.s3.region.amazonaws.com/media/123/sprites/sprite-sheet.vtt",
  "vttKey": "media/123/sprites/sprite-sheet.vtt",
  "spriteConfig": {
    "totalFrames": 30,
    "framesPerRow": 10,
    "frameWidth": 160,
    "frameHeight": 90,
    "spriteSheetWidth": 1600,
    "spriteSheetHeight": 270,
    "interval": 10
  }
}
```

## Service Methods

### generateThumbnail()

```typescript
async generateThumbnail(
  videoPath: string,
  timestamp: number,
  size: ThumbnailSize,
  bucket: string,
  keyPrefix: string,
): Promise<ThumbnailResult>
```

Generates a single thumbnail at the specified timestamp.

**Process:**
1. Extract frame using FFmpeg
2. Resize using Sharp
3. Optimize as JPEG
4. Upload to S3
5. Return URL and metadata

### generateThumbnails()

```typescript
async generateThumbnails(
  videoPath: string,
  timestamp: number,
  sizes: ThumbnailSize[],
  bucket: string,
  keyPrefix: string,
): Promise<ThumbnailResult[]>
```

Generate multiple thumbnails at different sizes in one call.

### generateSpriteSheet()

```typescript
async generateSpriteSheet(
  videoPath: string,
  duration: number,
  bucket: string,
  keyPrefix: string,
  options?: {
    frameWidth?: number;
    frameHeight?: number;
    framesPerRow?: number;
    interval?: number;
  },
): Promise<SpriteSheetResult>
```

Generates a complete sprite sheet with VTT file.

**Process:**
1. Calculate interval and frame count
2. Extract frames using FFmpeg
3. Resize frames using Sharp
4. Composite into sprite sheet
5. Generate WebVTT file
6. Upload sprite sheet to S3
7. Upload VTT file to S3
8. Return URLs and config

### getVideoMetadata()

```typescript
async getVideoMetadata(
  videoPath: string,
): Promise<{ duration: number; width: number; height: number }>
```

Extract video metadata using FFmpeg probe.

## VTT File Format

The generated VTT (WebVTT) file follows this format:

```vtt
WEBVTT

00:00:00.000 --> 00:00:10.000
https://bucket.s3.region.amazonaws.com/sprite.jpg#xywh=0,0,160,90

00:00:10.000 --> 00:00:20.000
https://bucket.s3.region.amazonaws.com/sprite.jpg#xywh=160,0,160,90

00:00:20.000 --> 00:00:30.000
https://bucket.s3.region.amazonaws.com/sprite.jpg#xywh=320,0,160,90
```

Each cue specifies:
- Time range
- Sprite sheet URL
- Frame coordinates (x, y, width, height)

## Integration with Media Entity

The service updates the Media entity with:

```typescript
{
  // Single thumbnail
  thumbnail: "https://...",
  thumbnailKeys: ["media/123/thumbnails/medium-30.5s.jpg"],
  thumbs: ["https://...", "https://..."], // multiple sizes
  thumbnailGenerationFailed: false,

  // Sprite sheet
  scrubberGenerated: true,
  scrubberSprite: "https://...",
  scrubberSpriteConfig: {
    totalFrames: 30,
    framesPerRow: 10,
    frameWidth: 160,
    frameHeight: 90,
    spriteSheetWidth: 1600,
    spriteSheetHeight: 270,
    interval: 10
  }
}
```

## Error Handling

The service handles:
- Missing video files
- FFmpeg failures
- S3 upload failures
- Invalid timestamps
- Corrupt video files

When thumbnail generation fails, set:
```typescript
media.thumbnailGenerationFailed = true;
```

When sprite generation fails, set:
```typescript
media.scrubberGenerationFailed = true;
```

## Performance Considerations

### Thumbnail Generation
- Single frame extraction: ~1-2 seconds
- Multiple sizes: ~2-4 seconds
- S3 upload: ~500ms per file

### Sprite Sheet Generation
- Frame extraction: ~5-30 seconds (depending on video length)
- Sprite composition: ~2-5 seconds
- S3 upload: ~1-2 seconds
- **Total**: 8-40 seconds for typical videos

### Optimization Tips
1. Use async/background processing for sprite generation
2. Cache generated sprites
3. Generate thumbnails on-demand
4. Use smaller frame sizes for faster generation

## Frontend Integration

The sprite sheet config matches the `SpriteConfig` interface in `@stoked-ui/media`:

```typescript
interface SpriteConfig {
  totalFrames: number;
  framesPerRow: number;
  frameWidth: number;
  frameHeight: number;
  spriteSheetWidth: number;
  spriteSheetHeight: number;
  interval: number;
}
```

This config is used by the `ThumbnailStrip` component for video scrubbing.

## Dependencies

- **fluent-ffmpeg**: FFmpeg wrapper for frame extraction
- **sharp**: Fast image processing library
- **@aws-sdk/client-s3**: S3 upload functionality

## Environment Variables

```env
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-media-bucket
```

## Future Enhancements

1. Queue-based processing for batch operations
2. Progress tracking for long-running operations
3. Retry logic for failed uploads
4. Thumbnail caching
5. WebP format support
6. Animated thumbnail GIFs
7. Smart thumbnail selection (scene detection)
8. Preview animations (sequence of thumbnails)

## Testing

Run tests:
```bash
pnpm test thumbnail-generation.service.spec.ts
```

Integration test with real video:
```bash
FFMPEG_AVAILABLE=1 pnpm test thumbnail-generation.service.spec.ts
```

## Usage Example

```typescript
import { ThumbnailGenerationService, ThumbnailSize } from './thumbnail-generation.service';

// Generate thumbnail
const thumbnail = await thumbnailService.generateThumbnail(
  '/path/to/video.mp4',
  30.5, // timestamp in seconds
  ThumbnailSize.MEDIUM,
  'my-bucket',
  'media/123'
);

// Generate sprite sheet
const spriteSheet = await thumbnailService.generateSpriteSheet(
  '/path/to/video.mp4',
  300, // duration in seconds
  'my-bucket',
  'media/123',
  {
    frameWidth: 160,
    frameHeight: 90,
    framesPerRow: 10,
    interval: 10
  }
);
```

## Work Item Completion

This implementation completes **Work Item 3.4: Implement Thumbnail Generation Service** from Project #9.

**Deliverables:**
- ✅ ThumbnailGenerationService created
- ✅ Single thumbnail generation works
- ✅ Sprite sheet + VTT generation works
- ✅ Thumbnails uploaded to S3
- ✅ URLs stored in Video model
- ✅ Tests passing
- ✅ Documentation complete
