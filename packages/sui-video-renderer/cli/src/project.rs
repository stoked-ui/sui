//! .sue project file format and parser
//!
//! Defines the project file structure and provides loading/parsing functionality.

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;
use tracing::info;
use video_compositor::{
    AnimatedLayer, Layer, Timeline, TimelineLayer, Transform, Color,
};

/// .sue project file structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    /// Project name
    pub name: String,

    /// Total duration in milliseconds
    pub duration_ms: f64,

    /// Target frames per second
    #[serde(default = "default_fps")]
    pub fps: f64,

    /// Output width in pixels
    pub width: u32,

    /// Output height in pixels
    pub height: u32,

    /// Media tracks (layers)
    #[serde(default)]
    pub tracks: Vec<ProjectTrack>,

    /// Optional project metadata
    #[serde(default)]
    pub metadata: ProjectMetadata,
}

/// Default FPS value
fn default_fps() -> f64 {
    30.0
}

/// Project metadata
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ProjectMetadata {
    /// Author/creator
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,

    /// Creation timestamp
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,

    /// Last modified timestamp
    #[serde(skip_serializing_if = "Option::is_none")]
    pub modified_at: Option<String>,

    /// Project description
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

/// A single track (layer) in the project
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectTrack {
    /// Track name/label
    pub name: String,

    /// Track type
    #[serde(rename = "type")]
    pub track_type: TrackType,

    /// Path to media file (relative to project file or absolute)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_path: Option<String>,

    /// Start time in milliseconds
    pub start_ms: f64,

    /// End time in milliseconds
    pub end_ms: f64,

    /// Track-specific actions/effects
    #[serde(default)]
    pub actions: Vec<TrackAction>,

    /// Initial transform state
    #[serde(default)]
    pub transform: TrackTransform,

    /// Optional color (for solid color tracks)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<[u8; 4]>,

    /// Optional text content (for text tracks)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
}

/// Track/layer types
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TrackType {
    Video,
    Image,
    Audio,
    Text,
    SolidColor,
}

/// Track transform properties
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackTransform {
    #[serde(default)]
    pub x: f64,

    #[serde(default)]
    pub y: f64,

    #[serde(default = "default_scale")]
    pub scale_x: f64,

    #[serde(default = "default_scale")]
    pub scale_y: f64,

    #[serde(default)]
    pub rotation: f64,

    #[serde(default = "default_opacity")]
    pub opacity: f64,
}

fn default_scale() -> f64 {
    1.0
}

fn default_opacity() -> f64 {
    1.0
}

impl Default for TrackTransform {
    fn default() -> Self {
        Self {
            x: 0.0,
            y: 0.0,
            scale_x: 1.0,
            scale_y: 1.0,
            rotation: 0.0,
            opacity: 1.0,
        }
    }
}

impl From<TrackTransform> for Transform {
    fn from(t: TrackTransform) -> Self {
        Transform::default()
            .with_position(t.x as f32, t.y as f32)
            .with_scale_xy(t.scale_x as f32, t.scale_y as f32)
            .with_rotation(t.rotation as f32)
            .with_opacity(t.opacity as f32)
    }
}

/// Actions/effects that can be applied to tracks
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum TrackAction {
    /// Fade in effect
    FadeIn {
        duration_ms: f64,
    },
    /// Fade out effect
    FadeOut {
        duration_ms: f64,
    },
    /// Position animation
    Move {
        from_x: f64,
        from_y: f64,
        to_x: f64,
        to_y: f64,
        start_ms: f64,
        duration_ms: f64,
    },
    /// Scale animation
    Scale {
        from_scale: f64,
        to_scale: f64,
        start_ms: f64,
        duration_ms: f64,
    },
    /// Rotation animation
    Rotate {
        from_degrees: f64,
        to_degrees: f64,
        start_ms: f64,
        duration_ms: f64,
    },
}

impl Project {
    /// Load project from a .sue file
    pub fn from_file<P: AsRef<Path>>(path: P) -> Result<Self> {
        let path = path.as_ref();
        let contents = std::fs::read_to_string(path)
            .with_context(|| format!("Failed to read project file: {:?}", path))?;

        let project: Project = serde_json::from_str(&contents)
            .with_context(|| format!("Failed to parse project JSON from: {:?}", path))?;

        Ok(project)
    }

    /// Save project to a .sue file
    pub fn save<P: AsRef<Path>>(&self, path: P) -> Result<()> {
        let path = path.as_ref();
        let contents = serde_json::to_string_pretty(self)
            .context("Failed to serialize project to JSON")?;

        std::fs::write(path, contents)
            .with_context(|| format!("Failed to write project file: {:?}", path))?;

        Ok(())
    }

    /// Print project information to stdout
    pub fn print_info(&self) {
        println!("Project: {}", self.name);
        println!("Duration: {:.2}s ({} ms)", self.duration_ms / 1000.0, self.duration_ms);
        println!("Resolution: {}x{}", self.width, self.height);
        println!("FPS: {}", self.fps);
        println!("Tracks: {}", self.tracks.len());

        if let Some(ref author) = self.metadata.author {
            println!("Author: {}", author);
        }
        if let Some(ref desc) = self.metadata.description {
            println!("Description: {}", desc);
        }

        println!("\nTrack Details:");
        for (idx, track) in self.tracks.iter().enumerate() {
            println!(
                "  [{}] {} ({:?})",
                idx, track.name, track.track_type
            );
            println!(
                "      Time: {:.2}s - {:.2}s ({:.2}s duration)",
                track.start_ms / 1000.0,
                track.end_ms / 1000.0,
                (track.end_ms - track.start_ms) / 1000.0
            );
            if let Some(ref file) = track.file_path {
                println!("      File: {}", file);
            }
            if !track.actions.is_empty() {
                println!("      Actions: {}", track.actions.len());
            }
        }
    }

    /// Convert project to a Timeline for rendering
    pub fn to_timeline(&self, width: u32, height: u32, fps: f64) -> Result<Timeline> {
        let mut timeline = Timeline::new(width, height, fps);
        timeline.duration_ms = self.duration_ms;

        info!("Converting {} tracks to timeline layers", self.tracks.len());

        for (idx, track) in self.tracks.iter().enumerate() {
            info!(
                "Processing track {}: {} ({:?})",
                idx, track.name, track.track_type
            );

            // Create the base layer based on track type
            let base_layer = match track.track_type {
                TrackType::Image => {
                    if let Some(ref path) = track.file_path {
                        Layer::image(path, track.transform.clone().into())
                    } else {
                        anyhow::bail!("Image track '{}' missing file_path", track.name);
                    }
                }
                TrackType::SolidColor => {
                    let color = if let Some(rgba) = track.color {
                        Color::new(rgba[0], rgba[1], rgba[2], rgba[3])
                    } else {
                        Color::black()
                    };
                    Layer::solid_color(color, track.transform.clone().into())
                }
                TrackType::Video => {
                    // Video tracks will be implemented in future phases
                    anyhow::bail!("Video tracks not yet supported (track: '{}')", track.name);
                }
                TrackType::Audio => {
                    // Audio tracks are handled separately in audio pipeline
                    info!("Skipping audio track '{}' (handled in audio pipeline)", track.name);
                    continue;
                }
                TrackType::Text => {
                    // Text rendering will be implemented in future phases
                    anyhow::bail!("Text tracks not yet supported (track: '{}')", track.name);
                }
            };

            // Wrap in AnimatedLayer
            let animated_layer = AnimatedLayer::new(base_layer);

            // Apply actions/animations
            // NOTE: Full animation support will be expanded in future phases
            // For now, we support basic static layers
            if !track.actions.is_empty() {
                info!(
                    "Track '{}' has {} actions (animation support is limited in this phase)",
                    track.name,
                    track.actions.len()
                );
            }

            // Create timeline layer with temporal bounds
            let timeline_layer = TimelineLayer::new(
                animated_layer,
                track.start_ms,
                track.end_ms,
            );

            timeline.add_layer(timeline_layer);
        }

        info!("Timeline created with {} layers", timeline.layers.len());

        Ok(timeline)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::NamedTempFile;

    #[test]
    fn test_parse_minimal_project() {
        let json = r#"{
            "name": "Test Project",
            "duration_ms": 5000.0,
            "width": 1920,
            "height": 1080,
            "tracks": []
        }"#;

        let project: Project = serde_json::from_str(json).unwrap();
        assert_eq!(project.name, "Test Project");
        assert_eq!(project.duration_ms, 5000.0);
        assert_eq!(project.width, 1920);
        assert_eq!(project.height, 1080);
        assert_eq!(project.fps, 30.0); // default
        assert_eq!(project.tracks.len(), 0);
    }

    #[test]
    fn test_parse_project_with_tracks() {
        let json = r#"{
            "name": "Multi-Track Project",
            "duration_ms": 10000.0,
            "fps": 60.0,
            "width": 1280,
            "height": 720,
            "tracks": [
                {
                    "name": "Background",
                    "type": "solidcolor",
                    "start_ms": 0.0,
                    "end_ms": 10000.0,
                    "color": [255, 0, 0, 255]
                },
                {
                    "name": "Logo",
                    "type": "image",
                    "file_path": "logo.png",
                    "start_ms": 1000.0,
                    "end_ms": 9000.0,
                    "transform": {
                        "x": 100.0,
                        "y": 50.0,
                        "opacity": 0.8
                    }
                }
            ]
        }"#;

        let project: Project = serde_json::from_str(json).unwrap();
        assert_eq!(project.tracks.len(), 2);
        assert_eq!(project.tracks[0].name, "Background");
        assert_eq!(project.tracks[0].track_type, TrackType::SolidColor);
        assert_eq!(project.tracks[1].name, "Logo");
        assert_eq!(project.tracks[1].track_type, TrackType::Image);
    }

    #[test]
    fn test_save_and_load_project() {
        let project = Project {
            name: "Test".to_string(),
            duration_ms: 3000.0,
            fps: 30.0,
            width: 1920,
            height: 1080,
            tracks: vec![],
            metadata: ProjectMetadata::default(),
        };

        let temp_file = NamedTempFile::new().unwrap();
        let temp_path = temp_file.path().to_path_buf();

        // Save
        project.save(&temp_path).unwrap();

        // Load
        let loaded = Project::from_file(&temp_path).unwrap();
        assert_eq!(loaded.name, "Test");
        assert_eq!(loaded.duration_ms, 3000.0);
    }

    #[test]
    fn test_track_transform_default() {
        let transform = TrackTransform::default();
        assert_eq!(transform.x, 0.0);
        assert_eq!(transform.y, 0.0);
        assert_eq!(transform.scale_x, 1.0);
        assert_eq!(transform.scale_y, 1.0);
        assert_eq!(transform.rotation, 0.0);
        assert_eq!(transform.opacity, 1.0);
    }
}
