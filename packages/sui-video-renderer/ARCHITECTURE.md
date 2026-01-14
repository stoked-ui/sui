# Video Renderer Service Architecture

## Overview

This document describes the architecture and structure of the Video Renderer service scaffolding.

## Package Structure

```
video-renderer/
├── src/
│   ├── render/                      # Core rendering module
│   │   ├── dto/                     # Data Transfer Objects
│   │   │   ├── video-project.dto.ts
│   │   │   ├── render-job.dto.ts
│   │   │   └── index.ts
│   │   ├── schemas/                 # MongoDB schemas
│   │   │   ├── render-job.schema.ts
│   │   │   ├── video-project.schema.ts
│   │   │   └── index.ts
│   │   ├── services/                # Business logic
│   │   │   ├── render-orchestrator.service.ts
│   │   │   ├── frame-composer.service.ts
│   │   │   ├── video-encoder.service.ts
│   │   │   └── index.ts
│   │   ├── interfaces/              # TypeScript interfaces
│   │   │   └── render-job.interface.ts
│   │   ├── render.controller.ts     # REST API endpoints
│   │   └── render.module.ts         # NestJS module
│   ├── queue/                       # Job queue module
│   │   ├── processors/
│   │   │   └── render-job.processor.ts
│   │   ├── services/
│   │   │   └── render-queue.service.ts
│   │   └── queue.module.ts
│   ├── storage/                     # File storage module
│   │   ├── services/
│   │   │   └── storage.service.ts
│   │   └── storage.module.ts
│   ├── common/                      # Shared utilities
│   │   ├── filters/
│   │   │   └── all-exceptions.filter.ts
│   │   └── interceptors/
│   │       └── logging.interceptor.ts
│   ├── app.module.ts                # Root application module
│   ├── app.controller.ts            # Root controller
│   └── main.ts                      # Application entry point
├── test/                            # E2E tests
├── Dockerfile                       # Multi-stage Docker build
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── nest-cli.json                    # NestJS CLI configuration
├── jest.config.ts                   # Jest testing configuration
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── .dockerignore                    # Docker ignore rules
└── README.md                        # Documentation
```

## Module Descriptions

### RenderModule
**Purpose**: Core rendering orchestration and job management

**Components**:
- `RenderController`: REST API endpoints for project submission, job management, and status queries
- `RenderOrchestratorService`: Coordinates the rendering pipeline, manages job lifecycle
- `FrameComposerService`: Handles frame-by-frame composition from layer data
- `VideoEncoderService`: FFmpeg-based video and audio encoding
- `RenderJob` Schema: MongoDB model for job state persistence
- `VideoProject` Schema: MongoDB model for project data storage

**Key Responsibilities**:
- Accept video project submissions
- Create and queue render jobs
- Track rendering progress
- Manage job cancellation
- Handle job completion callbacks

### QueueModule
**Purpose**: Asynchronous job processing with Bull/Redis

**Components**:
- `RenderQueueService`: Queue management and operations
- `RenderJobProcessor`: Bull processor for executing render jobs

**Key Responsibilities**:
- Job queuing with priority
- Concurrent processing control
- Retry logic for failures
- Progress tracking
- Job state management

### StorageModule
**Purpose**: File storage operations (S3 integration)

**Components**:
- `StorageService`: S3 upload/download operations

**Key Responsibilities**:
- Upload rendered videos to S3
- Generate signed URLs for downloads
- Manage temporary file storage
- Handle file cleanup and lifecycle
- Support multipart uploads for large files

## Data Flow

### Video Rendering Pipeline

```
1. Client Request
   ↓
2. Create Video Project (POST /api/v1/render/projects)
   → Store project data in MongoDB
   ↓
3. Submit Render Job (POST /api/v1/render/jobs)
   → Create RenderJob record
   → Add to Bull queue
   ↓
4. Queue Processing (RenderJobProcessor)
   ↓
5. Load Project Data
   ↓
6. Compose Frames (FrameComposerService)
   → Render each frame from layer data
   → Save to temporary storage
   ↓
7. Encode Video (VideoEncoderService)
   → FFmpeg: frames → video
   ↓
8. Process Audio (if present)
   → Encode audio tracks
   → Mix multiple tracks
   ↓
9. Merge Streams
   → Combine video + audio
   ↓
10. Upload to S3 (StorageService)
    → Multipart upload for large files
    ↓
11. Cleanup
    → Remove temporary files
    ↓
12. Complete Job
    → Update status to COMPLETED
    → Trigger callback notification
    ↓
13. Client Polls Status (GET /api/v1/render/jobs/:jobId)
    → Returns job status and output URL
```

## API Endpoints

### Projects
- `POST /api/v1/render/projects` - Create video project
- Body: `VideoProjectDto` with frames, audio tracks, dimensions, quality

### Jobs
- `POST /api/v1/render/jobs` - Submit render job
- `GET /api/v1/render/jobs/:jobId` - Get job status
- `GET /api/v1/render/jobs?userId=X` - List user's jobs
- `DELETE /api/v1/render/jobs/:jobId` - Cancel job

### Health
- `GET /api/v1/health` - Service health check

## Data Models

### VideoProjectDto
```typescript
{
  projectId: string;
  userId: string;
  title: string;
  width: number;
  height: number;
  frameRate: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  frames: FrameCompositionDto[];
  audioTracks?: AudioTrackDto[];
  outputFormat?: string;
}
```

### RenderJobStatusDto
```typescript
{
  jobId: string;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  currentPhase?: string;
  estimatedTimeRemaining?: number;
  error?: string;
  outputUrl?: string;
}
```

## Quality Presets

| Quality | CRF | Preset | Use Case |
|---------|-----|--------|----------|
| ULTRA | 18 | slow | Maximum quality, archival |
| HIGH | 23 | medium | High quality, standard use |
| MEDIUM | 28 | fast | Balanced quality/speed |
| LOW | 32 | veryfast | Quick previews |

## Dependencies

### Core
- `@nestjs/common`, `@nestjs/core` - NestJS framework
- `@nestjs/mongoose` - MongoDB integration
- `@nestjs/bull` - Queue management
- `mongoose` - MongoDB ODM
- `bull` - Redis-backed job queue
- `redis` - Redis client

### Video Processing
- `fluent-ffmpeg` - FFmpeg wrapper for video encoding
- `sharp` - Image processing for frame composition

### Storage
- `@aws-sdk/client-s3` - S3 client
- `@aws-sdk/s3-request-presigner` - Signed URL generation

### Validation & Documentation
- `class-validator`, `class-transformer` - DTO validation
- `@nestjs/swagger` - API documentation

## Docker Deployment

### Build Stages
1. **dev**: Development stage with all dependencies
2. **build**: Compile TypeScript, build NestJS app
3. **prod**: Minimal production image with FFmpeg

### Image Features
- Multi-stage build for size optimization
- FFmpeg pre-installed
- Non-root user execution
- Temporary storage directory for processing
- Health check support

### Environment Variables
See `.env.example` for complete list:
- MongoDB connection
- Redis configuration
- S3 credentials
- Processing limits
- Queue settings

## ECS Deployment Considerations

### Task Definition
- CPU: 2048 (2 vCPU) minimum for video processing
- Memory: 4096 MB (4 GB) minimum
- Ephemeral storage: 30 GB for temporary frame storage
- Container port: 3001

### Service Configuration
- Desired count: 2+ for high availability
- Auto-scaling based on queue depth
- Health check: `/api/v1/health`
- Load balancer: ALB with target group

### Required IAM Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::video-renders/*"
    }
  ]
}
```

### Environment Setup
- VPC with private subnets for task execution
- Security group allowing inbound on port 3001
- NAT Gateway for outbound S3/MongoDB access
- MongoDB Atlas or DocumentDB connection
- ElastiCache Redis cluster for queue

## Next Steps for Implementation

### High Priority
1. **Frame Composition Logic**
   - Implement canvas-based rendering
   - Add layer support (images, text, shapes)
   - Implement transformations and blending

2. **Video Encoding**
   - Integrate fluent-ffmpeg
   - Implement quality presets
   - Add audio processing pipeline

3. **Storage Integration**
   - Complete S3 upload implementation
   - Add multipart upload for large files
   - Implement file lifecycle management

### Medium Priority
4. **Queue Processing**
   - Implement complete processor logic
   - Add progress tracking
   - Implement callback notifications

5. **Testing**
   - Unit tests for services
   - Integration tests
   - E2E API tests

### Low Priority
6. **Authentication**
   - JWT validation
   - User quota checking
   - Rate limiting

7. **Monitoring**
   - CloudWatch metrics
   - Performance logging
   - Error tracking

## Performance Considerations

### Concurrency
- Default: 4 concurrent renders
- Adjustable via `MAX_CONCURRENT_RENDERS`
- Frame composition: 8 parallel workers
- Configurable per quality preset

### Resource Management
- Temporary file cleanup after encoding
- Memory limits per render job
- Disk space monitoring
- Queue backpressure handling

### Optimization Opportunities
- Frame caching for repeated layers
- Parallel frame composition
- Incremental encoding
- Progressive upload during encoding
