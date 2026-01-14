# FFmpeg Renderer - Quick Start Guide

## Installation

```bash
# Install FFmpeg
brew install ffmpeg  # macOS
sudo apt install ffmpeg  # Ubuntu/Debian

# Install dependencies
pnpm install

# Build project
pnpm build
```

## Basic Usage

### 1. Create .sue Project File

```json
{
  "id": "my-project",
  "name": "My Video",
  "version": 2,
  "tracks": [
    {
      "controllerName": "video",
      "fileId": "file-1",
      "id": "track-1",
      "name": "Main Video",
      "url": "/absolute/path/to/video.mp4",
      "actions": [{
        "name": "clip-1",
        "start": 0,
        "end": 10,
        "trimStart": 0,
        "z": 0,
        "fit": "fill"
      }]
    }
  ],
  "backgroundColor": "#000000",
  "width": 1920,
  "height": 1080,
  "frameRate": 30
}
```

### 2. Render Video

```typescript
import { RenderOrchestratorService } from '@desirable/video-renderer';

// Create project
const project = await orchestrator.createProjectFromSue(
  '/path/to/project.sue',
  'user-id'
);

// Create job
const job = await orchestrator.createRenderJob({
  projectId: project.projectId,
  userId: 'user-id',
});

// Execute render
await orchestrator.executeRenderJob(job.jobId, '/path/to/project.sue');

// Check status
const status = await orchestrator.getJobStatus(job.jobId);
console.log(`Progress: ${status.progress}%`);
```

## Common Patterns

### Multiple Video Layers

```json
{
  "tracks": [
    {
      "actions": [{ "z": 0 }]  // Bottom layer
    },
    {
      "actions": [{ "z": 1 }]  // Middle layer
    },
    {
      "actions": [{ "z": 2 }]  // Top layer
    }
  ]
}
```

### Picture-in-Picture

```json
{
  "actions": [{
    "width": 480,
    "height": 270,
    "x": 1400,
    "y": 780,
    "fit": "contain",
    "z": 1
  }]
}
```

### Audio Fade In/Out

```json
{
  "actions": [{
    "volume": [
      [0, 0],      // Start silent
      [1, 2],      // Fade in over 2s
      [1, 28],     // Hold
      [0, 30]      // Fade out
    ]
  }]
}
```

### Time-based Overlay

```json
{
  "actions": [{
    "start": 5,   // Appear at 5s
    "end": 15,    // Disappear at 15s
    "z": 2
  }]
}
```

## Quality Presets

```typescript
// Ultra quality (CRF 15, slow)
await orchestrator.executeRenderJob(jobId, sueFile);  // Uses project.quality

// Or set quality in project:
project.quality = RenderQuality.ULTRA;  // ULTRA, HIGH, MEDIUM, LOW
```

## Fit Modes

| Mode | Behavior |
|------|----------|
| `fill` | Scale to exact size, ignore aspect ratio |
| `contain` | Fit inside, maintain aspect, add padding |
| `cover` | Fill canvas, maintain aspect, crop excess |
| `none` | No scaling, center position |

## Troubleshooting

**Slow rendering?**
- Reduce quality: `HIGH → MEDIUM → LOW`
- Reduce resolution in .sue file
- Simplify timeline (fewer layers)

**File not found?**
- Use absolute paths in `url` fields
- Verify files exist: `ls -la /path/to/file.mp4`

**Out of memory?**
- Use streaming mode (default in orchestrator)
- Reduce concurrent renders
- Close other applications

## API Reference

### Core Services

```typescript
// Parse .sue file
const manifest = await sueParser.parseFile('/path/to/project.sue');

// Build filtergraph
const filterComplex = filterBuilder.buildFilterComplex(manifest);

// Execute render
const result = await ffmpegRenderer.render(
  'job-id',
  filterComplex,
  '/tmp/output.mp4',
  'HIGH',
  manifest.output.duration,
  (progress) => console.log(`${progress.percentage}%`)
);
```

### Progress Tracking

```typescript
const job = await orchestrator.getJobStatus(jobId);

// job.progress: 0-100
// job.currentPhase: "Parsing", "Rendering", "Uploading", etc.
// job.status: QUEUED, PROCESSING, COMPLETED, FAILED
// job.estimatedTimeRemaining: seconds
```

### Cancellation

```typescript
await orchestrator.cancelJob(jobId, userId);
```

## Environment Variables

```env
S3_BUCKET=your-bucket
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***
MONGODB_URI=mongodb://localhost:27017/video-renderer
```

## Testing

```bash
# Run all tests
pnpm test

# Integration tests only
pnpm test ffmpeg-renderer.integration

# Type checking
pnpm type-check

# Run example
pnpm tsx examples/render-example.ts
```

## Next Steps

1. **Read Full Docs**: `FFMPEG_RENDERER.md` - Complete documentation
2. **Try Example**: `examples/render-example.ts` - Working code sample
3. **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md` - Architecture overview
4. **Integration Tests**: `test/ffmpeg-renderer.integration.spec.ts` - Usage patterns

## Support

- **Documentation**: `FFMPEG_RENDERER.md`
- **Examples**: `examples/` directory
- **Tests**: `test/ffmpeg-renderer.integration.spec.ts`
- **Type Definitions**: `src/render/dto/sue-format.dto.ts`

---

**Quick Links**
- [Full Documentation](FFMPEG_RENDERER.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- [Examples](examples/)
- [Integration Tests](test/ffmpeg-renderer.integration.spec.ts)
