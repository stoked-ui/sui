//! Example: Compose frames with video layers
//!
//! This example demonstrates how to use video frames as layers in the compositor,
//! combining them with other layer types like text and solid colors.
//!
//! Run with:
//! ```
//! cargo run --example video_layer_composition --features native-video -- path/to/video.mp4
//! ```

#[cfg(all(not(target_arch = "wasm32"), feature = "native-video"))]
fn main() -> Result<(), Box<dyn std::error::Error>> {
    use std::env;
    use std::path::PathBuf;
    use video_compositor::{
        Compositor, Layer, Transform, Color, Effect,
        video::VideoSource,
    };

    // Get video path from command line arguments
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: {} <video_file>", args[0]);
        eprintln!("Example: {} sample.mp4", args[0]);
        std::process::exit(1);
    }

    let video_path = PathBuf::from(&args[1]);

    // Get video info to determine output dimensions
    let video = VideoSource::open(&video_path)?;
    let video_width = video.width();
    let video_height = video.height();

    println!("Video: {}x{}", video_width, video_height);

    // Create compositor with video dimensions
    let compositor = Compositor::new(video_width, video_height)?;

    // Create a composition with multiple layers
    let layers = vec![
        // Background: solid dark color
        Layer::solid_color(
            Color::new(20, 20, 30, 255),
            Transform::default()
        ).with_z_index(0),

        // Video layer at 2 seconds, scaled to 80%
        Layer::video(
            video_path.clone(),
            2000, // 2 seconds
            Transform::default()
                .with_position(
                    video_width as f32 * 0.1,
                    video_height as f32 * 0.1
                )
                .with_scale(0.8)
        )
        .with_z_index(1)
        .with_effect(Effect::Shadow {
            offset_x: 10.0,
            offset_y: 10.0,
            blur: 20.0,
            color: [0, 0, 0, 128],
        }),

        // Title text overlay
        Layer::text(
            "Video Frame at 2s".to_string(),
            48.0,
            Color::white(),
            Transform::default()
                .with_position(40.0, 40.0)
        )
        .with_z_index(2)
        .with_effect(Effect::Shadow {
            offset_x: 2.0,
            offset_y: 2.0,
            blur: 4.0,
            color: [0, 0, 0, 200],
        }),

        // Corner watermark (another video frame at different time)
        Layer::video(
            video_path.clone(),
            5000, // 5 seconds - different frame
            Transform::default()
                .with_position(
                    video_width as f32 - 220.0,
                    video_height as f32 - 140.0
                )
                .with_scale(0.2)
                .with_opacity(0.7)
        )
        .with_z_index(3),
    ];

    println!("Composing frame...");
    let frame = compositor.compose(&layers)?;

    let output_path = "video_composition.png";
    frame.save(output_path)?;

    println!("Saved composition to: {}", output_path);
    println!("\nThe composition includes:");
    println!("  - Dark background");
    println!("  - Main video frame at 2s (scaled 80%, with shadow)");
    println!("  - Title text overlay with shadow");
    println!("  - Small preview from 5s in bottom-right corner");

    Ok(())
}

#[cfg(not(all(not(target_arch = "wasm32"), feature = "native-video")))]
fn main() {
    eprintln!("This example requires the 'native-video' feature and a non-WASM target.");
    eprintln!("Run with: cargo run --example video_layer_composition --features native-video");
    std::process::exit(1);
}
