//! FFmpeg subprocess management
//!
//! Provides functionality for spawning FFmpeg processes and checking FFmpeg availability.

use anyhow::{Context, Result};
use std::process::{Child, Command, Stdio};
use tracing::{debug, info};

use crate::{VideoCodec, VideoFormat, QualityPreset};

/// FFmpeg process wrapper
pub struct FfmpegProcess {
    child: Child,
}

impl FfmpegProcess {
    /// Spawn FFmpeg with the given arguments
    pub fn spawn(args: Vec<String>) -> Result<Self> {
        debug!("Spawning FFmpeg with args: {:?}", args);

        let child = Command::new("ffmpeg")
            .args(&args)
            .stdin(Stdio::piped())
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .spawn()
            .context("Failed to spawn ffmpeg process. Is ffmpeg installed and in PATH?")?;

        Ok(Self { child })
    }

    /// Get mutable reference to stdin pipe
    pub fn stdin_mut(&mut self) -> Option<&mut std::process::ChildStdin> {
        self.child.stdin.as_mut()
    }

    /// Wait for FFmpeg to finish and check exit status
    pub fn wait(mut self) -> Result<()> {
        // Close stdin to signal end of input
        drop(self.child.stdin.take());

        let output = self
            .child
            .wait_with_output()
            .context("Failed to wait for ffmpeg process")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!(
                "FFmpeg encoding failed with exit code {:?}:\n{}",
                output.status.code(),
                stderr
            );
        }

        info!("FFmpeg encoding completed successfully");
        Ok(())
    }
}

/// Check if FFmpeg is available in PATH and return version info
pub fn check_ffmpeg_available() -> Result<String> {
    let output = Command::new("ffmpeg")
        .arg("-version")
        .output()
        .context("Failed to run 'ffmpeg -version'. Is ffmpeg installed and in PATH?")?;

    if !output.status.success() {
        anyhow::bail!("ffmpeg -version returned non-zero exit code");
    }

    let version_output = String::from_utf8_lossy(&output.stdout);

    // Extract first line which contains version info
    let version = version_output
        .lines()
        .next()
        .unwrap_or("unknown version")
        .to_string();

    debug!("FFmpeg version: {}", version);
    Ok(version)
}

/// Build FFmpeg command line arguments for encoding
pub fn build_ffmpeg_args(
    width: u32,
    height: u32,
    fps: f64,
    codec: VideoCodec,
    quality: QualityPreset,
    format: VideoFormat,
    output_path: &str,
    threads: usize,
) -> Vec<String> {
    let mut args = Vec::new();

    // Overwrite output file without asking
    args.push("-y".to_string());

    // Input configuration: raw RGBA video from stdin
    args.push("-f".to_string());
    args.push("rawvideo".to_string());

    args.push("-pix_fmt".to_string());
    args.push("rgba".to_string());

    args.push("-s".to_string());
    args.push(format!("{}x{}", width, height));

    args.push("-r".to_string());
    args.push(fps.to_string());

    args.push("-i".to_string());
    args.push("pipe:0".to_string());

    // Codec selection
    let codec_name = match codec {
        VideoCodec::H264 => "libx264",
        VideoCodec::H265 => "libx265",
        VideoCodec::Vp9 => "libvpx-vp9",
    };
    args.push("-c:v".to_string());
    args.push(codec_name.to_string());

    // Pixel format for output (yuv420p is most compatible)
    args.push("-pix_fmt".to_string());
    args.push("yuv420p".to_string());

    // Quality settings (CRF - Constant Rate Factor)
    let crf = get_crf_value(codec, quality);
    args.push("-crf".to_string());
    args.push(crf.to_string());

    // Preset for encoding speed/quality tradeoff (libx264/libx265 only)
    if matches!(codec, VideoCodec::H264 | VideoCodec::H265) {
        args.push("-preset".to_string());
        args.push("medium".to_string());
    }

    // Thread count
    if threads > 0 {
        args.push("-threads".to_string());
        args.push(threads.to_string());
    }

    // Container format-specific options
    match format {
        VideoFormat::Mp4 => {
            // Ensure compatibility with most players
            args.push("-movflags".to_string());
            args.push("+faststart".to_string());
        }
        VideoFormat::Webm => {
            // WebM-specific options for VP9
            if matches!(codec, VideoCodec::Vp9) {
                args.push("-b:v".to_string());
                args.push("0".to_string()); // Use CRF mode
            }
        }
        VideoFormat::Mov => {
            // MOV uses similar settings to MP4
        }
    }

    // Output file
    args.push(output_path.to_string());

    args
}

/// Get CRF (Constant Rate Factor) value based on codec and quality preset
///
/// Lower CRF = better quality, larger file size
/// Higher CRF = lower quality, smaller file size
fn get_crf_value(codec: VideoCodec, quality: QualityPreset) -> u8 {
    match (codec, quality) {
        // H.264 CRF values
        (VideoCodec::H264, QualityPreset::Low) => 28,
        (VideoCodec::H264, QualityPreset::Medium) => 23,
        (VideoCodec::H264, QualityPreset::High) => 18,
        (VideoCodec::H264, QualityPreset::Lossless) => 0,

        // H.265/HEVC CRF values (can use higher CRF for same quality)
        (VideoCodec::H265, QualityPreset::Low) => 32,
        (VideoCodec::H265, QualityPreset::Medium) => 28,
        (VideoCodec::H265, QualityPreset::High) => 22,
        (VideoCodec::H265, QualityPreset::Lossless) => 0,

        // VP9 CRF values
        (VideoCodec::Vp9, QualityPreset::Low) => 37,
        (VideoCodec::Vp9, QualityPreset::Medium) => 32,
        (VideoCodec::Vp9, QualityPreset::High) => 24,
        (VideoCodec::Vp9, QualityPreset::Lossless) => 0,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_crf_value_h264() {
        assert_eq!(get_crf_value(VideoCodec::H264, QualityPreset::Low), 28);
        assert_eq!(get_crf_value(VideoCodec::H264, QualityPreset::Medium), 23);
        assert_eq!(get_crf_value(VideoCodec::H264, QualityPreset::High), 18);
        assert_eq!(get_crf_value(VideoCodec::H264, QualityPreset::Lossless), 0);
    }

    #[test]
    fn test_get_crf_value_h265() {
        assert_eq!(get_crf_value(VideoCodec::H265, QualityPreset::Low), 32);
        assert_eq!(get_crf_value(VideoCodec::H265, QualityPreset::Medium), 28);
        assert_eq!(get_crf_value(VideoCodec::H265, QualityPreset::High), 22);
        assert_eq!(get_crf_value(VideoCodec::H265, QualityPreset::Lossless), 0);
    }

    #[test]
    fn test_get_crf_value_vp9() {
        assert_eq!(get_crf_value(VideoCodec::Vp9, QualityPreset::Low), 37);
        assert_eq!(get_crf_value(VideoCodec::Vp9, QualityPreset::Medium), 32);
        assert_eq!(get_crf_value(VideoCodec::Vp9, QualityPreset::High), 24);
        assert_eq!(get_crf_value(VideoCodec::Vp9, QualityPreset::Lossless), 0);
    }

    #[test]
    fn test_build_ffmpeg_args_h264_mp4() {
        let args = build_ffmpeg_args(
            1920,
            1080,
            30.0,
            VideoCodec::H264,
            QualityPreset::High,
            VideoFormat::Mp4,
            "output.mp4",
            4,
        );

        assert!(args.contains(&"-y".to_string()));
        assert!(args.contains(&"-f".to_string()));
        assert!(args.contains(&"rawvideo".to_string()));
        assert!(args.contains(&"-pix_fmt".to_string()));
        assert!(args.contains(&"rgba".to_string()));
        assert!(args.contains(&"-s".to_string()));
        assert!(args.contains(&"1920x1080".to_string()));
        assert!(args.contains(&"-r".to_string()));
        assert!(args.contains(&"30".to_string()));
        assert!(args.contains(&"-c:v".to_string()));
        assert!(args.contains(&"libx264".to_string()));
        assert!(args.contains(&"-crf".to_string()));
        assert!(args.contains(&"18".to_string()));
        assert!(args.contains(&"-threads".to_string()));
        assert!(args.contains(&"4".to_string()));
        assert!(args.contains(&"output.mp4".to_string()));
    }

    #[test]
    fn test_build_ffmpeg_args_h265_webm() {
        let args = build_ffmpeg_args(
            1280,
            720,
            60.0,
            VideoCodec::H265,
            QualityPreset::Medium,
            VideoFormat::Webm,
            "output.webm",
            8,
        );

        assert!(args.contains(&"1280x720".to_string()));
        assert!(args.contains(&"60".to_string()));
        assert!(args.contains(&"libx265".to_string()));
        assert!(args.contains(&"28".to_string())); // Medium quality CRF for H.265
        assert!(args.contains(&"output.webm".to_string()));
    }

    #[test]
    fn test_build_ffmpeg_args_vp9_webm() {
        let args = build_ffmpeg_args(
            3840,
            2160,
            24.0,
            VideoCodec::Vp9,
            QualityPreset::Lossless,
            VideoFormat::Webm,
            "output.webm",
            16,
        );

        assert!(args.contains(&"3840x2160".to_string()));
        assert!(args.contains(&"24".to_string()));
        assert!(args.contains(&"libvpx-vp9".to_string()));
        assert!(args.contains(&"0".to_string())); // Lossless CRF
        assert!(args.contains(&"-b:v".to_string())); // VP9 specific
        assert!(args.contains(&"output.webm".to_string()));
    }

    #[test]
    fn test_check_ffmpeg_available() {
        // This test will only pass if FFmpeg is installed
        // Skip if not available rather than failing
        match check_ffmpeg_available() {
            Ok(version) => {
                assert!(!version.is_empty());
                assert!(version.contains("ffmpeg"));
            }
            Err(_) => {
                // FFmpeg not installed, skip test
                println!("FFmpeg not available, skipping test");
            }
        }
    }
}
