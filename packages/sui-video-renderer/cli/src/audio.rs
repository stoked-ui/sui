//! Audio mixing and muxing pipeline
//!
//! Handles audio track mixing using FFmpeg filters and muxing audio with video.

use anyhow::{Context, Result};
use std::process::Command;
use tracing::{debug, info};

/// Individual audio track information
#[derive(Debug, Clone)]
pub struct AudioTrack {
    /// Path to audio file
    pub file_path: String,

    /// Start time in milliseconds
    pub start_ms: f64,

    /// End time in milliseconds
    pub end_ms: f64,

    /// Volume level (0.0 to 1.0)
    pub volume: f64,
}

impl AudioTrack {
    /// Create a new audio track
    pub fn new(file_path: String, start_ms: f64, end_ms: f64, volume: f64) -> Self {
        Self {
            file_path,
            start_ms,
            end_ms,
            volume: volume.clamp(0.0, 1.0),
        }
    }
}

impl Default for AudioTrack {
    fn default() -> Self {
        Self {
            file_path: String::new(),
            start_ms: 0.0,
            end_ms: 0.0,
            volume: 1.0,
        }
    }
}

/// Audio mixer for combining multiple audio tracks
pub struct AudioMixer {
    /// Sample rate for output audio
    sample_rate: u32,

    /// Number of audio channels
    channels: u16,

    /// Collection of audio tracks to mix
    tracks: Vec<AudioTrack>,
}

impl AudioMixer {
    /// Create a new audio mixer
    pub fn new(sample_rate: u32, channels: u16) -> Self {
        Self {
            sample_rate,
            channels,
            tracks: Vec::new(),
        }
    }

    /// Add an audio track to the mixer
    pub fn add_track(&mut self, file_path: &str, start_ms: f64, end_ms: f64, volume: f64) {
        let track = AudioTrack::new(file_path.to_string(), start_ms, end_ms, volume);
        info!(
            "Adding audio track: {} ({:.2}s - {:.2}s, volume: {:.2})",
            file_path,
            start_ms / 1000.0,
            end_ms / 1000.0,
            volume
        );
        self.tracks.push(track);
    }

    /// Get the number of tracks
    pub fn track_count(&self) -> usize {
        self.tracks.len()
    }

    /// Mix all audio tracks to a single output file using FFmpeg
    pub fn mix_to_file(&self, output_path: &str) -> Result<()> {
        if self.tracks.is_empty() {
            anyhow::bail!("No audio tracks to mix");
        }

        info!("Mixing {} audio tracks to: {}", self.tracks.len(), output_path);

        // Build FFmpeg filter for mixing
        let filter = self.build_mix_filter();
        let args = self.build_mix_args(output_path, &filter);

        debug!("FFmpeg mix command: ffmpeg {}", args.join(" "));

        // Execute FFmpeg
        let output = Command::new("ffmpeg")
            .args(&args)
            .output()
            .context("Failed to execute ffmpeg for audio mixing")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!(
                "FFmpeg audio mixing failed with exit code {:?}:\n{}",
                output.status.code(),
                stderr
            );
        }

        info!("Audio mixing completed: {}", output_path);
        Ok(())
    }


    /// Build FFmpeg filter complex for mixing multiple audio tracks
    fn build_mix_filter(&self) -> String {
        if self.tracks.is_empty() {
            return String::new();
        }

        if self.tracks.len() == 1 {
            // Single track - just apply volume and delay
            let track = &self.tracks[0];
            let delay_samples = calculate_delay_samples(track.start_ms, self.sample_rate);

            if delay_samples > 0 {
                format!(
                    "[0:a]adelay={}|{},volume={}[out]",
                    delay_samples,
                    delay_samples,
                    track.volume
                )
            } else {
                format!("[0:a]volume={}[out]", track.volume)
            }
        } else {
            // Multiple tracks - build complex filter graph
            let mut filter_parts = Vec::new();

            // Process each input with delay and volume
            for (idx, track) in self.tracks.iter().enumerate() {
                let delay_samples = calculate_delay_samples(track.start_ms, self.sample_rate);

                if delay_samples > 0 {
                    filter_parts.push(format!(
                        "[{}:a]adelay={}|{},volume={}[a{}]",
                        idx,
                        delay_samples,
                        delay_samples,
                        track.volume,
                        idx
                    ));
                } else {
                    filter_parts.push(format!(
                        "[{}:a]volume={}[a{}]",
                        idx,
                        track.volume,
                        idx
                    ));
                }
            }

            // Build amix inputs
            let input_labels: Vec<String> = (0..self.tracks.len())
                .map(|i| format!("[a{}]", i))
                .collect();

            // Add amix filter
            filter_parts.push(format!(
                "{}amix=inputs={}:duration=longest[out]",
                input_labels.join(""),
                self.tracks.len()
            ));

            filter_parts.join(";")
        }
    }

    /// Build FFmpeg command line arguments for mixing
    fn build_mix_args(&self, output_path: &str, filter: &str) -> Vec<String> {
        let mut args = Vec::new();

        // Overwrite output without asking
        args.push("-y".to_string());

        // Add all input files
        for track in &self.tracks {
            args.push("-i".to_string());
            args.push(track.file_path.clone());
        }

        // Add filter complex
        args.push("-filter_complex".to_string());
        args.push(filter.to_string());

        // Map the output from filter
        args.push("-map".to_string());
        args.push("[out]".to_string());

        // Audio codec settings
        args.push("-ac".to_string());
        args.push(self.channels.to_string());

        args.push("-ar".to_string());
        args.push(self.sample_rate.to_string());

        // Output file
        args.push(output_path.to_string());

        args
    }
}

/// Calculate delay in samples from milliseconds
fn calculate_delay_samples(ms: f64, sample_rate: u32) -> u64 {
    let seconds = ms / 1000.0;
    (seconds * sample_rate as f64).round() as u64
}

/// Extract audio from a video file
#[allow(dead_code)]
pub fn extract_audio(video_path: &str, output_path: &str) -> Result<()> {
    info!("Extracting audio from {} to {}", video_path, output_path);

    let output = Command::new("ffmpeg")
        .arg("-y")
        .arg("-i")
        .arg(video_path)
        .arg("-vn")
        .arg("-acodec")
        .arg("pcm_s16le")
        .arg(output_path)
        .output()
        .context("Failed to execute ffmpeg for audio extraction")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        anyhow::bail!(
            "FFmpeg audio extraction failed with exit code {:?}:\n{}",
            output.status.code(),
            stderr
        );
    }

    info!("Audio extraction completed");
    Ok(())
}

/// Mux audio file with video file
pub fn mux_audio_with_video(
    video_path: &str,
    audio_path: &str,
    output_path: &str,
) -> Result<()> {
    info!(
        "Muxing video ({}) with audio ({}) to: {}",
        video_path, audio_path, output_path
    );

    let output = Command::new("ffmpeg")
        .arg("-y")
        .arg("-i")
        .arg(video_path)
        .arg("-i")
        .arg(audio_path)
        .arg("-c:v")
        .arg("copy")
        .arg("-c:a")
        .arg("aac")
        .arg("-shortest")
        .arg(output_path)
        .output()
        .context("Failed to execute ffmpeg for audio/video muxing")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        anyhow::bail!(
            "FFmpeg muxing failed with exit code {:?}:\n{}",
            output.status.code(),
            stderr
        );
    }

    info!("Audio/video muxing completed: {}", output_path);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_audio_mixer_creation() {
        let mixer = AudioMixer::new(48000, 2);
        assert_eq!(mixer.sample_rate, 48000);
        assert_eq!(mixer.channels, 2);
        assert_eq!(mixer.track_count(), 0);
    }

    #[test]
    fn test_add_audio_track() {
        let mut mixer = AudioMixer::new(48000, 2);
        mixer.add_track("test.wav", 0.0, 5000.0, 1.0);
        assert_eq!(mixer.track_count(), 1);

        mixer.add_track("test2.mp3", 1000.0, 6000.0, 0.5);
        assert_eq!(mixer.track_count(), 2);
    }

    #[test]
    fn test_build_mix_filter_single_track() {
        let mut mixer = AudioMixer::new(48000, 2);
        mixer.add_track("test.wav", 0.0, 5000.0, 1.0);

        let filter = mixer.build_mix_filter();
        assert!(filter.contains("volume=1"));
        assert!(!filter.contains("adelay")); // No delay for start at 0ms
    }

    #[test]
    fn test_build_mix_filter_single_track_with_delay() {
        let mut mixer = AudioMixer::new(48000, 2);
        mixer.add_track("test.wav", 1000.0, 5000.0, 0.8);

        let filter = mixer.build_mix_filter();
        assert!(filter.contains("adelay="));
        assert!(filter.contains("volume=0.8"));
    }

    #[test]
    fn test_build_mix_filter_multiple_tracks() {
        let mut mixer = AudioMixer::new(48000, 2);
        mixer.add_track("track1.wav", 0.0, 5000.0, 0.8);
        mixer.add_track("track2.mp3", 1000.0, 6000.0, 1.0);

        let filter = mixer.build_mix_filter();
        assert!(filter.contains("amix=inputs=2"));
        assert!(filter.contains("volume=0.8"));
        assert!(filter.contains("volume=1"));
        assert!(filter.contains("duration=longest"));
    }

    #[test]
    fn test_build_mux_args() {
        let mut mixer = AudioMixer::new(48000, 2);
        mixer.add_track("track1.wav", 0.0, 5000.0, 1.0);

        let filter = mixer.build_mix_filter();
        let args = mixer.build_mix_args("output.wav", &filter);

        assert!(args.contains(&"-y".to_string()));
        assert!(args.contains(&"-i".to_string()));
        assert!(args.contains(&"track1.wav".to_string()));
        assert!(args.contains(&"-filter_complex".to_string()));
        assert!(args.contains(&"-ac".to_string()));
        assert!(args.contains(&"2".to_string()));
        assert!(args.contains(&"-ar".to_string()));
        assert!(args.contains(&"48000".to_string()));
        assert!(args.contains(&"output.wav".to_string()));
    }

    #[test]
    fn test_audio_track_defaults() {
        let track = AudioTrack::default();
        assert_eq!(track.file_path, "");
        assert_eq!(track.start_ms, 0.0);
        assert_eq!(track.end_ms, 0.0);
        assert_eq!(track.volume, 1.0);
    }

    #[test]
    fn test_audio_track_volume_clamping() {
        let track = AudioTrack::new("test.wav".to_string(), 0.0, 1000.0, 1.5);
        assert_eq!(track.volume, 1.0); // Clamped to 1.0

        let track2 = AudioTrack::new("test.wav".to_string(), 0.0, 1000.0, -0.5);
        assert_eq!(track2.volume, 0.0); // Clamped to 0.0
    }

    #[test]
    fn test_calculate_delay_samples() {
        // 1 second delay at 48kHz = 48000 samples
        assert_eq!(calculate_delay_samples(1000.0, 48000), 48000);

        // 0.5 second delay at 48kHz = 24000 samples
        assert_eq!(calculate_delay_samples(500.0, 48000), 24000);

        // No delay
        assert_eq!(calculate_delay_samples(0.0, 48000), 0);

        // 2 seconds at 44.1kHz = 88200 samples
        assert_eq!(calculate_delay_samples(2000.0, 44100), 88200);
    }
}
