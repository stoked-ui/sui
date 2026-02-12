---
productId: video-validator
title: CLI Usage
githubLabel: 'CLI Usage'
packageName: '@stoked-ui/video-validator'
---

# CLI Usage

<p class="description">Command-line interface for running video validation tests.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Installation

Install globally or use via npx:

```bash
# Global install
npm install -g @stoked-ui/video-validator

# Or use npx
npx @stoked-ui/video-validator validate
```

## Commands

### validate

Compare a test video against a reference video.

```bash
video-validator validate \
  --reference ./reference/output.mp4 \
  --test ./test/output.mp4 \
  --threshold 0.1 \
  --frame-interval 1000
```

**Options:**

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--reference` | `-r` | — | Path to reference video |
| `--test` | `-t` | — | Path to test video |
| `--threshold` | `-T` | `0.1` | Pixel match threshold (0-1) |
| `--frame-interval` | `-i` | `1000` | Frame extraction interval in ms |
| `--output` | `-o` | `./report` | Output directory for reports |
| `--format` | `-f` | `html` | Report format: html, json, or both |

### batch

Validate multiple video pairs from a config file.

```bash
video-validator batch --config ./validation.config.json
```

**Config file format:**

```json
{
  "pairs": [
    {
      "name": "test-scene-1",
      "reference": "./reference/scene1.mp4",
      "test": "./output/scene1.mp4"
    },
    {
      "name": "test-scene-2",
      "reference": "./reference/scene2.mp4",
      "test": "./output/scene2.mp4"
    }
  ],
  "threshold": 0.1,
  "frameInterval": 500,
  "outputDir": "./reports"
}
```

### extract

Extract frames from a video file for manual inspection.

```bash
video-validator extract \
  --input ./video.mp4 \
  --output ./frames \
  --interval 1000
```

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | All validations passed |
| `1` | One or more validations failed |
| `2` | Configuration or runtime error |

## CI/CD integration

Use the JSON output format for machine-readable results:

```bash
video-validator validate -r ref.mp4 -t test.mp4 -f json -o results.json

# Check result in CI
if [ $? -ne 0 ]; then
  echo "Video validation failed"
  exit 1
fi
```
