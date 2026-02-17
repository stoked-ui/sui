//! Video encoder abstraction
//!
//! Provides a high-level interface for encoding frames to video using FFmpeg.

use anyhow::{Context, Result};
use std::io::Write;
use tracing::{debug, info};
use video_compositor::Frame;

use crate::ffmpeg::{build_ffmpeg_args, check_ffmpeg_available, FfmpegProcess};
use crate::{QualityPreset, VideoCodec, VideoFormat};

/// Configuration for video encoding
#[derive(Debug, Clone)]
pub struct EncoderConfig {
    /// Output video width in pixels
    pub width: u32,

    /// Output video height in pixels
    pub height: u32,

    /// Frames per second
    pub fps: f64,

    /// Video codec to use
    pub codec: VideoCodec,

    /// Quality preset
    pub quality: QualityPreset,

    /// Output container format
    pub format: VideoFormat,

    /// Output file path
    pub output_path: String,

    /// Number of encoding threads (0 = auto)
    pub threads: usize,
}

impl EncoderConfig {
    /// Create a new encoder configuration
    pub fn new(
        width: u32,
        height: u32,
        fps: f64,
        codec: VideoCodec,
        quality: QualityPreset,
        format: VideoFormat,
        output_path: String,
    ) -> Self {
        Self {
            width,
            height,
            fps,
            codec,
            quality,
            format,
            output_path,
            threads: 0, // Auto-detect
        }
    }

    /// Set the number of encoding threads
    pub fn with_threads(mut self, threads: usize) -> Self {
        self.threads = threads;
        self
    }
}

/// Video encoder that pipes RGBA frames to FFmpeg
pub struct VideoEncoder {
    config: EncoderConfig,
    ffmpeg: Option<FfmpegProcess>,
    frames_encoded: usize,
}

impl VideoEncoder {
    /// Create a new video encoder
    ///
    /// This will check if FFmpeg is available and spawn the FFmpeg process.
    pub fn new(config: EncoderConfig) -> Result<Self> {
        // Check if FFmpeg is available
        let version = check_ffmpeg_available()
            .context("ffmpeg not found in PATH. Please install FFmpeg to encode videos.")?;

        info!("Using {}", version);
        info!(
            "Encoding {}x{} @ {} fps with {:?} codec, {:?} quality",
            config.width, config.height, config.fps, config.codec, config.quality
        );

        // Build FFmpeg command line arguments
        let args = build_ffmpeg_args(
            config.width,
            config.height,
            config.fps,
            config.codec,
            config.quality,
            config.format,
            &config.output_path,
            config.threads,
        );

        // Spawn FFmpeg process
        let ffmpeg = FfmpegProcess::spawn(args)
            .context("Failed to spawn FFmpeg encoding process")?;

        Ok(Self {
            config,
            ffmpeg: Some(ffmpeg),
            frames_encoded: 0,
        })
    }

    /// Encode a single frame
    ///
    /// Writes the raw RGBA pixel data to FFmpeg's stdin pipe.
    pub fn encode_frame(&mut self, frame: &Frame) -> Result<()> {
        let ffmpeg = self
            .ffmpeg
            .as_mut()
            .context("FFmpeg process not available")?;

        let stdin = ffmpeg
            .stdin_mut()
            .context("FFmpeg stdin pipe not available")?;

        // Get raw RGBA bytes from the frame
        let rgba_data = frame.to_bytes();

        // Verify frame dimensions match encoder config
        let expected_size = (self.config.width * self.config.height * 4) as usize;
        if rgba_data.len() != expected_size {
            anyhow::bail!(
                "Frame size mismatch: expected {} bytes ({}x{}), got {} bytes",
                expected_size,
                self.config.width,
                self.config.height,
                rgba_data.len()
            );
        }

        // Write raw RGBA data to FFmpeg stdin
        stdin
            .write_all(rgba_data)
            .context("Failed to write frame data to FFmpeg")?;

        self.frames_encoded += 1;
        debug!("Encoded frame {}", self.frames_encoded);

        Ok(())
    }

    /// Finish encoding and wait for FFmpeg to complete
    ///
    /// This closes the stdin pipe and waits for FFmpeg to finish encoding.
    pub fn finish(mut self) -> Result<()> {
        let frames = self.frames_encoded;
        let output_path = self.config.output_path.clone();

        info!(
            "Finishing encoding of {} frames to {}",
            frames, output_path
        );

        // Take ownership of FFmpeg process and wait for it to finish
        if let Some(ffmpeg) = self.ffmpeg.take() {
            ffmpeg
                .wait()
                .context("FFmpeg encoding process failed")?;
        } else {
            anyhow::bail!("FFmpeg process already finished or not available");
        }

        info!(
            "Successfully encoded {} frames to {}",
            frames, output_path
        );

        Ok(())
    }

    /// Get the number of frames encoded so far
    pub fn frames_encoded(&self) -> usize {
        self.frames_encoded
    }
}

impl Drop for VideoEncoder {
    fn drop(&mut self) {
        // If the encoder is dropped without calling finish(), ensure cleanup happens
        debug!("VideoEncoder dropped");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encoder_config_new() {
        let config = EncoderConfig::new(
            1920,
            1080,
            30.0,
            VideoCodec::H264,
            QualityPreset::High,
            VideoFormat::Mp4,
            "test.mp4".to_string(),
        );

        assert_eq!(config.width, 1920);
        assert_eq!(config.height, 1080);
        assert_eq!(config.fps, 30.0);
        assert_eq!(config.threads, 0); // default auto
    }

    #[test]
    fn test_encoder_config_with_threads() {
        let config = EncoderConfig::new(
            1920,
            1080,
            30.0,
            VideoCodec::H264,
            QualityPreset::High,
            VideoFormat::Mp4,
            "test.mp4".to_string(),
        )
        .with_threads(8);

        assert_eq!(config.threads, 8);
    }

    #[test]
    fn test_encoder_creation() {
        // This test requires FFmpeg to be installed
        let config = EncoderConfig::new(
            1920,
            1080,
            30.0,
            VideoCodec::H264,
            QualityPreset::High,
            VideoFormat::Mp4,
            "/tmp/test_encoder_creation.mp4".to_string(),
        );

        // Try to create encoder - will skip test if FFmpeg not available
        match VideoEncoder::new(config) {
            Ok(_encoder) => {
                // Encoder created successfully
                // Note: we're not encoding any frames, just testing creation
            }
            Err(e) => {
                // If FFmpeg is not available, this is expected
                let error_msg = format!("{}", e);
                assert!(
                    error_msg.contains("ffmpeg not found") || error_msg.contains("Failed to spawn"),
                    "Unexpected error: {}",
                    error_msg
                );
            }
        }
    }
}
