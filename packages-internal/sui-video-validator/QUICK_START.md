# Quick Start Guide

Get started with @stoked-ui/video-validator in 5 minutes.

## Installation

```bash
# Install package
pnpm add @stoked-ui/video-validator

# Install FFmpeg (required)
brew install ffmpeg  # macOS
```

## Basic Usage

### CLI (Recommended for Quick Testing)

```bash
# Single video validation
npx video-validator validate \
  --reference ./my-reference.mp4 \
  --output ./my-rendered.mp4

# With visual diffs
npx video-validator validate \
  --reference ./my-reference.mp4 \
  --output ./my-rendered.mp4 \
  --diff \
  --verbose

# Batch validation
npx video-validator batch \
  --config ./batch-config.json \
  --json ./results.json
```

### Programmatic (TypeScript/JavaScript)

```typescript
import { VideoValidator } from '@stoked-ui/video-validator';

// Create validator
const validator = new VideoValidator({
  frameCount: 8,        // Compare 8 frames
  passThreshold: 0.9,   // 90% match required
  verbose: true,        // Show progress
});

// Run validation
const result = await validator.validate(
  './reference.mp4',
  './output.mp4'
);

// Check result
if (result.passed) {
  console.log('✅ Validation PASSED');
  console.log(`Score: ${result.overallScore * 100}%`);
} else {
  console.log('❌ Validation FAILED');
  console.log(`Score: ${result.overallScore * 100}%`);
  console.log(`Required: ${result.threshold * 100}%`);
}
```

## Common Scenarios

### Scenario 1: Backend Rendering Validation

You have a video editor that renders videos on the backend. You want to validate that rendered videos match the expected output.

```bash
# Run after each render
video-validator validate \
  --reference ./expected/project-123.mp4 \
  --output ./rendered/project-123-$(date +%s).mp4 \
  --threshold 0.95 \
  --json ./validation-reports/project-123.json
```

### Scenario 2: CI/CD Pipeline

Add video validation to your CI/CD pipeline to catch rendering regressions.

```yaml
# .github/workflows/video-test.yml
- name: Validate rendered videos
  run: |
    video-validator batch \
      --config ./tests/validation-config.json \
      --json ./validation-result.json

- name: Upload results
  uses: actions/upload-artifact@v3
  with:
    name: validation-results
    path: validation-result.json
```

### Scenario 3: Visual Debugging

Generate visual diffs to debug rendering differences.

```bash
video-validator validate \
  --reference ./expected.mp4 \
  --output ./rendered.mp4 \
  --diff \
  --output-dir ./debug-output \
  --verbose

# Check debug-output/diff_frame_*.png for visual diffs
```

### Scenario 4: Batch Testing

Test multiple renders at once.

```json
// batch-config.json
{
  "validations": [
    {
      "name": "Project 1",
      "reference": "./ref/project-1.mp4",
      "output": "./out/project-1.mp4"
    },
    {
      "name": "Project 2",
      "reference": "./ref/project-2.mp4",
      "output": "./out/project-2.mp4"
    }
  ],
  "concurrency": 3
}
```

```bash
video-validator batch --config batch-config.json
```

## Configuration Tips

### Frame Count

- **4 frames**: Quick validation, less accurate
- **8 frames**: Balanced (recommended)
- **16 frames**: Thorough validation, slower

### Pass Threshold

- **0.95-1.0**: Very strict, pixel-perfect
- **0.9**: Recommended for most cases
- **0.8-0.85**: Permissive, allows compression artifacts

### Pixel Tolerance

- **0.05**: Strict pixel matching
- **0.1**: Default, handles minor artifacts
- **0.2**: Permissive, for lossy codecs

## Troubleshooting

### Videos don't match but look identical

**Issue:** Match score is low but videos appear the same.

**Solution:** Increase pixel tolerance or lower pass threshold:

```typescript
const validator = new VideoValidator({
  passThreshold: 0.85,
  pixelMatchOptions: {
    threshold: 0.15,
  },
});
```

### Validation is slow

**Issue:** Validation takes too long.

**Solution:** Reduce frame count or use batch with concurrency:

```typescript
const validator = new VideoValidator({
  frameCount: 4,  // Fewer frames
});

// Or use batch validator
const batch = new BatchValidator({}, 5);  // 5 parallel
```

### FFmpeg errors

**Issue:** `spawn ffmpeg ENOENT`

**Solution:** Install FFmpeg and verify:

```bash
ffmpeg -version
```

### Memory issues

**Issue:** `JavaScript heap out of memory`

**Solution:** Increase Node.js memory:

```bash
NODE_OPTIONS="--max-old-space-size=4096" video-validator validate ...
```

## Next Steps

- Read the full [README.md](./README.md) for detailed API documentation
- Check [examples/](./examples/) for more usage patterns
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute

## Support

- GitHub Issues: Report bugs or request features
- Documentation: Full API reference in README.md
- Examples: Real-world usage in examples/ directory
