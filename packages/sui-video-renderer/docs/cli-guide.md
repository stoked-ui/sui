# CLI Guide

Command-line interface for rendering video projects from `.sue` project files.

## Table of Contents

- [Installation](#installation)
- [Commands](#commands)
- [Flags and Options](#flags-and-options)
- [Quality Presets](#quality-presets)
- [Examples](#examples)
- [Audio Mixing](#audio-mixing)
- [Project File Format](#project-file-format)

## Installation

### From Source

Build and install the CLI from source:

```bash
cd packages/sui-video-renderer/cli
cargo install --path .
```

This installs the `video-render` binary to your cargo bin directory (typically `~/.cargo/bin`).

### Verify Installation

```bash
video-render --version
```

## Commands

### `render`

Render a project to video file.

**Syntax:**
```bash
video-render render [OPTIONS] --input <FILE> --output <FILE>
```

**Required Options:**
- `--input <FILE>`, `-i <FILE>` - Path to `.sue` project file
- `--output <FILE>`, `-o <FILE>` - Output video file path

**Optional Flags:**
- `--quality <PRESET>`, `-q <PRESET>` - Quality preset (default: `high`)
- `--codec <CODEC>`, `-c <CODEC>` - Video codec (default: `h264`)
- `--format <FORMAT>`, `-f <FORMAT>` - Container format (default: `mp4`)
- `--resolution <WxH>`, `-r <WxH>` - Output resolution (e.g., `1920x1080`)
- `--fps <NUMBER>` - Frames per second (default: `30.0`)
- `--threads <NUMBER>`, `-t <NUMBER>` - Worker threads (default: auto-detect)
- `--progress <MODE>`, `-p <MODE>` - Progress mode: `text` or `json` (default: `text`)

### `info`

Display project information without rendering.

**Syntax:**
```bash
video-render info --input <FILE>
```

**Options:**
- `--input <FILE>`, `-i <FILE>` - Path to `.sue` project file

**Example Output:**
```
Project Information
==================
Title: My Video Project
Duration: 30.5s (915 frames at 30 fps)
Resolution: 1920x1080
Layers: 12
  - 4 video layers
  - 3 image layers
  - 2 text layers
  - 3 solid color layers
Effects: 8 total
  - 3 blur effects
  - 2 shadows
  - 3 color adjustments
Audio tracks: 2
```

## Flags and Options

### `--input` / `-i`

Path to the input `.sue` project file.

**Example:**
```bash
video-render render -i project.sue -o output.mp4
```

### `--output` / `-o`

Path for the output video file. File extension determines container format if `--format` is not specified.

**Supported Extensions:**
- `.mp4` - MP4 container (H.264/H.265)
- `.webm` - WebM container (VP9)
- `.mov` - QuickTime container (H.264/H.265)

**Example:**
```bash
video-render render -i project.sue -o my-video.mp4
```

### `--quality` / `-q`

Video quality preset. See [Quality Presets](#quality-presets) for details.

**Values:** `low`, `medium`, `high`, `lossless`

**Example:**
```bash
video-render render -i project.sue -o output.mp4 -q lossless
```

### `--codec` / `-c`

Video codec to use for encoding.

**Values:**
- `h264` - H.264/AVC (widely compatible, good compression)
- `h265` - H.265/HEVC (better compression, requires newer players)
- `vp9` - VP9 (open format, good for web)

**Example:**
```bash
video-render render -i project.sue -o output.mp4 -c h265
```

### `--format` / `-f`

Container format for the output file.

**Values:**
- `mp4` - MPEG-4 Part 14 container
- `webm` - WebM container
- `mov` - QuickTime File Format

**Example:**
```bash
video-render render -i project.sue -o output.mp4 -f mp4
```

### `--resolution` / `-r`

Override the project's output resolution.

**Format:** `WIDTHxHEIGHT` (e.g., `1920x1080`, `3840x2160`)

**Example:**
```bash
# Render at 4K even if project is 1080p
video-render render -i project.sue -o output.mp4 -r 3840x2160
```

### `--fps`

Override the project's frames per second.

**Example:**
```bash
# Render at 60 fps
video-render render -i project.sue -o output.mp4 --fps 60
```

### `--threads` / `-t`

Number of worker threads for parallel rendering.

**Values:**
- `0` - Auto-detect based on available CPU cores (default)
- `1+` - Specific number of threads

**Example:**
```bash
# Use 8 threads
video-render render -i project.sue -o output.mp4 -t 8
```

**Performance Note:** More threads ≠ always faster. Optimal thread count is typically:
- Number of physical CPU cores, OR
- Number of physical cores - 1 (to leave resources for OS)

### `--progress` / `-p`

Progress reporting format.

**Values:**
- `text` - Human-readable progress bar (default)
- `json` - Machine-readable JSON output

**Text Mode:**
```
Rendering: ████████████░░░░░░░░ 60% (180/300 frames) [ETA: 00:45]
```

**JSON Mode:**
```json
{"frame":180,"total":300,"percent":60,"fps":6.2,"eta_seconds":45}
```

**Example:**
```bash
# JSON output for parsing
video-render render -i project.sue -o output.mp4 -p json
```

## Quality Presets

Quality presets control the video bitrate and encoding settings using CRF (Constant Rate Factor) values.

### Preset Comparison

| Preset | CRF (H.264) | CRF (H.265) | CRF (VP9) | Bitrate (1080p) | Use Case |
|--------|-------------|-------------|-----------|-----------------|----------|
| `low` | 28 | 32 | 40 | ~2 Mbps | Web previews, drafts |
| `medium` | 23 | 28 | 35 | ~5 Mbps | Standard web delivery |
| `high` | 18 | 24 | 30 | ~12 Mbps | High-quality delivery |
| `lossless` | 0 | 0 | 0 | ~50+ Mbps | Archival, editing |

### CRF Values Explained

**Lower CRF = Higher Quality + Larger File**
- 0 = Lossless (huge files)
- 18 = Visually lossless (recommended for high quality)
- 23 = High quality (recommended for general use)
- 28 = Medium quality
- 32+ = Low quality (noticeable compression artifacts)

### Choosing a Preset

**Use `low` for:**
- Quick previews
- Draft renders
- Bandwidth-constrained situations

**Use `medium` for:**
- Web delivery
- Social media uploads
- General distribution

**Use `high` for:**
- Professional delivery
- Client presentations
- When quality is critical

**Use `lossless` for:**
- Archival purposes
- Further editing/compositing
- Master copies

## Examples

### Basic Rendering

Render with default settings (high quality, H.264, MP4):

```bash
video-render render -i project.sue -o output.mp4
```

### High-Quality 4K Render

```bash
video-render render \
  -i project.sue \
  -o output_4k.mp4 \
  -r 3840x2160 \
  -q high \
  -c h265 \
  --fps 60
```

### Web-Optimized Output

```bash
video-render render \
  -i project.sue \
  -o output.webm \
  -f webm \
  -c vp9 \
  -q medium \
  -r 1920x1080
```

### Lossless Master

```bash
video-render render \
  -i project.sue \
  -o master.mov \
  -f mov \
  -q lossless \
  -c h264
```

### Multi-threaded Rendering

```bash
# Use 16 threads for faster rendering
video-render render \
  -i project.sue \
  -o output.mp4 \
  -t 16 \
  -p text
```

### JSON Progress for Integration

```bash
# Pipe JSON progress to a parser
video-render render \
  -i project.sue \
  -o output.mp4 \
  -p json | jq '.percent'
```

### Batch Processing

```bash
#!/bin/bash
# Render multiple projects

for project in projects/*.sue; do
  output="renders/$(basename "$project" .sue).mp4"
  echo "Rendering: $project -> $output"

  video-render render \
    -i "$project" \
    -o "$output" \
    -q high \
    -t 8
done
```

### Different Quality Versions

```bash
#!/bin/bash
# Render low, medium, and high quality versions

PROJECT="project.sue"

# Low quality for preview
video-render render -i "$PROJECT" -o "output_low.mp4" -q low

# Medium quality for web
video-render render -i "$PROJECT" -o "output_web.mp4" -q medium

# High quality for download
video-render render -i "$PROJECT" -o "output_high.mp4" -q high
```

## Audio Mixing

The CLI supports audio mixing from the project's audio tracks.

### Audio Configuration in .sue Files

```json
{
  "timeline": {
    "audioTracks": [
      {
        "id": "track1",
        "source": "music.mp3",
        "startMs": 0,
        "endMs": 30000,
        "volume": 0.8,
        "fadeIn": 1000,
        "fadeOut": 2000
      },
      {
        "id": "track2",
        "source": "voiceover.wav",
        "startMs": 5000,
        "endMs": 25000,
        "volume": 1.0
      }
    ]
  }
}
```

### Audio Features

**Supported:**
- Multiple audio tracks
- Volume control per track
- Fade in/out
- Start/end time trimming
- Mixing to stereo or mono

**Audio Formats:**
- MP3
- WAV
- AAC
- OGG
- FLAC

### Audio Mixing Example

```bash
# Render with audio from project
video-render render \
  -i project_with_audio.sue \
  -o output_with_audio.mp4 \
  -c h264 \
  -q high
```

The audio is automatically mixed according to the project configuration. No additional flags are needed.

## Project File Format

The `.sue` file format is a JSON-based project file containing timeline, layers, and composition data.

### Basic Structure

```json
{
  "version": "1.0",
  "project": {
    "title": "My Video Project",
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "durationMs": 30000
  },
  "timeline": {
    "layers": [
      {
        "id": "layer1",
        "type": "video",
        "source": "footage.mp4",
        "startMs": 0,
        "endMs": 10000,
        "transform": {
          "x": 0,
          "y": 0,
          "scaleX": 1.0,
          "scaleY": 1.0,
          "rotation": 0,
          "opacity": 1.0
        },
        "enabled": true,
        "zIndex": 0
      },
      {
        "id": "layer2",
        "type": "text",
        "text": "Hello World",
        "fontSize": 48,
        "color": [255, 255, 255, 255],
        "startMs": 2000,
        "endMs": 8000,
        "transform": {
          "x": 960,
          "y": 540,
          "scaleX": 1.0,
          "scaleY": 1.0,
          "rotation": 0,
          "opacity": 1.0
        },
        "enabled": true,
        "zIndex": 1
      }
    ],
    "audioTracks": [
      {
        "id": "audio1",
        "source": "background.mp3",
        "startMs": 0,
        "endMs": 30000,
        "volume": 0.7
      }
    ]
  }
}
```

### Layer Types

#### Video Layer
```json
{
  "type": "video",
  "source": "path/to/video.mp4",
  "startMs": 0,
  "endMs": 5000,
  "trimStartMs": 0,
  "trimEndMs": 5000
}
```

#### Image Layer
```json
{
  "type": "image",
  "source": "path/to/image.png",
  "startMs": 0,
  "endMs": 5000
}
```

#### Text Layer
```json
{
  "type": "text",
  "text": "Hello World",
  "fontSize": 48,
  "color": [255, 255, 255, 255],
  "fontFamily": "Arial",
  "alignment": "center",
  "stroke": {
    "color": [0, 0, 0, 255],
    "width": 2
  },
  "shadow": {
    "color": [0, 0, 0, 128],
    "offsetX": 2,
    "offsetY": 2,
    "blur": 4
  }
}
```

#### Solid Color Layer
```json
{
  "type": "solidColor",
  "color": [255, 0, 0, 255],
  "startMs": 0,
  "endMs": 5000
}
```

### Transform Properties

All layers support these transform properties:

```json
{
  "transform": {
    "x": 960,
    "y": 540,
    "scaleX": 1.5,
    "scaleY": 1.5,
    "rotation": 45,
    "opacity": 0.8,
    "anchorX": 0.5,
    "anchorY": 0.5
  }
}
```

### Effects

Layers can have effects applied:

```json
{
  "effects": [
    {
      "type": "blur",
      "radius": 10
    },
    {
      "type": "shadow",
      "offsetX": 5,
      "offsetY": 5,
      "blur": 10,
      "color": [0, 0, 0, 128]
    },
    {
      "type": "brightness",
      "amount": 0.2
    },
    {
      "type": "contrast",
      "amount": 0.3
    }
  ]
}
```

### Animation Keyframes

Properties can be animated with keyframes:

```json
{
  "animations": {
    "position": {
      "x": [
        {"time": 0, "value": 0, "easing": "linear"},
        {"time": 1000, "value": 960, "easing": "easeOut"}
      ],
      "y": [
        {"time": 0, "value": 0, "easing": "linear"},
        {"time": 1000, "value": 540, "easing": "easeOut"}
      ]
    },
    "opacity": [
      {"time": 0, "value": 0, "easing": "linear"},
      {"time": 500, "value": 1, "easing": "linear"},
      {"time": 2500, "value": 1, "easing": "linear"},
      {"time": 3000, "value": 0, "easing": "linear"}
    ]
  }
}
```

**Supported Easing Functions:**
- `linear`
- `easeIn`
- `easeOut`
- `easeInOut`
- `cubicBezier` (with control points)
- `steps` (with step count)
- `hold`

## Environment Variables

### `RUST_LOG`

Control logging verbosity:

```bash
# Info level (default)
RUST_LOG=info video-render render -i project.sue -o output.mp4

# Debug level (verbose)
RUST_LOG=debug video-render render -i project.sue -o output.mp4

# Trace level (very verbose)
RUST_LOG=trace video-render render -i project.sue -o output.mp4

# Specific modules
RUST_LOG=video_render=debug,video_compositor=info video-render render -i project.sue -o output.mp4
```

### `RAYON_NUM_THREADS`

Override automatic thread detection:

```bash
RAYON_NUM_THREADS=8 video-render render -i project.sue -o output.mp4
```

## Performance Tips

### 1. Use Appropriate Thread Count

```bash
# Auto-detect (recommended)
video-render render -i project.sue -o output.mp4 -t 0

# Manual (for fine-tuning)
video-render render -i project.sue -o output.mp4 -t $(nproc)
```

### 2. Choose Right Quality for Use Case

Don't use `lossless` unless you need it - file sizes will be huge.

### 3. Monitor Progress

Use JSON progress mode for integration with monitoring tools:

```bash
video-render render -i project.sue -o output.mp4 -p json \
  | tee progress.log
```

### 4. Batch Rendering

Render multiple projects in parallel (if you have enough CPU cores):

```bash
#!/bin/bash
for project in projects/*.sue; do
  output="renders/$(basename "$project" .sue).mp4"
  video-render render -i "$project" -o "$output" -t 4 &
done
wait
```

## Troubleshooting

### Issue: "File not found" Error

**Problem:** Input file path is incorrect

**Solution:**
```bash
# Use absolute paths
video-render render -i /full/path/to/project.sue -o output.mp4

# Or verify current directory
pwd
ls -l project.sue
```

### Issue: Slow Rendering

**Problem:** Not using enough threads

**Solution:**
```bash
# Check CPU cores
nproc

# Use all cores
video-render render -i project.sue -o output.mp4 -t $(nproc)
```

### Issue: Out of Memory

**Problem:** Too many threads or high resolution

**Solution:**
```bash
# Reduce threads
video-render render -i project.sue -o output.mp4 -t 4

# Or reduce resolution
video-render render -i project.sue -o output.mp4 -r 1280x720
```

### Issue: Audio Not Rendering

**Problem:** Audio files not found

**Solution:** Ensure audio file paths in the `.sue` file are correct (absolute or relative to project file).

## Additional Resources

- [Integration Guide](./integration-guide.md) - WASM integration
- [Performance Guide](./performance-guide.md) - Optimization tips
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html) - Video encoding reference
