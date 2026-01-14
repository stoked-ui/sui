# @stoked-ui/video-validator

Comprehensive video rendering validation test harness with frame-by-frame pixel comparison.

## Features

- **Frame Extraction**: Extract evenly spaced frames from videos using FFmpeg
- **Pixel-Perfect Comparison**: Compare frames pixel-by-pixel with configurable tolerance
- **Match Scoring**: Calculate match scores (0.0 - 1.0) with pass/fail thresholds
- **Visual Diffs**: Generate diff images highlighting pixel differences
- **Batch Validation**: Validate multiple video pairs with parallel execution
- **Multiple Output Formats**: JSON, Markdown, and human-readable text reports
- **CLI Interface**: Easy-to-use command-line tool for CI/CD integration
- **TypeScript Support**: Full type definitions included

## Installation

```bash
pnpm add @stoked-ui/video-validator
```

### System Requirements

- Node.js >= 18.0.0
- FFmpeg installed and accessible in PATH

**Install FFmpeg:**

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
choco install ffmpeg
```

## Quick Start

### CLI Usage

```bash
# Single validation
video-validator validate \
  --reference ./reference.mp4 \
  --output ./rendered.mp4 \
  --frames 8 \
  --threshold 0.9 \
  --diff \
  --verbose

# Batch validation
video-validator batch \
  --config ./batch-config.json \
  --json ./results.json

# Generate CI summary
video-validator ci-summary --json ./results.json
```

### Programmatic Usage

```typescript
import { VideoValidator, Reporter } from '@stoked-ui/video-validator';

const validator = new VideoValidator({
  frameCount: 8,
  passThreshold: 0.9,
  generateDiffs: true,
  verbose: true,
});

const result = await validator.validate(
  './reference-video.mp4',
  './output-video.mp4',
);

console.log(`Result: ${result.passed ? 'PASSED' : 'FAILED'}`);
console.log(`Score: ${(result.overallScore * 100).toFixed(2)}%`);

// Generate report
const report = Reporter.generateTextReport(result);
console.log(report);
```

## Configuration

### ValidationConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `frameCount` | number | 8 | Number of frames to extract and compare |
| `passThreshold` | number | 0.9 | Pass threshold (0.0 - 1.0) |
| `pixelMatchOptions.threshold` | number | 0.1 | Pixel difference tolerance (0.0 - 1.0) |
| `pixelMatchOptions.includeAA` | boolean | true | Include antialiasing detection |
| `pixelMatchOptions.alpha` | number | 0.1 | Alpha channel threshold |
| `pixelMatchOptions.diffColor` | [r,g,b,a] | [255,0,0,255] | Diff highlight color |
| `generateDiffs` | boolean | false | Generate visual diff images |
| `outputDir` | string | './validation-output' | Output directory for reports |
| `verbose` | boolean | false | Enable verbose logging |

### Pixel Match Tolerance

The `threshold` option controls how strict the pixel comparison is:

- **0.0**: Exact pixel match required (very strict)
- **0.1**: Default - allows minor compression artifacts
- **0.2**: More permissive - suitable for lossy video codecs
- **0.5**: Very permissive - only major differences detected

## Validation Process

1. **Extract Frames**: Extract 8 frames evenly spaced throughout video duration
   - Frames are extracted from 5%-95% of video duration to avoid fade in/out
   - Timestamps calculated as: `startTime + interval * frameNumber`

2. **Compare Frames**: Compare corresponding frames pixel-by-pixel
   - Uses `pixelmatch` algorithm for perceptual difference detection
   - Accounts for antialiasing and compression artifacts
   - Generates match score: `1 - (differentPixels / totalPixels)`

3. **Calculate Overall Score**: Average all frame match scores
   - `overallScore = sum(frameScores) / frameCount`
   - Validation passes if: `overallScore >= passThreshold`

4. **Generate Reports**: Output results in multiple formats
   - Text report with detailed statistics
   - JSON for CI/CD integration
   - Markdown for documentation
   - Visual diff images (optional)

## Batch Validation

Create a batch configuration file:

```json
{
  "validations": [
    {
      "name": "Home Page",
      "reference": "./reference/home.mp4",
      "output": "./output/home-rendered.mp4"
    },
    {
      "name": "Product Demo",
      "reference": "./reference/demo.mp4",
      "output": "./output/demo-rendered.mp4"
    }
  ],
  "config": {
    "frameCount": 8,
    "passThreshold": 0.9,
    "generateDiffs": true
  },
  "concurrency": 3
}
```

Run batch validation:

```bash
video-validator batch --config ./batch-config.json --json ./batch-results.json
```

## CLI Commands

### validate

Validate a single video pair.

```bash
video-validator validate [options]
```

**Options:**
- `-r, --reference <path>`: Reference video path (required)
- `-o, --output <path>`: Output video path (required)
- `-f, --frames <number>`: Number of frames to compare (default: 8)
- `-t, --threshold <number>`: Pass threshold 0.0-1.0 (default: 0.9)
- `-d, --diff`: Generate visual diff images
- `--output-dir <path>`: Output directory (default: ./validation-output)
- `--tolerance <number>`: Pixel tolerance 0.0-1.0 (default: 0.1)
- `-v, --verbose`: Verbose logging
- `--json <path>`: Output JSON report to file
- `--markdown <path>`: Output Markdown report to file

### batch

Run batch validation from config file.

```bash
video-validator batch [options]
```

**Options:**
- `-c, --config <path>`: Batch configuration JSON file (required)
- `-f, --frames <number>`: Number of frames (default: 8)
- `-t, --threshold <number>`: Pass threshold (default: 0.9)
- `-d, --diff`: Generate visual diff images
- `--output-dir <path>`: Output directory
- `--concurrency <number>`: Parallel execution limit (default: 3)
- `-v, --verbose`: Verbose logging
- `--json <path>`: Output JSON report

### ci-summary

Generate CI/CD-friendly summary.

```bash
video-validator ci-summary --json <path>
```

**Output format:**
```
passed=1 score=94.52 threshold=90.00
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Video Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install FFmpeg
        run: sudo apt-get install -y ffmpeg

      - name: Install dependencies
        run: pnpm install

      - name: Run video validation
        run: |
          pnpm video-validator validate \
            --reference ./tests/fixtures/reference.mp4 \
            --output ./tests/output/rendered.mp4 \
            --json ./validation-result.json \
            --verbose

      - name: Upload validation report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: validation-report
          path: validation-result.json
```

### GitLab CI

```yaml
video_validation:
  stage: test
  image: jrottenberg/ffmpeg:latest
  script:
    - npm install -g pnpm
    - pnpm install
    - pnpm video-validator validate
        --reference ./reference.mp4
        --output ./rendered.mp4
        --json ./validation-result.json
  artifacts:
    reports:
      junit: validation-result.json
    paths:
      - validation-result.json
```

## Output Formats

### Text Report

```
════════════════════════════════════════════════════════════════════════════════
VIDEO VALIDATION REPORT
════════════════════════════════════════════════════════════════════════════════

Reference Video: ./reference.mp4
Output Video:    ./rendered.mp4
Timestamp:       2025-01-13T10:30:00.000Z
Duration:        2.45s

────────────────────────────────────────────────────────────────────────────────
OVERALL RESULT
────────────────────────────────────────────────────────────────────────────────
Status:          ✓ PASSED
Overall Score:   94.52%
Pass Threshold:  90.00%

────────────────────────────────────────────────────────────────────────────────
FRAME COMPARISON DETAILS
────────────────────────────────────────────────────────────────────────────────
Frame  1 ✓ 96.45% (72,853 diff pixels, 3.5523%)
Frame  2 ✓ 95.82% (85,632 diff pixels, 4.1783%)
...
```

### JSON Report

```json
{
  "referenceVideo": "./reference.mp4",
  "outputVideo": "./rendered.mp4",
  "frameResults": [
    {
      "referenceFrame": {
        "frameNumber": 0,
        "timestamp": 0.5,
        "path": "./temp/ref_frame_000.png",
        "width": 1920,
        "height": 1080
      },
      "outputFrame": { ... },
      "matchScore": 0.9645,
      "differentPixels": 72853,
      "totalPixels": 2073600,
      "differencePercentage": 3.5523
    }
  ],
  "overallScore": 0.9452,
  "passed": true,
  "threshold": 0.9,
  "timestamp": "2025-01-13T10:30:00.000Z",
  "duration": 2450
}
```

## Examples

See `examples/` directory for complete usage examples:

- `usage-example.ts`: Programmatic API examples
- `batch-config.json`: Batch validation configuration

## API Reference

### VideoValidator

```typescript
class VideoValidator {
  constructor(config?: Partial<ValidationConfig>);
  validate(referenceVideo: string, outputVideo: string): Promise<ValidationResult>;
}
```

### BatchValidator

```typescript
class BatchValidator {
  constructor(config?: Partial<ValidationConfig>, concurrency?: number);
  validateBatch(config: BatchValidationConfig): Promise<BatchValidationResult>;
}
```

### Reporter

```typescript
class Reporter {
  static generateJSON(result: ValidationResult, outputPath: string): Promise<void>;
  static generateBatchJSON(result: BatchValidationResult, outputPath: string): Promise<void>;
  static generateTextReport(result: ValidationResult): string;
  static generateBatchTextReport(result: BatchValidationResult): string;
  static generateMarkdownReport(result: ValidationResult): string;
  static generateCISummary(result: ValidationResult | BatchValidationResult): string;
}
```

## Troubleshooting

### FFmpeg Not Found

**Error:** `spawn ffmpeg ENOENT`

**Solution:** Install FFmpeg and ensure it's in your PATH:
```bash
# Verify installation
ffmpeg -version
```

### Frame Extraction Fails

**Error:** `Frame extraction failed`

**Solution:** Check video codec compatibility:
```bash
ffprobe -v error -show_entries stream=codec_name video.mp4
```

### Memory Issues

**Error:** `JavaScript heap out of memory`

**Solution:** Reduce frame count or increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" video-validator validate ...
```

## License

MIT

## Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## Support

- Issues: https://github.com/stoked-ui/sui/issues
- Documentation: https://stoked-ui.com/video-validator
