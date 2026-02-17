//! Example: Extract frames from a video file
//!
//! This example demonstrates how to use the VideoSource module to extract
//! frames from a video file at specific timestamps.
//!
//! Run with:
//! ```
//! cargo run --example video_frame_extraction --features native-video -- path/to/video.mp4
//! ```

#[cfg(all(not(target_arch = "wasm32"), feature = "native-video"))]
fn main() -> Result<(), Box<dyn std::error::Error>> {
    use std::env;
    use std::path::Path;
    use video_compositor::video::VideoSource;

    // Get video path from command line arguments
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: {} <video_file>", args[0]);
        eprintln!("Example: {} sample.mp4", args[0]);
        std::process::exit(1);
    }

    let video_path = Path::new(&args[1]);

    println!("Opening video: {}", video_path.display());

    // Open the video file
    let mut video = VideoSource::open(video_path)?;

    // Display video information
    println!("\nVideo Information:");
    println!("  Duration: {:.2}s", video.duration() as f64 / 1000.0);
    println!("  FPS: {:.2}", video.fps());
    println!("  Resolution: {}x{}", video.width(), video.height());

    // Extract frames at different timestamps
    let timestamps = vec![0, 1000, 2000, 5000]; // 0s, 1s, 2s, 5s

    println!("\nExtracting frames...");
    for (i, timestamp_ms) in timestamps.iter().enumerate() {
        // Check if timestamp is within video duration
        if *timestamp_ms > video.duration() {
            println!(
                "  Skipping {}ms (beyond video duration)",
                timestamp_ms
            );
            continue;
        }

        print!("  Frame at {}ms ({:.1}s)... ", timestamp_ms, *timestamp_ms as f64 / 1000.0);

        match video.get_frame(*timestamp_ms) {
            Ok(frame) => {
                let output_path = format!("frame_{:03}_at_{}ms.png", i, timestamp_ms);
                frame.save(&output_path)?;
                println!("saved to {}", output_path);
            }
            Err(e) => {
                println!("failed: {}", e);
            }
        }
    }

    println!("\nDone!");

    Ok(())
}

#[cfg(not(all(not(target_arch = "wasm32"), feature = "native-video")))]
fn main() {
    eprintln!("This example requires the 'native-video' feature and a non-WASM target.");
    eprintln!("Run with: cargo run --example video_frame_extraction --features native-video");
    std::process::exit(1);
}
