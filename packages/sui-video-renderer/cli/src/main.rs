//! Video Renderer CLI
//!
//! Command-line interface for rendering video projects from .sue files.
//!
//! ## Usage
//!
//! ```bash
//! # Render a project to video
//! video-render render --input project.sue --output video.mp4
//!
//! # View project information
//! video-render info --input project.sue
//! ```

use anyhow::Result;
use clap::{Parser, Subcommand, ValueEnum};
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

mod audio;
mod encoder;
mod ffmpeg;
mod project;
mod render;

use project::Project;
use render::RenderCommand;

/// Video renderer CLI for .sue project files
#[derive(Parser, Debug)]
#[command(name = "video-render")]
#[command(version, about = "Render video projects from .sue files", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Render a project to video
    Render(RenderArgs),
    /// Display project information
    Info(InfoArgs),
}

/// Arguments for the render subcommand
#[derive(Parser, Debug)]
struct RenderArgs {
    /// Path to .sue project file
    #[arg(short, long)]
    input: String,

    /// Output video file path
    #[arg(short, long)]
    output: String,

    /// Video quality preset
    #[arg(short, long, default_value = "high")]
    quality: QualityPreset,

    /// Output resolution (e.g., 1920x1080)
    #[arg(short, long)]
    resolution: Option<String>,

    /// Video format
    #[arg(short, long, default_value = "mp4")]
    format: VideoFormat,

    /// Video codec
    #[arg(short, long, default_value = "h264")]
    codec: VideoCodec,

    /// Frames per second
    #[arg(long, default_value = "30.0")]
    fps: f64,

    /// Number of worker threads (0 = use available CPUs)
    #[arg(short, long, default_value = "0")]
    threads: usize,

    /// Progress reporting mode
    #[arg(short, long, default_value = "text")]
    progress: ProgressMode,
}

/// Arguments for the info subcommand
#[derive(Parser, Debug)]
struct InfoArgs {
    /// Path to .sue project file
    #[arg(short, long)]
    input: String,
}

/// Video quality presets
#[derive(Debug, Clone, Copy, ValueEnum)]
enum QualityPreset {
    Low,
    Medium,
    High,
    Lossless,
}

/// Video output formats
#[derive(Debug, Clone, Copy, ValueEnum)]
enum VideoFormat {
    Mp4,
    Webm,
    Mov,
}

/// Video codecs
#[derive(Debug, Clone, Copy, ValueEnum)]
enum VideoCodec {
    H264,
    H265,
    Vp9,
}

/// Progress reporting modes
#[derive(Debug, Clone, Copy, ValueEnum)]
enum ProgressMode {
    Text,
    Json,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Setup tracing subscriber for logging
    tracing_subscriber::registry()
        .with(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "video_render=info,video_compositor=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cli = Cli::parse();

    match cli.command {
        Commands::Render(args) => {
            info!("Starting render job");
            info!("Input: {}", args.input);
            info!("Output: {}", args.output);

            // Parse resolution if provided
            let resolution = if let Some(ref res_str) = args.resolution {
                Some(parse_resolution(res_str)?)
            } else {
                None
            };

            // Determine thread count
            let threads = if args.threads == 0 {
                num_cpus::get()
            } else {
                args.threads
            };

            info!("Using {} worker threads", threads);

            // Setup Tokio runtime thread pool
            // Note: we're already in tokio::main, but we can configure rayon separately
            rayon::ThreadPoolBuilder::new()
                .num_threads(threads)
                .build_global()
                .ok(); // Ignore error if already initialized

            let render_cmd = RenderCommand {
                input: args.input,
                output: args.output,
                quality: args.quality,
                resolution,
                format: args.format,
                codec: args.codec,
                fps: args.fps,
                progress_mode: args.progress,
            };

            render_cmd.execute().await?;
        }
        Commands::Info(args) => {
            info!("Reading project file: {}", args.input);

            let project = Project::from_file(&args.input)?;
            project.print_info();
        }
    }

    Ok(())
}

/// Parse resolution string in format "WIDTHxHEIGHT" (e.g., "1920x1080")
fn parse_resolution(res_str: &str) -> Result<(u32, u32)> {
    let parts: Vec<&str> = res_str.split('x').collect();
    if parts.len() != 2 {
        anyhow::bail!(
            "Invalid resolution format '{}'. Expected format: WIDTHxHEIGHT (e.g., 1920x1080)",
            res_str
        );
    }

    let width = parts[0]
        .parse::<u32>()
        .map_err(|_| anyhow::anyhow!("Invalid width: {}", parts[0]))?;
    let height = parts[1]
        .parse::<u32>()
        .map_err(|_| anyhow::anyhow!("Invalid height: {}", parts[1]))?;

    if width == 0 || height == 0 {
        anyhow::bail!("Resolution dimensions must be greater than 0");
    }

    Ok((width, height))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_resolution_valid() {
        assert_eq!(parse_resolution("1920x1080").unwrap(), (1920, 1080));
        assert_eq!(parse_resolution("1280x720").unwrap(), (1280, 720));
        assert_eq!(parse_resolution("3840x2160").unwrap(), (3840, 2160));
    }

    #[test]
    fn test_parse_resolution_invalid() {
        assert!(parse_resolution("1920").is_err());
        assert!(parse_resolution("1920x").is_err());
        assert!(parse_resolution("x1080").is_err());
        assert!(parse_resolution("1920x1080x30").is_err());
        assert!(parse_resolution("abc×def").is_err());
        assert!(parse_resolution("1920x0").is_err());
        assert!(parse_resolution("0x1080").is_err());
    }
}
