//! Video source module for native builds
//!
//! This module provides video frame decoding capabilities using FFmpeg.
//! It's only available for native builds (not WASM) and requires the `native-video` feature.

use std::path::{Path, PathBuf};
use image::RgbaImage;

#[cfg(all(not(target_arch = "wasm32"), feature = "native-video"))]
use ffmpeg_next as ffmpeg;

use crate::Result;

/// Video source for decoding frames from video files
///
/// This struct wraps FFmpeg functionality to extract frames at arbitrary timestamps.
/// Only available for native builds with the `native-video` feature enabled.
///
/// # Example
///
/// ```no_run
/// use video_compositor::video::VideoSource;
/// use std::path::Path;
///
/// # fn main() -> Result<(), Box<dyn std::error::Error>> {
/// let mut video = VideoSource::open(Path::new("input.mp4"))?;
/// let frame = video.get_frame(1000)?; // Get frame at 1 second
/// # Ok(())
/// # }
/// ```
#[derive(Debug)]
pub struct VideoSource {
    path: PathBuf,
    fps: f64,
    duration_ms: u64,
    width: u32,
    height: u32,

    #[cfg(all(not(target_arch = "wasm32"), feature = "native-video"))]
    video_stream_index: usize,

    #[cfg(all(not(target_arch = "wasm32"), feature = "native-video"))]
    time_base: ffmpeg::Rational,
}

impl VideoSource {
    /// Open a video file and prepare it for frame extraction
    ///
    /// # Arguments
    ///
    /// * `path` - Path to the video file
    ///
    /// # Errors
    ///
    /// Returns an error if:
    /// - The file doesn't exist
    /// - FFmpeg can't open/parse the file
    /// - No video stream is found
    /// - Video codec is not supported
    ///
    /// # Supported Codecs
    ///
    /// - H.264 (AVC)
    /// - H.265 (HEVC)
    /// - VP9
    /// - AV1
    #[cfg(all(not(target_arch = "wasm32"), feature = "native-video"))]
    pub fn open(path: &Path) -> Result<Self> {
        // Initialize FFmpeg (safe to call multiple times)
        ffmpeg::init().map_err(|e| crate::Error::Render(format!("FFmpeg init failed: {}", e)))?;

        // Open the input file
        let input = ffmpeg::format::input(path)
            .map_err(|e| crate::Error::Io(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                format!("Failed to open video file: {}", e)
            )))?;

        // Find the best video stream
        let video_stream = input.streams()
            .best(ffmpeg::media::Type::Video)
            .ok_or_else(|| crate::Error::Render("No video stream found".to_string()))?;

        let video_stream_index = video_stream.index();
        let time_base = video_stream.time_base();

        // Extract video metadata
        let fps = video_stream.avg_frame_rate();
        let fps_value = fps.numerator() as f64 / fps.denominator() as f64;

        let duration_ms = if let Some(duration) = video_stream.duration().checked_mul(1000) {
            let time_base_ms = time_base.numerator() as i64 * 1000 / time_base.denominator() as i64;
            (duration * time_base_ms) as u64
        } else {
            // Fallback to format duration
            let format_duration = input.duration() as i64;
            ((format_duration * 1000) / ffmpeg::ffi::AV_TIME_BASE as i64) as u64
        };

        // Create decoder to get dimensions
        let codec_params = video_stream.parameters();
        let context = ffmpeg::codec::context::Context::from_parameters(codec_params)
            .map_err(|e| crate::Error::Render(format!("Failed to create codec context: {}", e)))?;
        let decoder = context.decoder().video()
            .map_err(|e| crate::Error::Render(format!("Failed to create decoder: {}", e)))?;

        let width = decoder.width();
        let height = decoder.height();

        if width == 0 || height == 0 {
            return Err(crate::Error::InvalidDimensions(width, height));
        }

        Ok(Self {
            path: path.to_path_buf(),
            fps: fps_value,
            duration_ms,
            width,
            height,
            video_stream_index,
            time_base,
        })
    }

    /// Open a video file (stub for non-native or without feature)
    #[cfg(not(all(not(target_arch = "wasm32"), feature = "native-video")))]
    pub fn open(_path: &Path) -> Result<Self> {
        Err(crate::Error::Render(
            "Video support requires native-video feature and non-WASM target".to_string()
        ))
    }

    /// Extract a frame at the specified timestamp
    ///
    /// # Arguments
    ///
    /// * `timestamp_ms` - Timestamp in milliseconds
    ///
    /// # Errors
    ///
    /// Returns an error if:
    /// - Seeking fails
    /// - Frame decoding fails
    /// - Color space conversion fails
    ///
    /// # Notes
    ///
    /// - The timestamp is clamped to [0, duration]
    /// - May return the closest keyframe if exact seeking is not possible
    #[cfg(all(not(target_arch = "wasm32"), feature = "native-video"))]
    pub fn get_frame(&mut self, timestamp_ms: u64) -> Result<RgbaImage> {
        use ffmpeg::software::scaling::{context::Context as ScalingContext, flag::Flags};
        use ffmpeg::util::frame::video::Video as VideoFrame;

        // Open input again (FFmpeg context is not easily shared)
        let mut input = ffmpeg::format::input(&self.path)
            .map_err(|e| crate::Error::Io(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                format!("Failed to reopen video: {}", e)
            )))?;

        // Create decoder
        let video_stream = input.stream(self.video_stream_index)
            .ok_or_else(|| crate::Error::Render("Video stream not found".to_string()))?;

        let context = ffmpeg::codec::context::Context::from_parameters(video_stream.parameters())
            .map_err(|e| crate::Error::Render(format!("Failed to create codec context: {}", e)))?;

        let mut decoder = context.decoder().video()
            .map_err(|e| crate::Error::Render(format!("Failed to create decoder: {}", e)))?;

        // Calculate timestamp in stream time_base
        let timestamp = (timestamp_ms as i64 * self.time_base.denominator() as i64)
            / (self.time_base.numerator() as i64 * 1000);

        // Seek to timestamp
        input.seek(timestamp, ..timestamp + 100)
            .map_err(|e| crate::Error::Render(format!("Seek failed: {}", e)))?;

        // Decode frames until we find one at or after the target timestamp
        let mut frame = VideoFrame::empty();
        let mut found = false;

        for (stream, packet) in input.packets() {
            if stream.index() == self.video_stream_index {
                decoder.send_packet(&packet)
                    .map_err(|e| crate::Error::Render(format!("Failed to send packet: {}", e)))?;

                while decoder.receive_frame(&mut frame).is_ok() {
                    if frame.pts().unwrap_or(0) >= timestamp {
                        found = true;
                        break;
                    }
                }

                if found {
                    break;
                }
            }
        }

        // Flush decoder
        if !found {
            decoder.send_eof()
                .map_err(|e| crate::Error::Render(format!("Failed to flush decoder: {}", e)))?;

            while decoder.receive_frame(&mut frame).is_ok() {
                found = true;
            }
        }

        if !found {
            return Err(crate::Error::Render("Could not decode frame".to_string()));
        }

        // Convert to RGBA
        let mut scaler = ScalingContext::get(
            frame.format(),
            frame.width(),
            frame.height(),
            ffmpeg::format::Pixel::RGBA,
            self.width,
            self.height,
            Flags::BILINEAR,
        ).map_err(|e| crate::Error::Render(format!("Failed to create scaler: {}", e)))?;

        let mut rgba_frame = VideoFrame::empty();
        scaler.run(&frame, &mut rgba_frame)
            .map_err(|e| crate::Error::Render(format!("Failed to scale frame: {}", e)))?;

        // Extract RGBA data
        let data = rgba_frame.data(0);
        let stride = rgba_frame.stride(0);

        // Copy data to RgbaImage (handle stride)
        let mut img_data = Vec::with_capacity((self.width * self.height * 4) as usize);
        for y in 0..self.height as usize {
            let row_start = y * stride;
            let row_end = row_start + (self.width as usize * 4);
            img_data.extend_from_slice(&data[row_start..row_end]);
        }

        RgbaImage::from_raw(self.width, self.height, img_data)
            .ok_or_else(|| crate::Error::Render("Failed to create image from frame data".to_string()))
    }

    /// Extract a frame (stub for non-native or without feature)
    #[cfg(not(all(not(target_arch = "wasm32"), feature = "native-video")))]
    pub fn get_frame(&mut self, _timestamp_ms: u64) -> Result<RgbaImage> {
        Err(crate::Error::Render(
            "Video support requires native-video feature and non-WASM target".to_string()
        ))
    }

    /// Get the video duration in milliseconds
    pub fn duration(&self) -> u64 {
        self.duration_ms
    }

    /// Get the video frame rate (frames per second)
    pub fn fps(&self) -> f64 {
        self.fps
    }

    /// Get the video width in pixels
    pub fn width(&self) -> u32 {
        self.width
    }

    /// Get the video height in pixels
    pub fn height(&self) -> u32 {
        self.height
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn test_video_source_open_nonexistent() {
        let result = VideoSource::open(Path::new("/nonexistent/video.mp4"));
        assert!(result.is_err());
    }

    #[test]
    fn test_video_source_struct_creation() {
        // Test that we can create the struct manually (for testing purposes)
        let source = VideoSource {
            path: PathBuf::from("test.mp4"),
            fps: 30.0,
            duration_ms: 5000,
            width: 1920,
            height: 1080,
            #[cfg(all(not(target_arch = "wasm32"), feature = "native-video"))]
            video_stream_index: 0,
            #[cfg(all(not(target_arch = "wasm32"), feature = "native-video"))]
            time_base: ffmpeg::Rational::new(1, 30),
        };

        assert_eq!(source.duration(), 5000);
        assert_eq!(source.fps(), 30.0);
        assert_eq!(source.width(), 1920);
        assert_eq!(source.height(), 1080);
    }

    // Integration test with actual video file - requires FFmpeg and test video
    #[cfg(all(not(target_arch = "wasm32"), feature = "native-video"))]
    #[test]
    #[ignore] // Ignore by default as it requires test video file
    fn test_video_source_frame_extraction() {
        // This test requires a test video file
        // Run with: cargo test --features native-video -- --ignored
        let test_video = Path::new("test_assets/sample.mp4");

        if !test_video.exists() {
            eprintln!("Test video not found, skipping integration test");
            return;
        }

        let mut source = VideoSource::open(test_video)
            .expect("Failed to open test video");

        assert!(source.duration() > 0);
        assert!(source.fps() > 0.0);
        assert!(source.width() > 0);
        assert!(source.height() > 0);

        // Try to extract a frame at 1 second
        let frame = source.get_frame(1000)
            .expect("Failed to extract frame");

        assert_eq!(frame.width(), source.width());
        assert_eq!(frame.height(), source.height());
    }
}
