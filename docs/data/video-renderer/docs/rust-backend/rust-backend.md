---
title: Rust Backend Examples
productId: video-renderer
---

# Rust Backend Examples

<p class="description">High-performance server-side video composition using the Rust compositor library.</p>

## Installation

```text
# Cargo.toml
[dependencies]
video-compositor = "0.1"
tokio = { version = "1", features = ["full"] }
```

## Basic Frame Composition

### Simple Example

```rust
use video_compositor::{Compositor, Layer, Transform, Color};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create compositor for 1080p output
    let compositor = Compositor::new(1920, 1080)?;

    // Create layers
    let layers = vec![
        // Background layer
        Layer::solid_color(
            Color::rgb(50, 50, 50),
            Transform::new()
        ),

        // Red overlay
        Layer::solid_color(
            Color::rgb(255, 0, 0),
            Transform::new()
                .with_position(100.0, 100.0)
                .with_scale(0.5)
                .with_opacity(0.8)
        ),
    ];

    // Compose frame
    let frame = compositor.compose(&layers)?;

    // Save output
    frame.save("output.png")?;

    println!("Frame saved successfully!");
    Ok(())
}
```

## Working with Images

### Loading and Compositing Images

```rust
use video_compositor::{Compositor, Layer, Transform, BlendMode};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let compositor = Compositor::new(1920, 1080)?
        .with_background(Color::black());

    let layers = vec![
        // Background image
        Layer::image(
            "background.jpg",
            Transform::new()
        ),

        // Logo with multiply blend
        Layer::image(
            "logo.png",
            Transform::new()
                .with_position(50.0, 50.0)
                .with_scale(0.3)
        )
        .with_blend_mode(BlendMode::Multiply),

        // Watermark in corner
        Layer::image(
            "watermark.png",
            Transform::new()
                .with_position(1700.0, 950.0)
                .with_scale(0.2)
                .with_opacity(0.5)
        ),
    ];

    let frame = compositor.compose(&layers)?;
    frame.save("composited.png")?;

    Ok(())
}
```

## Blend Modes

### All Available Blend Modes

```rust
use video_compositor::{Compositor, Layer, Transform, BlendMode, Color};

fn demonstrate_blend_modes() -> Result<(), Box<dyn std::error::Error>> {
    let compositor = Compositor::new(800, 600)?;

    let base = Layer::solid_color(
        Color::rgb(100, 100, 255),
        Transform::new()
    );

    // Try different blend modes
    let blend_modes = [
        BlendMode::Normal,
        BlendMode::Multiply,
        BlendMode::Screen,
        BlendMode::Overlay,
        BlendMode::Add,
        BlendMode::Subtract,
        BlendMode::Lighten,
        BlendMode::Darken,
    ];

    for (i, blend_mode) in blend_modes.iter().enumerate() {
        let layers = vec![
            base.clone(),
            Layer::solid_color(
                Color::rgb(255, 100, 100),
                Transform::new()
                    .with_position(200.0, 200.0)
                    .with_scale(0.5)
            )
            .with_blend_mode(*blend_mode),
        ];

        let frame = compositor.compose(&layers)?;
        frame.save(format!("blend_{:?}.png", blend_mode))?;
    }

    Ok(())
}
```

## Effects

### Applying Effects to Layers

```rust
use video_compositor::{Compositor, Layer, Transform, Effect};

fn apply_effects() -> Result<(), Box<dyn std::error::Error>> {
    let compositor = Compositor::new(1920, 1080)?;

    // Load base image
    let mut image = image::open("photo.jpg")?.to_rgba8();

    // Apply blur effect
    let blur_effect = Effect::Blur { radius: 10.0 };
    image = blur_effect.apply(&image)?;

    // Apply brightness adjustment
    let brightness_effect = Effect::Brightness { amount: 0.3 };
    image = brightness_effect.apply(&image)?;

    // Apply contrast
    let contrast_effect = Effect::Contrast { amount: 0.2 };
    image = contrast_effect.apply(&image)?;

    // Create layer from processed image
    let (width, height) = image.dimensions();
    let layer = Layer::from_image_data(
        image.into_raw(),
        width,
        height,
        Transform::new()
    );

    let frame = compositor.compose(&vec![layer])?;
    frame.save("effects_applied.png")?;

    Ok(())
}
```

## Parallel Processing

### Batch Frame Composition

```rust
use video_compositor::{Compositor, Layer, Transform, Color};
use rayon::prelude::*;

fn render_video_frames() -> Result<(), Box<dyn std::error::Error>> {
    let compositor = Compositor::new(1920, 1080)?;

    // Generate 300 frames (10 seconds at 30fps)
    let frame_count = 300;

    let all_layers: Vec<Vec<Layer>> = (0..frame_count)
        .map(|frame_num| {
            // Animate position
            let x = (frame_num as f32 * 5.0) % 1920.0;
            let y = 500.0;

            vec![
                Layer::solid_color(
                    Color::rgb(50, 50, 50),
                    Transform::new()
                ),
                Layer::solid_color(
                    Color::rgb(255, 0, 0),
                    Transform::new()
                        .with_position(x, y)
                        .with_scale(0.3)
                ),
            ]
        })
        .collect();

    // Process all frames in parallel
    let frames = compositor.compose_batch(all_layers)?;

    // Save frames
    frames.iter().enumerate().for_each(|(i, frame)| {
        frame.save(format!("frames/frame_{:04}.png", i))
            .expect("Failed to save frame");
    });

    println!("Rendered {} frames", frame_count);
    Ok(())
}
```

## Real-World Example: Video Template

### Template-Based Video Generation

```rust
use video_compositor::{Compositor, Layer, Transform, BlendMode, Color};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct VideoTemplate {
    width: u32,
    height: u32,
    background_color: [u8; 4],
    elements: Vec<TemplateElement>,
}

#[derive(Serialize, Deserialize)]
struct TemplateElement {
    #[serde(rename = "type")]
    element_type: String,
    image_path: Option<String>,
    color: Option<[u8; 4]>,
    position: (f32, f32),
    scale: f32,
    opacity: f32,
    blend_mode: Option<String>,
}

fn render_from_template(template_json: &str) -> Result<(), Box<dyn std::error::Error>> {
    let template: VideoTemplate = serde_json::from_str(template_json)?;

    let compositor = Compositor::new(template.width, template.height)?
        .with_background(Color::new(
            template.background_color[0],
            template.background_color[1],
            template.background_color[2],
            template.background_color[3],
        ));

    let layers: Vec<Layer> = template.elements.iter().map(|el| {
        let transform = Transform::new()
            .with_position(el.position.0, el.position.1)
            .with_scale(el.scale)
            .with_opacity(el.opacity);

        let layer = match el.element_type.as_str() {
            "image" => Layer::image(
                el.image_path.as_ref().unwrap(),
                transform
            ),
            "color" => Layer::solid_color(
                Color::new(
                    el.color.unwrap()[0],
                    el.color.unwrap()[1],
                    el.color.unwrap()[2],
                    el.color.unwrap()[3],
                ),
                transform
            ),
            _ => panic!("Unknown element type"),
        };

        // Apply blend mode if specified
        if let Some(blend_mode_str) = &el.blend_mode {
            match blend_mode_str.as_str() {
                "multiply" => layer.with_blend_mode(BlendMode::Multiply),
                "screen" => layer.with_blend_mode(BlendMode::Screen),
                "overlay" => layer.with_blend_mode(BlendMode::Overlay),
                _ => layer,
            }
        } else {
            layer
        }
    }).collect();

    let frame = compositor.compose(&layers)?;
    frame.save("template_output.png")?;

    Ok(())
}

// Example template JSON
const TEMPLATE: &str = r#"
{
  "width": 1920,
  "height": 1080,
  "background_color": [30, 30, 30, 255],
  "elements": [
    {
      "type": "image",
      "image_path": "background.jpg",
      "position": [0, 0],
      "scale": 1.0,
      "opacity": 1.0
    },
    {
      "type": "image",
      "image_path": "logo.png",
      "position": [50, 50],
      "scale": 0.3,
      "opacity": 0.9,
      "blend_mode": "multiply"
    },
    {
      "type": "color",
      "color": [255, 100, 0, 200],
      "position": [100, 100],
      "scale": 0.5,
      "opacity": 0.7,
      "blend_mode": "overlay"
    }
  ]
}
"#;
```

## Integration with FFmpeg

### Complete Video Rendering Pipeline

```rust
use video_compositor::{Compositor, Layer, Transform};
use std::process::Command;

fn render_complete_video() -> Result<(), Box<dyn std::error::Error>> {
    let compositor = Compositor::new(1920, 1080)?;

    // 1. Generate all frames
    println!("Rendering frames...");
    let frame_count = 300; // 10 seconds at 30fps

    for frame_num in 0..frame_count {
        let progress = (frame_num as f32 / frame_count as f32) * 100.0;

        // Animate layers
        let x = (frame_num as f32 * 5.0) % 1920.0;

        let layers = vec![
            Layer::image("background.jpg", Transform::new()),
            Layer::image(
                "logo.png",
                Transform::new()
                    .with_position(x, 500.0)
                    .with_scale(0.3)
            ),
        ];

        let frame = compositor.compose(&layers)?;
        frame.save(format!("output/frames/frame_{:04}.png", frame_num))?;

        if frame_num % 30 == 0 {
            println!("Progress: {:.1}%", progress);
        }
    }

    // 2. Encode with FFmpeg
    println!("Encoding video with FFmpeg...");
    let output = Command::new("ffmpeg")
        .args(&[
            "-framerate", "30",
            "-i", "output/frames/frame_%04d.png",
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "23",
            "-pix_fmt", "yuv420p",
            "output/final_video.mp4",
        ])
        .output()?;

    if output.status.success() {
        println!("Video encoded successfully!");
    } else {
        eprintln!("FFmpeg error: {}", String::from_utf8_lossy(&output.stderr));
    }

    Ok(())
}
```

## Performance Optimization

### Parallel Frame Processing

```rust
use video_compositor::{Compositor, Layer};
use rayon::prelude::*;
use std::sync::Arc;

fn optimized_batch_rendering() -> Result<(), Box<dyn std::error::Error>> {
    // Create shared compositor (thread-safe)
    let compositor = Arc::new(Compositor::new(1920, 1080)?);

    // Generate frame data
    let frame_data: Vec<Vec<Layer>> = (0..1000)
        .map(|i| {
            // Your layer generation logic
            vec![/* layers */]
        })
        .collect();

    // Process in parallel with rayon
    let results: Vec<_> = frame_data
        .par_iter()
        .enumerate()
        .map(|(i, layers)| {
            let frame = compositor.compose(layers).unwrap();
            (i, frame)
        })
        .collect();

    // Save results
    results.iter().for_each(|(i, frame)| {
        frame.save(format!("output/frame_{:04}.png", i)).unwrap();
    });

    Ok(())
}
```

## Error Handling

### Robust Error Handling

```rust
use video_compositor::{Compositor, Layer, Transform, Error};

fn safe_composition() -> Result<(), Error> {
    let compositor = Compositor::new(1920, 1080)?;

    // Validate dimensions
    if 1920 == 0 || 1080 == 0 {
        return Err(Error::InvalidDimensions(1920, 1080));
    }

    // Try to load image, handle error
    let layer = match Layer::image("logo.png", Transform::new()) {
        Ok(layer) => layer,
        Err(e) => {
            eprintln!("Failed to load image: {}", e);
            // Fallback to solid color
            Layer::solid_color(
                Color::rgb(100, 100, 100),
                Transform::new()
            )
        }
    };

    let frame = compositor.compose(&vec![layer])?;
    frame.save("output.png")?;

    Ok(())
}
```

## Next Steps

- Explore [WASM Frontend Examples](/video-renderer/wasm-frontend/) for browser integration
- Check out [Node.js Integration](/video-renderer/nodejs-integration/) for backend services
- Read the [API Reference](/video-renderer/api-reference/) for complete documentation
