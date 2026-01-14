# @stoked-ui/video-renderer

NestJS-based video rendering service for composing frames and generating high-quality video output from `.sue` (Stoked UI Editor) project files.

## Overview

This service provides a scalable video rendering pipeline that:

- Accepts video project data with frame composition instructions
- Processes frames with layer-based composition
- Encodes video and audio streams
- Generates final video files with configurable quality settings
- Supports phased rendering approach with progress tracking
- Handles job queuing and concurrent processing
- Stores output in S3-compatible storage

## Architecture

### Core Modules

- **RenderModule**: Core rendering orchestration and job management
- **QueueModule**: Bull/Redis-based job queue for asynchronous processing
- **StorageModule**: S3 file storage and management

### Key Components

- **RenderOrchestratorService**: Coordinates the rendering pipeline
- **FrameComposerService**: Handles frame-by-frame composition
- **VideoEncoderService**: FFmpeg-based video/audio encoding
- **RenderQueueService**: Job queue management
- **StorageService**: S3 upload/download operations

## API Endpoints

### Create Video Project
```
POST /api/v1/render/projects
```

### Submit Render Job
```
POST /api/v1/render/jobs
```

### Get Job Status
```
GET /api/v1/render/jobs/:jobId
```

### Cancel Render Job
```
DELETE /api/v1/render/jobs/:jobId
```

## Monorepo Integration

This package is integrated into the stoked-ui monorepo as a workspace package:

```json
{
  "name": "@stoked-ui/video-renderer",
  "peerDependencies": {
    "@stoked-ui/common": "workspace:*"
  }
}
```

### Running with stoked-ui Development

From the monorepo root, the `pnpm dev` command runs both services concurrently:

```bash
# Start both Next.js docs (port 5199) and video-renderer API (port 3001)
pnpm dev

# Start only video-renderer
pnpm video-renderer:dev

# Build video-renderer
pnpm video-renderer:build
```

The service will be available at:
- **API**: http://localhost:3001/api/v1
- **Swagger Docs**: http://localhost:3001/api/docs
- **Frontend**: https://localhost:5199 (docs site with video editor)

### CORS Configuration

The service is configured to accept requests from the docs site:

```env
CORS_ORIGIN=http://localhost:5199,https://localhost:5199
```

## Installation

```bash
# From monorepo root - install all dependencies
pnpm install

# Copy environment file (if not exists)
cp packages/sui-video-renderer/.env.example packages/sui-video-renderer/.env

# Configure environment variables
# Edit .env with your MongoDB, Redis, and S3 credentials
```

## Development

```bash
# Start in development mode with watch
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## Docker Deployment

```bash
# Build Docker image
docker build -t video-renderer:latest .

# Run container
docker run -p 3001:3001 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017 \
  -e REDIS_HOST=host.docker.internal \
  video-renderer:latest
```

## ECS Deployment

The service is designed for deployment on AWS ECS with:

- Multi-stage Docker build for optimized image size
- FFmpeg included for video processing
- S3 integration for output storage
- Redis-backed job queue
- MongoDB for job state persistence
- Horizontal scaling support

### Environment Variables

See `.env.example` for required configuration:

- MongoDB connection
- Redis connection for queue
- S3 credentials and bucket configuration
- Processing limits and concurrency settings

## .sue File Format

The service processes `.sue` (Stoked UI Editor) files, which are JSON-based deterministic render manifests containing:

- **Timeline**: Composition duration, fps, resolution, playback settings
- **Tracks**: Audio, video, text layers with z-ordering and visibility
- **Actions**: Media items (video, image, audio) and effects with keyframes
- **Metadata**: Project settings, export configuration, rendering options

### Example .sue Structure

```json
{
  "timeline": {
    "duration": 30000,
    "fps": 30,
    "width": 1920,
    "height": 1080
  },
  "tracks": [
    {
      "id": "track-1",
      "type": "video",
      "zIndex": 1,
      "actions": [
        {
          "id": "action-1",
          "type": "media",
          "mediaType": "video",
          "source": "s3://bucket/video.mp4",
          "startTime": 0,
          "duration": 5000,
          "effects": []
        }
      ]
    }
  ]
}
```

## Rendering Strategies

The service supports two rendering approaches:

### FFmpeg Compositor (Option A)
- **Speed**: Fastest rendering using native video processing
- **Reliability**: Most stable for production workloads
- **Use Case**: Standard compositions, performance-critical exports

### Chromium Renderer (Option B)
- **Flexibility**: Supports complex CSS/Canvas effects and animations
- **Quality**: Pixel-perfect rendering from headless browser
- **Use Case**: Advanced animations, web-based effects, custom shaders

## Processing Pipeline

1. **Project Submission**: Client submits `.sue` file with composition data
2. **Job Queuing**: Job added to Redis queue with priority
3. **Frame Composition**: Each frame rendered from layer data and effects
4. **Video Encoding**: Frames encoded to video using FFmpeg
5. **Audio Processing**: Audio tracks mixed and encoded
6. **Stream Merging**: Video and audio merged
7. **Upload**: Final video uploaded to S3
8. **Notification**: Job completion callback triggered

## Quality Presets

- **ULTRA**: Highest quality (CRF 18, slow preset)
- **HIGH**: High quality (CRF 23, medium preset)
- **MEDIUM**: Balanced (CRF 28, fast preset)
- **LOW**: Fast processing (CRF 32, veryfast preset)

## Monitoring

Health check endpoint: `GET /api/v1/health`

Queue statistics: Available through queue service methods

## TODO: Implementation Tasks

The following core components need implementation:

### Frame Composition (High Priority)
- [ ] Implement canvas-based layer rendering
- [ ] Add support for image layers
- [ ] Add support for text layers with fonts
- [ ] Implement layer transformations (position, scale, rotation)
- [ ] Add blending modes and opacity
- [ ] Implement effects and filters

### Video Encoding (High Priority)
- [ ] Integrate fluent-ffmpeg for video encoding
- [ ] Implement quality preset encoding
- [ ] Add audio track processing
- [ ] Implement stream merging
- [ ] Add thumbnail generation

### Storage (Medium Priority)
- [ ] Implement S3 upload with AWS SDK
- [ ] Add multipart upload for large files
- [ ] Implement signed URL generation
- [ ] Add file cleanup/lifecycle management

### Queue Processing (Medium Priority)
- [ ] Implement render job processor logic
- [ ] Add progress tracking and updates
- [ ] Implement retry logic for failures
- [ ] Add callback notification system

### Testing (Medium Priority)
- [ ] Unit tests for all services
- [ ] Integration tests for rendering pipeline
- [ ] E2E tests for API endpoints
- [ ] Performance tests for concurrent processing

### Authentication & Authorization (Low Priority)
- [ ] Integrate with main API auth system
- [ ] Add JWT validation
- [ ] Implement user quota checking
- [ ] Add rate limiting

## Troubleshooting

### MongoDB Connection Issues

Ensure MongoDB is running:
```bash
# macOS with Homebrew
brew services start mongodb-community
```

### Redis Connection Issues

Ensure Redis is running:
```bash
# macOS with Homebrew
brew services start redis
```

### Port Already in Use

If port 3001 is occupied, update `PORT` in `.env`:
```env
PORT=3002
```

## License

MIT - See root LICENSE file
