# FFmpeg Filtergraph-Based Video Renderer

Complete implementation of FFmpeg filtergraph-based video rendering for the `.sue` file format.

## Architecture

This is the **Option A** renderer: fastest, most reliable approach for video/image/audio compositing.

### Key Features

- **FFmpeg Filtergraph**: All video/audio composition done in FFmpeg (no frame-by-frame JS rendering)
- **Streaming Pipeline**: Direct streaming to S3 without temporary frame files
- **Real-time Progress**: FFmpeg stderr parsing for live progress updates
- **Timeline-based**: Parse `.sue` files into deterministic timeline manifests
- **Quality Presets**: ULTRA, HIGH, MEDIUM, LOW (CRF-based)
- **Audio Support**: Volume keyframe interpolation with linear transitions
- **Z-ordering**: Proper layer composition with overlay enable conditions

## Implementation Components

### 1. SueParserService (`src/render/services/sue-parser.service.ts`)

Parses `.sue` JSON files and extracts timeline data.

**Key Methods**:
- `parseFile(filePath)` - Parse .sue file from disk
- `parseProject(sueProject)` - Parse SueProjectDto into TimelineManifest
- `validateTimeline(manifest)` - Validate timeline consistency
- `getTimelineStats(manifest)` - Calculate complexity and statistics

**Timeline Extraction**:
- Extracts all actions from tracks
- Sorts by z-order for proper layering
- Resolves media file paths
- Calculates total duration

### 2. FFmpegFilterBuilderService (`src/render/services/ffmpeg-filter-builder.service.ts`)

Generates FFmpeg filtergraph strings for composition.

**Key Methods**:
- `buildFilterComplex(manifest)` - Build complete filter complex
- `buildFFmpegArgs(filterComplex, outputPath, quality)` - Generate FFmpeg CLI args

**Filter Operations**:
- **Background**: `color=c=COLOR:s=WIDTHxHEIGHT:d=DURATION`
- **Trimming**: `trim=start=X:end=Y,setpts=PTS-STARTPTS`
- **Scaling**: `scale=w:h` with fit mode support (fill, contain, cover, none)
- **Overlay**: `overlay=x:y:enable='between(t,START,END)'`
- **Audio Volume**: `volume=enable='...:volume='...'` with keyframe interpolation
- **Audio Mixing**: `amix=inputs=N:duration=longest`

### 3. VolumeKeyframeProcessorService (`src/render/services/volume-keyframe-processor.service.ts`)

Generates FFmpeg volume filter expressions from keyframe arrays.

**Key Methods**:
- `generateVolumeFilter(keyframes, timeOffset)` - Build volume expression
- `simplifyVolumeFilter(keyframes)` - Optimize constant volumes

**Volume Interpolation**:
- Single keyframe: `volume=VALUE`
- Two keyframes: Linear interpolation `volume=V0 + SLOPE * (t - T0)`
- Multiple keyframes: Piecewise linear with nested `if` statements

### 4. FFmpegRendererService (`src/render/services/ffmpeg-renderer.service.ts`)

Executes FFmpeg and handles progress tracking.

**Key Methods**:
- `render(jobId, filterComplex, outputPath, quality, duration, onProgress)` - Render to file
- `renderToStream(jobId, filterComplex, quality, duration, onProgress)` - Stream output
- `cancelRender(jobId)` - Cancel active render
- `validateFFmpeg()` - Check FFmpeg installation

**Progress Tracking**:
- Parses FFmpeg stderr: `frame=123 fps=30 time=00:00:04.10 speed=1.00x`
- Calculates percentage: `(currentTime / totalDuration) * 100`
- Estimates time remaining: `remainingDuration / processingSpeed`

### 5. RenderOrchestratorService (`src/render/services/render-orchestrator.service.ts`)

Orchestrates the complete rendering pipeline.

**Rendering Phases**:
1. **Parse** (5%): Parse .sue file into timeline manifest
2. **Build** (10%): Generate FFmpeg filtergraph
3. **Render** (15-85%): Execute FFmpeg with progress updates
4. **Upload** (90%): Stream to S3
5. **Cleanup** (95%): Delete temporary files

**Methods**:
- `createProjectFromSue(sueFilePath, userId)` - Create project from .sue file
- `executeRenderJob(jobId, sueFilePath)` - Execute render (write to disk first)
- `executeRenderJobStreaming(jobId, sueFilePath)` - Stream directly to S3

## .sue File Format

Example `.sue` JSON structure:

```json
{
  "id": "project-id",
  "name": "My Video Project",
  "version": 2,
  "filesMeta": [
    {"size": 12353921, "name": "video.mp4", "type": "video/mp4"},
    {"size": 5432100, "name": "audio.mp3", "type": "audio/mp3"}
  ],
  "tracks": [
    {
      "controllerName": "video",
      "fileId": "mediafile-001",
      "id": "track-001",
      "name": "Main Video",
      "url": "/absolute/path/to/video.mp4",
      "actions": [
        {
          "name": "clip-1",
          "start": 0,
          "end": 15.3,
          "trimStart": 1.0,
          "z": 0,
          "fit": "fill",
          "blendMode": "normal",
          "loop": 0,
          "duration": 16.975,
          "width": 1280,
          "height": 720
        }
      ]
    },
    {
      "controllerName": "audio",
      "fileId": "mediafile-002",
      "id": "track-002",
      "name": "Background Music",
      "url": "/absolute/path/to/audio.mp3",
      "actions": [
        {
          "name": "audio-1",
          "start": 5.0,
          "end": 20.0,
          "trimStart": 0,
          "volume": [[0, 5.0], [0.8, 10.0], [0, 20.0]],
          "z": 0
        }
      ]
    }
  ],
  "backgroundColor": "#000000",
  "width": 1920,
  "height": 1080,
  "frameRate": 30,
  "duration": 20
}
```

## Timeline Item Properties

| Property | Type | Description |
|----------|------|-------------|
| `start` | number | Start time in output timeline (seconds) |
| `end` | number | End time in output timeline (seconds) |
| `trimStart` | number | Trim start time in source media (seconds) |
| `z` | number | Layer z-order (higher = on top) |
| `fit` | enum | Scaling mode: `fill`, `contain`, `cover`, `none` |
| `volume` | array | Volume keyframes: `[[value, time], ...]` |
| `loop` | number | Loop count (0 = no loop) |
| `width` | number | Output width (optional, defaults to canvas) |
| `height` | number | Output height (optional, defaults to canvas) |
| `x` | number | X position in canvas (optional, default: 0) |
| `y` | number | Y position in canvas (optional, default: 0) |

## Fit Modes

FFmpeg implementation for each fit mode:

### `fill` (Default)
Scale to exact dimensions, ignore aspect ratio:
```
scale=WIDTH:HEIGHT
```

### `contain`
Scale to fit inside, maintain aspect ratio, add padding:
```
scale=WIDTH:HEIGHT:force_original_aspect_ratio=decrease,
pad=WIDTH:HEIGHT:(ow-iw)/2:(oh-ih)/2
```

### `cover`
Scale to cover output, maintain aspect ratio, crop excess:
```
scale=WIDTH:HEIGHT:force_original_aspect_ratio=increase,
crop=WIDTH:HEIGHT
```

### `none`
No scaling, center position:
```
pad=WIDTH:HEIGHT:(ow-iw)/2:(oh-ih)/2
```

## Volume Keyframes

Volume keyframes define audio volume over time with linear interpolation.

**Format**: `[[value, timestamp], [value, timestamp], ...]`
- `value`: 0-1 (or higher for amplification)
- `timestamp`: Seconds in timeline

**Examples**:

Fade in over 5 seconds:
```json
[[0, 0], [1, 5]]
```

Fade in, hold, fade out:
```json
[[0, 0], [1, 5], [1, 15], [0, 20]]
```

Constant volume:
```json
[[0.8, 0], [0.8, 20]]
```

**FFmpeg Generation**:
- Single keyframe: `volume=0.8`
- Two keyframes: `volume=0 + 0.2 * (t - 0)` (linear interpolation)
- Multiple: Piecewise linear with nested `if` expressions

## Quality Presets

| Quality | CRF | Preset | Use Case |
|---------|-----|--------|----------|
| ULTRA   | 15  | slow   | Maximum quality, archival |
| HIGH    | 18  | medium | Production quality (default) |
| MEDIUM  | 23  | fast   | Web delivery, faster encoding |
| LOW     | 28  | veryfast | Preview, quick drafts |

**Encoding Settings**:
- Codec: `libx264`
- Pixel format: `yuv420p`
- Audio: `aac @ 192k, 48kHz`

## Example FFmpeg Commands

### Simple Video Composition
```bash
ffmpeg \
  -i video.mp4 \
  -filter_complex "
    color=c=black:s=1920x1080:d=15:r=30[bg];
    [0:v]trim=start=1:end=16,setpts=PTS-STARTPTS,
    scale=1920:1080[v0];
    [bg][v0]overlay=enable='between(t,0,15)'[vout]
  " \
  -map "[vout]" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -y output.mp4
```

### Multi-layer with Audio
```bash
ffmpeg \
  -i video1.mp4 -i video2.mp4 -i audio.mp3 \
  -filter_complex "
    color=c=#FF0000:s=1920x1080:d=20:r=30[bg];

    [0:v]trim=start=0:end=10,setpts=PTS-STARTPTS,
    scale=1920:1080[v0];
    [bg][v0]overlay=enable='between(t,0,10)'[bg1];

    [1:v]trim=start=0:end=15,setpts=PTS-STARTPTS,
    scale=1920:1080:force_original_aspect_ratio=decrease,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2[v1];
    [bg1][v1]overlay=enable='between(t,5,20)'[vout];

    [2:a]atrim=start=0:end=20,asetpts=PTS-STARTPTS,
    volume=enable='between(t,0,20)':volume='0 + 0.05 * (t - 0)'[aout]
  " \
  -map "[vout]" -map "[aout]" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 48000 \
  -y output.mp4
```

## Usage Examples

### Basic Render

```typescript
import { RenderOrchestratorService } from './render/services';

// Parse and create project
const project = await orchestrator.createProjectFromSue(
  '/path/to/project.sue',
  'user-123'
);

// Create render job
const jobResponse = await orchestrator.createRenderJob({
  projectId: project.projectId,
  userId: 'user-123',
  priority: 5,
});

// Execute render
await orchestrator.executeRenderJob(
  jobResponse.jobId,
  '/path/to/project.sue'
);

// Check status
const status = await orchestrator.getJobStatus(jobResponse.jobId);
console.log(`Progress: ${status.progress}%`);
```

### Streaming Render

```typescript
// Execute with streaming upload (no temp file)
await orchestrator.executeRenderJobStreaming(
  jobId,
  '/path/to/project.sue'
);
```

### Direct Service Usage

```typescript
import {
  SueParserService,
  FFmpegFilterBuilderService,
  FFmpegRendererService,
} from './render/services';

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
  (progress) => {
    console.log(`${progress.percentage.toFixed(1)}% @ ${progress.fps} fps`);
  }
);

if (result.success) {
  console.log('Render completed:', result.output);
} else {
  console.error('Render failed:', result.error);
}
```

## Performance Characteristics

### Speed
- **No frame-by-frame rendering**: FFmpeg handles all composition
- **Hardware acceleration**: Use `-hwaccel auto` for GPU support
- **Streaming**: No disk I/O for intermediate frames
- **Typical speed**: 0.5x - 2x realtime (depending on complexity)

### Resource Usage
- **Memory**: ~200MB base + input file buffers
- **CPU**: Scales with complexity and quality preset
- **Disk**: Only temp output file (or none with streaming)
- **Network**: Direct S3 streaming support

### Complexity Factors
- Video layer count (each overlay adds ~10-20% overhead)
- Audio track count (mixing adds ~5% overhead)
- Output duration (linear scaling)
- Quality preset (ULTRA ~3x slower than LOW)

## Error Handling

Common FFmpeg errors and solutions:

### "No such file or directory"
- **Cause**: Invalid media file path
- **Solution**: Validate all media files exist before rendering

### "Invalid data found when processing input"
- **Cause**: Corrupted media file
- **Solution**: Validate media file integrity

### "Filtergraph description invalid"
- **Cause**: Syntax error in filter complex
- **Solution**: Check timeline item properties, validate filtergraph generation

### "Conversion failed"
- **Cause**: Codec/format incompatibility
- **Solution**: Use compatible codecs, check FFmpeg build

## Testing

Run integration tests:

```bash
# Run all tests
pnpm test

# Run integration tests only
pnpm test ffmpeg-renderer.integration

# Run with coverage
pnpm test:coverage
```

**Test Coverage**:
- SueParser: Timeline parsing, validation, statistics
- VolumeKeyframeProcessor: Keyframe interpolation, edge cases
- FFmpegFilterBuilder: Filtergraph generation, quality presets
- FFmpegRenderer: Command generation, progress parsing

## Production Deployment

### Requirements
- FFmpeg 4.4+ installed on server
- S3 bucket with write permissions
- MongoDB for job tracking
- Redis for job queue (optional)

### Environment Variables
```env
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
MONGODB_URI=mongodb://localhost:27017/video-renderer
```

### Docker Setup
```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Copy application
COPY . /app
WORKDIR /app

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build application
RUN pnpm build

CMD ["pnpm", "start:prod"]
```

## Future Enhancements

### Phase 1 (Current)
- ✅ Video/image/audio composition
- ✅ Volume keyframe interpolation
- ✅ Z-ordering and time-based activation
- ✅ Quality presets
- ✅ S3 streaming upload

### Phase 2 (Planned)
- Text rendering with custom fonts
- Blend modes (multiply, screen, overlay)
- Transitions (fade, wipe, dissolve)
- Effects (blur, color correction, filters)
- Advanced audio (equalization, compression)

### Phase 3 (Future)
- GPU acceleration (NVENC, QuickSync)
- Distributed rendering (split timeline into chunks)
- Real-time preview generation
- Adaptive bitrate encoding
- WebM/VP9 support

## Troubleshooting

### Slow Rendering
1. Check complexity score: `manifest.getTimelineStats().complexity`
2. Reduce quality preset: HIGH → MEDIUM → LOW
3. Reduce output resolution
4. Enable hardware acceleration

### Out of Memory
1. Reduce concurrent renders
2. Use streaming upload (no temp file)
3. Increase system swap space
4. Process shorter segments

### Incorrect Output
1. Validate timeline: `sueParser.validateTimeline(manifest)`
2. Check filtergraph: `console.log(filterComplex.filterGraph)`
3. Run FFmpeg command manually to debug
4. Verify media file compatibility

## License

UNLICENSED - Stoked Consulting
