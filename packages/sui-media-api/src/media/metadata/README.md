# Metadata Extraction Services

This directory contains services for extracting metadata from media files using ffmpeg/ffprobe.

## Services

### MetadataExtractionService

Main orchestration service that routes files to the appropriate processing service based on MIME type.

**Features:**
- Supports video, audio, and image files
- Automatic routing based on MIME type
- EXIF data extraction for images (optional, requires exiftool)
- Error tracking and logging
- Tool validation

**Usage:**
```typescript
const metadata = await metadataExtractionService.extractMetadata(
  fileUrl,
  mimeType
);
```

### VideoProcessingService

Handles video and audio file processing using ffprobe.

**Video Metadata Extracted:**
- Codec (h264, h265, vp8, vp9, av1)
- Container format (mp4, mov, webm, mkv)
- Duration
- Dimensions (width, height)
- Bitrate
- Framerate
- Moov atom position (for MP4 files)

**Audio Metadata Extracted:**
- Codec
- Duration
- Bitrate
- Sample rate
- Channels

**Safety Features:**
- Uses `spawn` instead of `exec` to prevent command injection
- Handles special characters in filenames and URLs
- Safe timeout handling
- Proper error handling for corrupt files

## API Endpoint

### POST /media/:id/extract-metadata

Triggers metadata extraction for a media item.

**Request:**
```bash
POST /media/media_123/extract-metadata
```

**Response:**
```json
{
  "success": true,
  "metadata": {
    "type": "video",
    "video": {
      "codec": "h264",
      "container": "mp4",
      "bitrate": 2500,
      "duration": 120.5,
      "width": 1920,
      "height": 1080,
      "framerate": 30,
      "moovAtomPosition": "start"
    },
    "extractedAt": "2026-01-21T10:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to process video: No video stream found"
}
```

## Dependencies

**Required:**
- `ffprobe` - For video/audio/image metadata extraction

**Optional:**
- `exiftool` - For EXIF data extraction from images

## Installation

Install ffmpeg (includes ffprobe):
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Alpine Linux (Docker)
apk add ffmpeg
```

Install exiftool (optional):
```bash
# macOS
brew install exiftool

# Ubuntu/Debian
sudo apt-get install libimage-exiftool-perl
```

## Architecture

```
MetadataExtractionService
├── extractMetadata(fileUrl, mimeType)
│   ├── video/* → extractVideoMetadata()
│   │   └── VideoProcessingService.processVideoFile()
│   ├── audio/* → extractAudioMetadata()
│   │   └── VideoProcessingService.processAudioFile()
│   └── image/* → extractImageMetadata()
│       ├── ffprobe (dimensions, format)
│       └── exiftool (EXIF data)
└── validateTools()
    ├── Check ffprobe
    └── Check exiftool
```

## Error Handling

Errors are tracked in the Media entity's `metadataProcessingFailures` field:

```typescript
{
  task: 'metadata-extraction',
  error: 'Error message',
  timestamp: Date,
  attemptCount: number
}
```

This allows for:
- Debugging failed extractions
- Implementing retry logic
- Tracking reliability metrics

## Testing

Run tests:
```bash
pnpm test metadata-extraction.service.spec.ts
```

The test suite covers:
- Service initialization
- Tool validation
- MIME type routing
- Error handling
- Mock data processing

## Future Enhancements

- [ ] Queue-based async processing
- [ ] Retry logic with exponential backoff
- [ ] Progress tracking for large files
- [ ] Webhook notifications on completion
- [ ] Caching of extracted metadata
- [ ] Support for more exotic formats
- [ ] Thumbnail extraction integration
