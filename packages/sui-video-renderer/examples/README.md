# FFmpeg Renderer Examples

Example usage of the FFmpeg filtergraph-based video renderer.

## Files

- **`sample-project.sue.json`** - Example .sue project file with multiple tracks
- **`render-example.ts`** - Complete rendering workflow example
- **`output/`** - Rendered video output directory (created automatically)

## Sample Project Structure

The `sample-project.sue.json` demonstrates:

1. **Background Video** (z=0)
   - Full screen, cover fit mode
   - 30 seconds duration
   - Trimmed from source video at 5.5s

2. **Logo Overlay** (z=2)
   - PNG image, top layer
   - 400x200px, positioned at (760, 100)
   - Visible for first 3 seconds

3. **Picture-in-Picture** (z=1)
   - Small video overlay
   - 480x270px, bottom-right corner
   - Visible from 10s to 25s

4. **Background Music** (z=0)
   - Audio track with volume keyframes
   - Fade in: 0 → 0.6 over 2s
   - Hold at 0.6 from 2s to 25s
   - Fade out: 0.6 → 0 from 25s to 30s

## Running the Example

### Prerequisites

1. Install FFmpeg 4.4+:
   ```bash
   # macOS
   brew install ffmpeg

   # Ubuntu/Debian
   sudo apt install ffmpeg

   # Windows
   choco install ffmpeg
   ```

2. Prepare media files (update paths in `sample-project.sue.json`):
   - `/path/to/main-video.mp4` - Background video
   - `/path/to/overlay-video.mp4` - PiP video
   - `/path/to/background-music.mp3` - Audio track
   - `/path/to/intro-logo.png` - Logo image

### Execute Render

```bash
# From package root
cd /Users/stoked/work/v3/packages/video-renderer

# Run example
pnpm tsx examples/render-example.ts

# With debug output (shows filtergraph)
DEBUG=1 pnpm tsx examples/render-example.ts
```

### Expected Output

```
Checking FFmpeg installation...
✓ FFmpeg 4.4.2 detected

Parsing examples/sample-project.sue.json...
✓ Parsed timeline with 4 items

Validating timeline...
✓ Timeline validation passed

Timeline Statistics:
  - Total items: 4
  - Duration: 30s
  - Media files: 4
  - Has video: true
  - Has audio: true
  - Complexity: 45.0%

Building FFmpeg filtergraph...
✓ Built filter with 4 inputs

Starting render (Quality: HIGH)...

[45.2%] Frame: 407 | FPS: 28.3 | Speed: 1.15x | Elapsed: 12.8s | ETA: 10.2s

✓ Render completed successfully!
  - Output: examples/output/rendered-video.mp4
  - Total time: 23.5s
  - Total frames: 900
  - Average FPS: 38.3

Example completed successfully!
```

## Customizing the Example

### Change Quality Preset

Edit `render-example.ts`:
```typescript
const quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA' = 'ULTRA';
```

### Modify Timeline

Edit `sample-project.sue.json`:
```json
{
  "tracks": [
    {
      "actions": [
        {
          "start": 0,     // Change timing
          "end": 10,
          "trimStart": 0,
          "z": 0,         // Change layer order
          "fit": "cover"  // Change fit mode
        }
      ]
    }
  ]
}
```

### Add Custom Volume Curves

Modify audio action volume keyframes:
```json
{
  "volume": [
    [0, 0],      // Start at 0 volume at 0s
    [1, 3],      // Ramp to full volume at 3s
    [1, 27],     // Hold at full volume
    [0, 30]      // Fade out to 0 at 30s
  ]
}
```

## Integration with NestJS

For production usage, use the `RenderOrchestratorService`:

```typescript
import { Injectable } from '@nestjs/common';
import { RenderOrchestratorService } from './render/services';

@Injectable()
export class VideoService {
  constructor(
    private readonly orchestrator: RenderOrchestratorService,
  ) {}

  async renderVideo(userId: string, sueFilePath: string) {
    // Create project
    const project = await this.orchestrator.createProjectFromSue(
      sueFilePath,
      userId,
    );

    // Create render job
    const job = await this.orchestrator.createRenderJob({
      projectId: project.projectId,
      userId,
      priority: 5,
    });

    // Execute render (background job)
    await this.orchestrator.executeRenderJobStreaming(
      job.jobId,
      sueFilePath,
    );

    return job;
  }

  async getProgress(jobId: string) {
    return await this.orchestrator.getJobStatus(jobId);
  }
}
```

## Troubleshooting

### "FFmpeg not installed"
Install FFmpeg 4.4+ from your package manager.

### "Media file not found"
Update file paths in `sample-project.sue.json` to point to actual media files.

### Slow rendering
- Reduce quality: `HIGH` → `MEDIUM` or `LOW`
- Reduce output resolution in `.sue` file
- Reduce video duration or complexity

### Out of memory
- Close other applications
- Reduce concurrent renders
- Use streaming mode (already enabled in example)

## Next Steps

1. Read the full documentation: `../FFMPEG_RENDERER.md`
2. Run integration tests: `pnpm test ffmpeg-renderer.integration`
3. Explore the service implementations: `../src/render/services/`
4. Try modifying the sample project with your own media files
