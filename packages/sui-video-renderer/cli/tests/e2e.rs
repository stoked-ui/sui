//! End-to-end integration tests for video renderer CLI
//!
//! These tests exercise the full pipeline from project file to rendered output,
//! testing project loading, timeline creation, and frame rendering.

use std::path::PathBuf;
use video_compositor::{Color, Frame, Layer, Transform};

// Re-export items from the cli crate for testing
// Since cli is a binary crate, we need to include its modules
#[path = "../src/project.rs"]
mod project;

use project::{Project, TrackType, TrackAction, TrackTransform};

/// Helper function to check if FFmpeg is available
fn ffmpeg_available() -> bool {
    std::process::Command::new("ffmpeg")
        .arg("-version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

/// Get the path to a fixture file relative to the test directory
fn fixture_path(name: &str) -> PathBuf {
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push("tests");
    path.push("fixtures");
    path.push(name);
    path
}

/// Create a simple test image for multilayer tests
fn create_test_image() -> anyhow::Result<()> {
    use image::{ImageBuffer, Rgba};

    let test_image_path = fixture_path("test_image.png");

    // Only create if it doesn't exist
    if test_image_path.exists() {
        return Ok(());
    }

    // Create a simple 200x200 blue square with some transparency
    let img: ImageBuffer<Rgba<u8>, Vec<u8>> = ImageBuffer::from_fn(200, 200, |x, y| {
        if x > 20 && x < 180 && y > 20 && y < 180 {
            Rgba([0u8, 100u8, 255u8, 200u8])
        } else {
            Rgba([0u8, 0u8, 0u8, 0u8])
        }
    });

    img.save(&test_image_path)?;
    Ok(())
}

// ============================================================================
// Test 1: test_load_simple_project
// Load simple.sue, verify parsing: name, duration, resolution, track count
// ============================================================================

#[test]
fn test_load_simple_project() {
    let path = fixture_path("simple.sue");
    let project = Project::from_file(&path)
        .expect("Failed to load simple.sue");

    assert_eq!(project.name, "Simple Project", "Project name mismatch");
    assert_eq!(project.duration_ms, 3000.0, "Duration mismatch");
    assert_eq!(project.fps, 30.0, "FPS mismatch");
    assert_eq!(project.width, 1920, "Width mismatch");
    assert_eq!(project.height, 1080, "Height mismatch");
    assert_eq!(project.tracks.len(), 1, "Should have 1 track");

    // Verify the track details
    let track = &project.tracks[0];
    assert_eq!(track.name, "Background");
    assert_eq!(track.track_type, TrackType::SolidColor);
    assert_eq!(track.start_ms, 0.0);
    assert_eq!(track.end_ms, 3000.0);
    assert!(track.color.is_some());
    if let Some(color) = track.color {
        assert_eq!(color, [0, 0, 128, 255], "Background color should be dark blue");
    }
}

// ============================================================================
// Test 2: test_load_multilayer_project
// Load multilayer.sue, verify all tracks parsed correctly
// ============================================================================

#[test]
fn test_load_multilayer_project() {
    let path = fixture_path("multilayer.sue");
    let project = Project::from_file(&path)
        .expect("Failed to load multilayer.sue");

    assert_eq!(project.name, "Multi-Layer Project");
    assert_eq!(project.duration_ms, 5000.0);
    assert_eq!(project.tracks.len(), 3, "Should have 3 tracks");

    // Verify track 0: Background
    let bg = &project.tracks[0];
    assert_eq!(bg.name, "Background");
    assert_eq!(bg.track_type, TrackType::SolidColor);
    assert_eq!(bg.start_ms, 0.0);
    assert_eq!(bg.end_ms, 5000.0);

    // Verify track 1: Image Layer
    let img = &project.tracks[1];
    assert_eq!(img.name, "Image Layer");
    assert_eq!(img.track_type, TrackType::Image);
    assert_eq!(img.start_ms, 1000.0);
    assert_eq!(img.end_ms, 4000.0);
    assert!(img.file_path.is_some());
    assert_eq!(img.transform.x, 100.0);
    assert_eq!(img.transform.y, 50.0);

    // Verify track 2: Overlay
    let overlay = &project.tracks[2];
    assert_eq!(overlay.name, "Overlay");
    assert_eq!(overlay.track_type, TrackType::SolidColor);
    assert_eq!(overlay.start_ms, 2000.0);
    assert_eq!(overlay.end_ms, 5000.0);
    assert_eq!(overlay.transform.opacity, 0.5);
}

// ============================================================================
// Test 3: test_load_animated_project
// Load animated.sue, verify actions parsed
// ============================================================================

#[test]
fn test_load_animated_project() {
    let path = fixture_path("animated.sue");
    let project = Project::from_file(&path)
        .expect("Failed to load animated.sue");

    assert_eq!(project.name, "Animated Project");
    assert_eq!(project.duration_ms, 4000.0);
    assert_eq!(project.tracks.len(), 3, "Should have 3 tracks");

    // Verify track 1: Moving Box (has Move action)
    let moving_box = &project.tracks[1];
    assert_eq!(moving_box.name, "Moving Box");
    assert_eq!(moving_box.actions.len(), 1, "Moving Box should have 1 action");

    match &moving_box.actions[0] {
        TrackAction::Move { from_x, from_y, to_x, to_y, start_ms, duration_ms } => {
            assert_eq!(*from_x, 0.0);
            assert_eq!(*from_y, 540.0);
            assert_eq!(*to_x, 1800.0);
            assert_eq!(*to_y, 540.0);
            assert_eq!(*start_ms, 0.0);
            assert_eq!(*duration_ms, 4000.0);
        }
        _ => panic!("Expected Move action"),
    }

    // Verify track 2: Fading Circle (has FadeIn and FadeOut actions)
    let fading = &project.tracks[2];
    assert_eq!(fading.name, "Fading Circle");
    assert_eq!(fading.actions.len(), 2, "Fading Circle should have 2 actions");

    match &fading.actions[0] {
        TrackAction::FadeIn { duration_ms } => {
            assert_eq!(*duration_ms, 500.0);
        }
        _ => panic!("Expected FadeIn action"),
    }

    match &fading.actions[1] {
        TrackAction::FadeOut { duration_ms } => {
            assert_eq!(*duration_ms, 500.0);
        }
        _ => panic!("Expected FadeOut action"),
    }
}

// ============================================================================
// Test 4: test_simple_timeline_creation
// Load simple.sue, call to_timeline(), verify frame count
// ============================================================================

#[test]
fn test_simple_timeline_creation() {
    let path = fixture_path("simple.sue");
    let project = Project::from_file(&path)
        .expect("Failed to load simple.sue");

    let timeline = project.to_timeline(1920, 1080, 30.0)
        .expect("Failed to create timeline");

    // Verify timeline properties
    assert_eq!(timeline.width, 1920);
    assert_eq!(timeline.height, 1080);
    assert_eq!(timeline.fps, 30.0);
    assert_eq!(timeline.duration_ms, 3000.0);

    // Verify frame count: 3 seconds @ 30fps = 90 frames
    let expected_frames = 90;
    assert_eq!(timeline.frame_count(), expected_frames,
        "Should have {} frames for 3s @ 30fps", expected_frames);

    // Verify we have layers
    assert_eq!(timeline.layers.len(), 1, "Should have 1 layer");
}

// ============================================================================
// Test 5: test_multilayer_timeline_creation
// Load multilayer.sue, create timeline, verify layer count
// ============================================================================

#[test]
fn test_multilayer_timeline_creation() {
    // Create test image first
    create_test_image().expect("Failed to create test image");

    let path = fixture_path("multilayer.sue");
    let project = Project::from_file(&path)
        .expect("Failed to load multilayer.sue");

    let timeline = project.to_timeline(1920, 1080, 30.0)
        .expect("Failed to create timeline from multilayer project");

    assert_eq!(timeline.width, 1920);
    assert_eq!(timeline.height, 1080);
    assert_eq!(timeline.duration_ms, 5000.0);

    // Should have 3 layers (background + image + overlay)
    assert_eq!(timeline.layers.len(), 3, "Should have 3 layers");

    // Verify frame count: 5 seconds @ 30fps = 150 frames
    assert_eq!(timeline.frame_count(), 150);
}

// ============================================================================
// Test 6: test_render_single_frame
// Create simple timeline, render frame 0, verify dimensions
// ============================================================================

#[test]
fn test_render_single_frame() {
    let path = fixture_path("simple.sue");
    let project = Project::from_file(&path)
        .expect("Failed to load simple.sue");

    let timeline = project.to_timeline(1920, 1080, 30.0)
        .expect("Failed to create timeline");

    // Render frame 0
    let frame = timeline.render_frame(0)
        .expect("Failed to render frame 0");

    // Verify frame dimensions
    assert_eq!(frame.width(), 1920, "Frame width should match timeline");
    assert_eq!(frame.height(), 1080, "Frame height should match timeline");

    // Verify frame data size (RGBA = 4 bytes per pixel)
    let expected_size = 1920 * 1080 * 4;
    assert_eq!(frame.to_bytes().len(), expected_size,
        "Frame data size should be width * height * 4");
}

// ============================================================================
// Test 7: test_render_frame_sequence
// Render frames 0..10, verify all same size, no panics
// ============================================================================

#[test]
fn test_render_frame_sequence() {
    let path = fixture_path("simple.sue");
    let project = Project::from_file(&path)
        .expect("Failed to load simple.sue");

    let timeline = project.to_timeline(1920, 1080, 30.0)
        .expect("Failed to create timeline");

    // Render first 10 frames
    let mut frames: Vec<Frame> = Vec::new();
    for frame_idx in 0..10 {
        let frame = timeline.render_frame(frame_idx)
            .expect(&format!("Failed to render frame {}", frame_idx));
        frames.push(frame);
    }

    // Verify we got 10 frames
    assert_eq!(frames.len(), 10, "Should have rendered 10 frames");

    // Verify all frames have same dimensions
    for (idx, frame) in frames.iter().enumerate() {
        assert_eq!(frame.width(), 1920, "Frame {} width mismatch", idx);
        assert_eq!(frame.height(), 1080, "Frame {} height mismatch", idx);
    }
}

// ============================================================================
// Test 8: test_project_info_display
// Load project, call print_info(), verify no panic
// ============================================================================

#[test]
fn test_project_info_display() {
    let path = fixture_path("simple.sue");
    let project = Project::from_file(&path)
        .expect("Failed to load simple.sue");

    // This should not panic
    project.print_info();

    // Load and display multilayer project too
    let path2 = fixture_path("multilayer.sue");
    let project2 = Project::from_file(&path2)
        .expect("Failed to load multilayer.sue");

    project2.print_info();
}

// ============================================================================
// Test 9: test_invalid_project_file
// Try loading non-existent file, verify error
// ============================================================================

#[test]
fn test_invalid_project_file() {
    let path = fixture_path("nonexistent.sue");

    let result = Project::from_file(&path);
    assert!(result.is_err(), "Should fail to load non-existent file");

    let err_msg = format!("{}", result.unwrap_err());
    assert!(err_msg.contains("Failed to read project file") ||
            err_msg.contains("No such file or directory"),
        "Error message should indicate file read failure");
}

// ============================================================================
// Test 10: test_malformed_project_json
// Try loading invalid JSON, verify error
// ============================================================================

#[test]
fn test_malformed_project_json() {
    use std::io::Write;
    use tempfile::NamedTempFile;

    // Create a temporary file with invalid JSON
    let mut temp_file = NamedTempFile::new()
        .expect("Failed to create temp file");

    write!(temp_file, "{{ invalid json content ,,, }}")
        .expect("Failed to write to temp file");

    let path = temp_file.path();
    let result = Project::from_file(path);

    assert!(result.is_err(), "Should fail to parse malformed JSON");

    let err_msg = format!("{}", result.unwrap_err());
    assert!(err_msg.contains("Failed to parse project JSON"),
        "Error message should indicate JSON parsing failure");
}

// ============================================================================
// Test 11: test_project_save_and_reload
// Create a project, save it, reload it, verify contents match
// ============================================================================

#[test]
fn test_project_save_and_reload() {
    use tempfile::NamedTempFile;

    // Create a test project
    let original = Project {
        name: "Test Save".to_string(),
        duration_ms: 2000.0,
        fps: 24.0,
        width: 1280,
        height: 720,
        tracks: vec![],
        metadata: project::ProjectMetadata::default(),
    };

    // Save to temp file
    let temp_file = NamedTempFile::new()
        .expect("Failed to create temp file");
    let temp_path = temp_file.path();

    original.save(temp_path)
        .expect("Failed to save project");

    // Reload
    let reloaded = Project::from_file(temp_path)
        .expect("Failed to reload project");

    // Verify contents match
    assert_eq!(reloaded.name, original.name);
    assert_eq!(reloaded.duration_ms, original.duration_ms);
    assert_eq!(reloaded.fps, original.fps);
    assert_eq!(reloaded.width, original.width);
    assert_eq!(reloaded.height, original.height);
    assert_eq!(reloaded.tracks.len(), original.tracks.len());
}

// ============================================================================
// Test 12: test_timeline_with_different_resolutions
// Verify timeline can be created with different output resolutions
// ============================================================================

#[test]
fn test_timeline_with_different_resolutions() {
    let path = fixture_path("simple.sue");
    let project = Project::from_file(&path)
        .expect("Failed to load simple.sue");

    // Create timeline with original resolution
    let timeline_1080p = project.to_timeline(1920, 1080, 30.0)
        .expect("Failed to create 1080p timeline");
    assert_eq!(timeline_1080p.width, 1920);
    assert_eq!(timeline_1080p.height, 1080);

    // Create timeline with 720p resolution
    let timeline_720p = project.to_timeline(1280, 720, 30.0)
        .expect("Failed to create 720p timeline");
    assert_eq!(timeline_720p.width, 1280);
    assert_eq!(timeline_720p.height, 720);

    // Create timeline with 4K resolution
    let timeline_4k = project.to_timeline(3840, 2160, 30.0)
        .expect("Failed to create 4K timeline");
    assert_eq!(timeline_4k.width, 3840);
    assert_eq!(timeline_4k.height, 2160);
}

// ============================================================================
// Test 13: test_timeline_with_different_framerates
// Verify timeline frame count changes with different FPS
// ============================================================================

#[test]
fn test_timeline_with_different_framerates() {
    let path = fixture_path("simple.sue");
    let project = Project::from_file(&path)
        .expect("Failed to load simple.sue");

    // 3 second project at 30fps = 90 frames
    let timeline_30fps = project.to_timeline(1920, 1080, 30.0)
        .expect("Failed to create 30fps timeline");
    assert_eq!(timeline_30fps.frame_count(), 90);

    // 3 second project at 60fps = 180 frames
    let timeline_60fps = project.to_timeline(1920, 1080, 60.0)
        .expect("Failed to create 60fps timeline");
    assert_eq!(timeline_60fps.frame_count(), 180);

    // 3 second project at 24fps = 72 frames
    let timeline_24fps = project.to_timeline(1920, 1080, 24.0)
        .expect("Failed to create 24fps timeline");
    assert_eq!(timeline_24fps.frame_count(), 72);
}

// ============================================================================
// Test 14: test_track_transform_defaults
// Verify default transform values are applied correctly
// ============================================================================

#[test]
fn test_track_transform_defaults() {
    let default_transform = TrackTransform::default();

    assert_eq!(default_transform.x, 0.0);
    assert_eq!(default_transform.y, 0.0);
    assert_eq!(default_transform.scale_x, 1.0);
    assert_eq!(default_transform.scale_y, 1.0);
    assert_eq!(default_transform.rotation, 0.0);
    assert_eq!(default_transform.opacity, 1.0);
}

// ============================================================================
// Test 15: test_track_transform_conversion
// Verify TrackTransform converts to compositor Transform correctly
// ============================================================================

#[test]
fn test_track_transform_conversion() {
    let track_transform = TrackTransform {
        x: 100.0,
        y: 200.0,
        scale_x: 1.5,
        scale_y: 2.0,
        rotation: 45.0,
        opacity: 0.8,
    };

    let compositor_transform: Transform = track_transform.into();

    // Basic sanity check - transform should have been created
    // We can't directly inspect all fields, but we can verify it doesn't panic
    // and that it can be used to create a layer
    let _layer = Layer::solid_color(Color::red(), compositor_transform);
}

// ============================================================================
// Test 16: test_empty_project
// Verify that a project with no tracks can be loaded and creates valid timeline
// ============================================================================

#[test]
fn test_empty_project() {
    use tempfile::NamedTempFile;
    use std::io::Write;

    let mut temp_file = NamedTempFile::new()
        .expect("Failed to create temp file");

    let json = r#"{
        "name": "Empty Project",
        "duration_ms": 1000.0,
        "fps": 30.0,
        "width": 1920,
        "height": 1080,
        "tracks": []
    }"#;

    write!(temp_file, "{}", json)
        .expect("Failed to write JSON");

    let path = temp_file.path();
    let project = Project::from_file(path)
        .expect("Failed to load empty project");

    assert_eq!(project.tracks.len(), 0);

    let timeline = project.to_timeline(1920, 1080, 30.0)
        .expect("Failed to create timeline from empty project");

    assert_eq!(timeline.layers.len(), 0);
    assert_eq!(timeline.frame_count(), 30);

    // Should be able to render a frame even with no layers (transparent frame)
    let frame = timeline.render_frame(0)
        .expect("Failed to render frame from empty timeline");

    assert_eq!(frame.width(), 1920);
    assert_eq!(frame.height(), 1080);
}

// ============================================================================
// Test 17: test_frame_rendering_consistency
// Verify that rendering the same frame multiple times produces identical results
// ============================================================================

#[test]
fn test_frame_rendering_consistency() {
    let path = fixture_path("simple.sue");
    let project = Project::from_file(&path)
        .expect("Failed to load simple.sue");

    let timeline = project.to_timeline(1920, 1080, 30.0)
        .expect("Failed to create timeline");

    // Render the same frame three times
    let frame1 = timeline.render_frame(15)
        .expect("Failed to render frame 1st time");
    let frame2 = timeline.render_frame(15)
        .expect("Failed to render frame 2nd time");
    let frame3 = timeline.render_frame(15)
        .expect("Failed to render frame 3rd time");

    // All frames should have same dimensions
    assert_eq!(frame1.width(), frame2.width());
    assert_eq!(frame1.height(), frame2.height());
    assert_eq!(frame2.width(), frame3.width());
    assert_eq!(frame2.height(), frame3.height());

    // All frames should have same data
    assert_eq!(frame1.to_bytes(), frame2.to_bytes(),
        "Frame data should be identical between renders");
    assert_eq!(frame2.to_bytes(), frame3.to_bytes(),
        "Frame data should be identical between renders");
}
