//! Render command implementation
//!
//! Handles the video rendering pipeline: loading projects, setting up the compositor,
//! rendering frames with progress reporting, and encoding output.

use anyhow::{Context, Result};
use indicatif::{ProgressBar, ProgressStyle};
use std::path::Path;
use std::time::Instant;
use tracing::{debug, info, warn};

use crate::project::Project;
use crate::{QualityPreset, VideoCodec, VideoFormat, ProgressMode};

/// Render command execution
pub struct RenderCommand {
    pub input: String,
    pub output: String,
    pub quality: QualityPreset,
    pub resolution: Option<(u32, u32)>,
    pub format: VideoFormat,
    pub codec: VideoCodec,
    pub fps: f64,
    pub progress_mode: ProgressMode,
}

impl RenderCommand {
    /// Execute the render command
    pub async fn execute(&self) -> Result<()> {
        let start_time = Instant::now();

        // Load project file
        info!("Loading project from: {}", self.input);
        let project = Project::from_file(&self.input)
            .with_context(|| format!("Failed to load project file: {}", self.input))?;

        // Determine output resolution (from args or project)
        let (width, height) = self.resolution.unwrap_or((project.width, project.height));
        info!("Output resolution: {}x{}", width, height);

        // Determine FPS (use project FPS if not overridden)
        let fps = if self.fps == 30.0 && project.fps != 0.0 {
            project.fps
        } else {
            self.fps
        };
        info!("FPS: {}", fps);

        // Create timeline from project
        info!("Setting up compositor with {} tracks", project.tracks.len());
        let timeline = project.to_timeline(width, height, fps)?;

        let total_frames = timeline.frame_count();
        info!(
            "Rendering {} frames ({:.2}s duration)",
            total_frames,
            timeline.duration_ms / 1000.0
        );

        // Setup progress reporting
        let progress = match self.progress_mode {
            ProgressMode::Text => Some(create_text_progress(total_frames)),
            ProgressMode::Json => None, // JSON progress is written per-frame below
        };

        // Render frames
        let mut rendered_frames = Vec::with_capacity(total_frames);
        let mut frame_times = Vec::with_capacity(total_frames);

        for frame_idx in 0..total_frames {
            let frame_start = Instant::now();

            // Render the frame
            let frame = timeline
                .render_frame(frame_idx)
                .with_context(|| format!("Failed to render frame {}", frame_idx))?;

            rendered_frames.push(frame);

            let frame_elapsed = frame_start.elapsed();
            frame_times.push(frame_elapsed.as_secs_f64());

            // Update progress
            match self.progress_mode {
                ProgressMode::Text => {
                    if let Some(ref pb) = progress {
                        pb.inc(1);

                        // Calculate average FPS for last 10 frames
                        let recent_times: Vec<f64> = frame_times
                            .iter()
                            .rev()
                            .take(10)
                            .copied()
                            .collect();
                        let avg_time = recent_times.iter().sum::<f64>() / recent_times.len() as f64;
                        let fps = 1.0 / avg_time;

                        pb.set_message(format!("Rendering @ {:.1} fps", fps));
                    }
                }
                ProgressMode::Json => {
                    // Write JSON progress to stderr
                    let percent = (frame_idx + 1) as f64 / total_frames as f64 * 100.0;
                    let fps = 1.0 / frame_elapsed.as_secs_f64();
                    eprintln!(
                        "{{\"frame\":{},\"total\":{},\"percent\":{:.2},\"fps\":{:.2}}}",
                        frame_idx + 1,
                        total_frames,
                        percent,
                        fps
                    );
                }
            }

            debug!(
                "Rendered frame {}/{} in {:.2}ms",
                frame_idx + 1,
                total_frames,
                frame_elapsed.as_millis()
            );
        }

        if let Some(ref pb) = progress {
            pb.finish_with_message("Rendering complete");
        }

        let render_elapsed = start_time.elapsed();
        let avg_fps = total_frames as f64 / render_elapsed.as_secs_f64();
        info!(
            "Rendered {} frames in {:.2}s ({:.2} fps average)",
            total_frames,
            render_elapsed.as_secs_f64(),
            avg_fps
        );

        // Encode video (stub for now - Phase 7.2 will add FFmpeg integration)
        info!("Encoding video to: {}", self.output);
        self.encode_video(&rendered_frames, width, height, fps)
            .await?;

        let total_elapsed = start_time.elapsed();
        info!(
            "Total time: {:.2}s",
            total_elapsed.as_secs_f64()
        );

        Ok(())
    }

    /// Encode rendered frames to video
    ///
    /// NOTE: This is currently a stub that writes raw frames to disk.
    /// Phase 7.2 will implement actual FFmpeg integration for proper video encoding.
    async fn encode_video(
        &self,
        frames: &[video_compositor::Frame],
        width: u32,
        height: u32,
        fps: f64,
    ) -> Result<()> {
        info!(
            "Encoding with codec {:?}, quality {:?}, format {:?}",
            self.codec, self.quality, self.format
        );

        warn!("FFmpeg integration not yet implemented (Phase 7.2)");
        warn!("Writing raw frame data as placeholder");

        // For now, just save the first and last frames as images to verify rendering works
        let output_path = Path::new(&self.output);
        let output_dir = output_path.parent().unwrap_or(Path::new("."));
        let output_stem = output_path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("output");

        if !frames.is_empty() {
            // Save first frame
            let first_frame_path = output_dir.join(format!("{}_frame_0000.png", output_stem));
            frames[0]
                .save(&first_frame_path)
                .with_context(|| format!("Failed to save first frame to {:?}", first_frame_path))?;
            info!("Saved first frame to: {:?}", first_frame_path);

            // Save last frame
            let last_idx = frames.len() - 1;
            let last_frame_path = output_dir.join(format!("{}_frame_{:04}.png", output_stem, last_idx));
            frames[last_idx]
                .save(&last_frame_path)
                .with_context(|| format!("Failed to save last frame to {:?}", last_frame_path))?;
            info!("Saved last frame to: {:?}", last_frame_path);

            // Write metadata file
            let meta_path = output_dir.join(format!("{}_metadata.json", output_stem));
            let metadata = serde_json::json!({
                "total_frames": frames.len(),
                "width": width,
                "height": height,
                "fps": fps,
                "codec": format!("{:?}", self.codec),
                "quality": format!("{:?}", self.quality),
                "format": format!("{:?}", self.format),
                "note": "FFmpeg integration pending (Phase 7.2)"
            });
            std::fs::write(&meta_path, serde_json::to_string_pretty(&metadata)?)
                .with_context(|| format!("Failed to write metadata to {:?}", meta_path))?;
            info!("Saved metadata to: {:?}", meta_path);
        }

        info!(
            "Placeholder output created. Actual video encoding will be implemented in Phase 7.2"
        );

        Ok(())
    }
}

/// Create a text-based progress bar
fn create_text_progress(total_frames: usize) -> ProgressBar {
    let pb = ProgressBar::new(total_frames as u64);
    pb.set_style(
        ProgressStyle::default_bar()
            .template(
                "{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {pos}/{len} frames ({percent}%) {msg} ETA: {eta}"
            )
            .expect("Invalid progress bar template")
            .progress_chars("=>-"),
    );
    pb
}
