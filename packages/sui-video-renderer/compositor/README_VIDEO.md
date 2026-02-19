# Video Frame Extraction

This module provides video frame decoding capabilities using FFmpeg for native builds.

## Requirements

### System Dependencies

The `native-video` feature requires FFmpeg system libraries to be installed:

**macOS (Homebrew):**
```bash
brew install ffmpeg pkgconf
```

**Ubuntu/Debian:**
```bash
sudo apt-get install libavformat-dev libavcodec-dev libswscale-dev pkg-config
```

**Fedora/RHEL:**
```bash
sudo dnf install ffmpeg-devel pkg-config
```

### Cargo Feature

Enable the `native-video` feature in your `Cargo.toml`:

```toml
[dependencies]
video-compositor = { version = "0.1", features = ["native-video"] }
```

## Usage

### Basic Frame Extraction

```rust
use video_compositor::video::VideoSource;
use std::path::Path;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Open a video file
    let mut video = VideoSource::open(Path::new("input.mp4"))?;

    // Get video metadata
    println!("Duration: {}ms", video.duration());
    println!("FPS: {}", video.fps());
    println!("Resolution: {}x{}", video.width(), video.height());

    // Extract a frame at 1 second (1000ms)
    let frame = video.get_frame(1000)?;

    // Save the frame
    frame.save("frame_at_1s.png")?;

    Ok(())
}
```

### Using Video Layers in Compositor

```rust
use video_compositor::{Compositor, Layer, Transform};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let compositor = Compositor::new(1920, 1080)?;

    // Create a video layer at timestamp 5000ms (5 seconds)
    let video_layer = Layer::video(
        "input.mp4",
        5000,
        Transform::default()
            .with_position(100.0, 100.0)
            .with_scale(0.5, 0.5)
    );

    let layers = vec![video_layer];
    let frame = compositor.compose(&layers)?;
    frame.save("output.png")?;

    Ok(())
}
```

## Supported Codecs

The video module supports the following video codecs:

- **H.264 (AVC)** - Most common web video codec
- **H.265 (HEVC)** - High efficiency video codec
- **VP9** - Google's open video codec
- **AV1** - Next-generation open codec

## Platform Support

| Platform | Support | Notes |
|----------|---------|-------|
| Linux    | ✅ Yes  | Requires FFmpeg dev libraries |
| macOS    | ✅ Yes  | Install via Homebrew |
| Windows  | ✅ Yes  | Requires FFmpeg libraries |
| WASM     | ❌ No   | Not supported (feature-gated) |

## Architecture

The video module is:
- **Native-only**: Gated behind `#[cfg(not(target_arch = "wasm32"))]`
- **Optional**: Requires `native-video` feature flag
- **Zero-cost**: If not enabled, adds no dependencies or code

## Error Handling

Common errors:

```rust
use video_compositor::video::VideoSource;
use std::path::Path;

match VideoSource::open(Path::new("video.mp4")) {
    Ok(video) => {
        // Video opened successfully
    }
    Err(e) => {
        eprintln!("Failed to open video: {}", e);
        // Possible causes:
        // - File doesn't exist
        // - Invalid video format
        // - Unsupported codec
        // - Corrupted file
    }
}
```

## Performance Notes

- Frame extraction involves seeking and decoding, which can be slow for remote seeks
- For sequential frame extraction, consider maintaining the video context
- Decoding is CPU-intensive; consider using multiple video sources for parallel processing
- The first frame extraction may be slower due to codec initialization

## Testing

Run tests with the `native-video` feature:

```bash
cargo test --features native-video
```

For integration tests with actual video files:

```bash
cargo test --features native-video -- --ignored
```

## Limitations

1. **No audio**: This module only extracts video frames
2. **No streaming**: Each frame extraction reopens the file
3. **No hardware acceleration**: Uses software decoding only
4. **Seek accuracy**: May return closest keyframe depending on codec

## Future Enhancements

Potential improvements for future versions:

- Hardware-accelerated decoding (NVDEC, VideoToolbox, VA-API)
- Streaming API for sequential frame extraction
- Audio extraction support
- Network stream support (RTSP, HLS)
- Frame caching for repeated access
