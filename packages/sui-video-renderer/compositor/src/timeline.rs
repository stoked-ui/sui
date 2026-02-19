//! Timeline integration for managing animated layers over time
//!
//! This module provides the mapping layer between timeline actions and compositor
//! animated layers, handling timing, enable/disable state, and frame rendering.
//!
//! ## Example
//!
//! ```
//! use video_compositor::{Timeline, TimelineLayer, AnimatedLayer, Layer, Transform, Color};
//!
//! let mut timeline = Timeline::new(1920, 1080, 30.0);
//! timeline.duration_ms = 5000.0;
//!
//! // Create a layer that's active from 0-3000ms
//! let layer = Layer::solid_color(Color::red(), Transform::default());
//! let animated = AnimatedLayer::new(layer);
//! let timeline_layer = TimelineLayer::new(animated, 0.0, 3000.0);
//!
//! timeline.add_layer(timeline_layer);
//!
//! // Render frame at 1500ms
//! let frame = timeline.render_frame_at(1500.0).unwrap();
//! ```

use serde::{Deserialize, Serialize};

use crate::{
    animated::AnimatedLayer,
    compositor::Compositor,
    frame::Frame,
    Result,
};

/// Represents a layer with timeline bounds
///
/// A TimelineLayer wraps an AnimatedLayer and adds temporal bounds (start/end times)
/// and an enabled flag for controlling when the layer is active.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineLayer {
    /// The underlying animated layer
    pub animated_layer: AnimatedLayer,
    /// When this layer becomes active (in milliseconds)
    pub start_ms: f64,
    /// When this layer becomes inactive (in milliseconds)
    pub end_ms: f64,
    /// Can be disabled (skipped during render)
    pub enabled: bool,
}

impl TimelineLayer {
    /// Create a new timeline layer
    ///
    /// # Arguments
    ///
    /// * `animated_layer` - The animated layer to wrap
    /// * `start_ms` - Start time in milliseconds
    /// * `end_ms` - End time in milliseconds
    pub fn new(animated_layer: AnimatedLayer, start_ms: f64, end_ms: f64) -> Self {
        Self {
            animated_layer,
            start_ms,
            end_ms,
            enabled: true,
        }
    }

    /// Check if this layer is active at the given time
    ///
    /// A layer is active if it's enabled AND the time is within its bounds [start_ms, end_ms)
    ///
    /// # Arguments
    ///
    /// * `time_ms` - Time in milliseconds
    ///
    /// # Returns
    ///
    /// True if the layer should be rendered at this time
    pub fn is_active_at(&self, time_ms: f64) -> bool {
        self.enabled && time_ms >= self.start_ms && time_ms < self.end_ms
    }

    /// Get the local time (relative to layer start) for a global time
    ///
    /// This converts timeline time to layer-local time for keyframe evaluation.
    ///
    /// # Arguments
    ///
    /// * `global_time_ms` - Global timeline time in milliseconds
    ///
    /// # Returns
    ///
    /// Local time relative to layer start (global_time - start_ms)
    pub fn local_time(&self, global_time_ms: f64) -> f64 {
        global_time_ms - self.start_ms
    }

    /// Get the duration of this layer
    ///
    /// # Returns
    ///
    /// Duration in milliseconds (end_ms - start_ms)
    pub fn duration(&self) -> f64 {
        self.end_ms - self.start_ms
    }

    /// Builder: Set enabled state
    pub fn with_enabled(mut self, enabled: bool) -> Self {
        self.enabled = enabled;
        self
    }
}

/// Timeline manages a collection of layers and provides frame rendering
///
/// The Timeline coordinates multiple TimelineLayers, managing their temporal relationships
/// and providing methods to render frames at specific times or by frame index.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Timeline {
    /// Collection of timeline layers
    pub layers: Vec<TimelineLayer>,
    /// Total timeline duration in milliseconds
    pub duration_ms: f64,
    /// Frames per second
    pub fps: f64,
    /// Output width in pixels
    pub width: u32,
    /// Output height in pixels
    pub height: u32,
}

impl Timeline {
    /// Create a new timeline
    ///
    /// # Arguments
    ///
    /// * `width` - Output frame width in pixels
    /// * `height` - Output frame height in pixels
    /// * `fps` - Frames per second
    pub fn new(width: u32, height: u32, fps: f64) -> Self {
        Self {
            layers: Vec::new(),
            duration_ms: 0.0,
            fps,
            width,
            height,
        }
    }

    /// Add a layer to the timeline
    ///
    /// # Arguments
    ///
    /// * `layer` - The timeline layer to add
    pub fn add_layer(&mut self, layer: TimelineLayer) {
        self.layers.push(layer);
    }

    /// Get total frame count based on duration and FPS
    ///
    /// # Returns
    ///
    /// Number of frames in the timeline (duration_ms / 1000.0 * fps, rounded up)
    pub fn frame_count(&self) -> usize {
        (self.duration_ms / 1000.0 * self.fps).ceil() as usize
    }

    /// Get the time in milliseconds for a given frame index
    ///
    /// # Arguments
    ///
    /// * `frame_index` - Zero-based frame index
    ///
    /// # Returns
    ///
    /// Time in milliseconds for this frame (frame_index * 1000.0 / fps)
    pub fn frame_time(&self, frame_index: usize) -> f64 {
        frame_index as f64 * 1000.0 / self.fps
    }

    /// Get all active (enabled + within time range) layers at a given time
    ///
    /// Returns layers sorted by z-index (handled by compositor)
    ///
    /// # Arguments
    ///
    /// * `time_ms` - Time in milliseconds
    ///
    /// # Returns
    ///
    /// Vector of references to active timeline layers
    pub fn active_layers_at(&self, time_ms: f64) -> Vec<&TimelineLayer> {
        self.layers
            .iter()
            .filter(|layer| layer.is_active_at(time_ms))
            .collect()
    }

    /// Render a single frame at the given time
    ///
    /// This method:
    /// 1. Creates a compositor with the timeline dimensions
    /// 2. Gets all active layers at the specified time
    /// 3. Converts global time to local time for each layer
    /// 4. Resolves animated transforms at local time
    /// 5. Composes the frame
    ///
    /// # Arguments
    ///
    /// * `time_ms` - Time in milliseconds
    ///
    /// # Returns
    ///
    /// Composed frame at the given time
    pub fn render_frame_at(&self, time_ms: f64) -> Result<Frame> {
        let compositor = Compositor::new(self.width, self.height)?;

        // Get active layers at this time
        let active = self.active_layers_at(time_ms);

        // Convert to AnimatedLayers with resolved local times
        let animated_layers: Vec<AnimatedLayer> = active
            .iter()
            .map(|timeline_layer| {
                // Use the AnimatedLayer directly - compose_at_time will resolve at the correct time
                // We need to pass the local time, but compose_at_time expects absolute time
                // So we'll manually resolve here
                let local_time = timeline_layer.local_time(time_ms);
                let resolved = timeline_layer.animated_layer.clone();

                // Update the layer's transform to be resolved at local time
                // We'll create a new AnimatedLayer with the resolved transform
                let resolved_layer = resolved.resolve_at(local_time);
                AnimatedLayer::new(resolved_layer)
            })
            .collect();

        // Compose at time 0 since we already resolved the transforms
        compositor.compose_at_time(&animated_layers, 0.0)
    }

    /// Render a frame by index (converts to time_ms internally)
    ///
    /// # Arguments
    ///
    /// * `frame_index` - Zero-based frame index
    ///
    /// # Returns
    ///
    /// Composed frame at the frame's time
    pub fn render_frame(&self, frame_index: usize) -> Result<Frame> {
        let time_ms = self.frame_time(frame_index);
        self.render_frame_at(time_ms)
    }

    /// Builder: Set duration
    pub fn with_duration(mut self, duration_ms: f64) -> Self {
        self.duration_ms = duration_ms;
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        keyframe::{EasingFunction, Keyframe},
        layer::Layer,
        transform::Transform,
        types::Color,
    };

    // Test-3.3.A: TimelineLayer with start=1000, end=5000.
    // Assert: is_active_at(500) == false, is_active_at(3000) == true, is_active_at(5000) == false.
    #[test]
    fn test_timeline_layer_active_bounds() {
        let layer = Layer::solid_color(Color::red(), Transform::default());
        let animated = AnimatedLayer::new(layer);
        let timeline_layer = TimelineLayer::new(animated, 1000.0, 5000.0);

        assert!(!timeline_layer.is_active_at(500.0), "Should not be active before start");
        assert!(timeline_layer.is_active_at(3000.0), "Should be active within bounds");
        assert!(!timeline_layer.is_active_at(5000.0), "Should not be active at end (exclusive)");
    }

    // Test-3.3.B: Disabled TimelineLayer.
    // Assert: is_active_at(3000) == false (even when in time range).
    #[test]
    fn test_disabled_timeline_layer() {
        let layer = Layer::solid_color(Color::blue(), Transform::default());
        let animated = AnimatedLayer::new(layer);
        let timeline_layer = TimelineLayer::new(animated, 1000.0, 5000.0)
            .with_enabled(false);

        assert!(!timeline_layer.is_active_at(3000.0), "Disabled layer should not be active");
    }

    // Test-3.3.C: Two TimelineLayers [0-5000] and [4000-8000].
    // Assert: active_layers_at(3000).len() == 1, active_layers_at(4500).len() == 2.
    #[test]
    fn test_multiple_layers_active() {
        let mut timeline = Timeline::new(1920, 1080, 30.0);

        let layer1 = Layer::solid_color(Color::red(), Transform::default());
        let animated1 = AnimatedLayer::new(layer1);
        timeline.add_layer(TimelineLayer::new(animated1, 0.0, 5000.0));

        let layer2 = Layer::solid_color(Color::blue(), Transform::default());
        let animated2 = AnimatedLayer::new(layer2);
        timeline.add_layer(TimelineLayer::new(animated2, 4000.0, 8000.0));

        let active_at_3000 = timeline.active_layers_at(3000.0);
        assert_eq!(active_at_3000.len(), 1, "Only first layer should be active at 3000ms");

        let active_at_4500 = timeline.active_layers_at(4500.0);
        assert_eq!(active_at_4500.len(), 2, "Both layers should be active at 4500ms");
    }

    // Test-3.3.D: Timeline with fps=30 and duration=1000.
    // Assert: frame_count() == 30, frame_time(0) == 0.0, frame_time(15) == 500.0.
    #[test]
    fn test_timeline_frame_calculations() {
        let timeline = Timeline::new(1920, 1080, 30.0)
            .with_duration(1000.0);

        assert_eq!(timeline.frame_count(), 30, "Should have 30 frames for 1 second at 30 fps");
        assert_eq!(timeline.frame_time(0), 0.0, "Frame 0 should be at time 0");

        let frame_15_time = timeline.frame_time(15);
        assert!((frame_15_time - 500.0).abs() < 0.01,
            "Frame 15 should be at ~500ms, got {}", frame_15_time);
    }

    // Test-3.3.E: local_time conversion. Layer starts at 1000ms.
    // Assert: local_time(1500) == 500.
    #[test]
    fn test_local_time_conversion() {
        let layer = Layer::solid_color(Color::green(), Transform::default());
        let animated = AnimatedLayer::new(layer);
        let timeline_layer = TimelineLayer::new(animated, 1000.0, 5000.0);

        assert_eq!(timeline_layer.local_time(1500.0), 500.0,
            "Local time should be global_time - start_ms");
        assert_eq!(timeline_layer.local_time(1000.0), 0.0,
            "Local time at layer start should be 0");
    }

    // Test-3.3.F: render_frame_at produces a valid frame (non-zero size).
    #[test]
    fn test_render_frame_produces_valid_frame() {
        let mut timeline = Timeline::new(1920, 1080, 30.0);
        timeline.duration_ms = 1000.0;

        let layer = Layer::solid_color(Color::red(), Transform::default());
        let animated = AnimatedLayer::new(layer);
        timeline.add_layer(TimelineLayer::new(animated, 0.0, 1000.0));

        let frame = timeline.render_frame_at(500.0)
            .expect("Frame rendering should succeed");

        assert_eq!(frame.width(), 1920, "Frame width should match timeline");
        assert_eq!(frame.height(), 1080, "Frame height should match timeline");
    }

    #[test]
    fn test_timeline_layer_duration() {
        let layer = Layer::solid_color(Color::white(), Transform::default());
        let animated = AnimatedLayer::new(layer);
        let timeline_layer = TimelineLayer::new(animated, 1000.0, 3500.0);

        assert_eq!(timeline_layer.duration(), 2500.0, "Duration should be end - start");
    }

    #[test]
    fn test_render_frame_by_index() {
        let mut timeline = Timeline::new(1920, 1080, 30.0);
        timeline.duration_ms = 1000.0;

        let layer = Layer::solid_color(Color::blue(), Transform::default());
        let animated = AnimatedLayer::new(layer);
        timeline.add_layer(TimelineLayer::new(animated, 0.0, 1000.0));

        let frame = timeline.render_frame(15)
            .expect("Frame rendering by index should succeed");

        assert_eq!(frame.width(), 1920);
        assert_eq!(frame.height(), 1080);
    }

    #[test]
    fn test_empty_timeline_render() {
        let timeline = Timeline::new(1920, 1080, 30.0);

        // Rendering with no layers should produce an empty frame
        let frame = timeline.render_frame_at(500.0)
            .expect("Should render empty frame");

        assert_eq!(frame.width(), 1920);
        assert_eq!(frame.height(), 1080);
    }

    #[test]
    fn test_layer_outside_time_range() {
        let mut timeline = Timeline::new(1920, 1080, 30.0);
        timeline.duration_ms = 10000.0;

        let layer = Layer::solid_color(Color::red(), Transform::default());
        let animated = AnimatedLayer::new(layer);
        timeline.add_layer(TimelineLayer::new(animated, 2000.0, 4000.0));

        // Before layer starts
        let active_before = timeline.active_layers_at(1000.0);
        assert_eq!(active_before.len(), 0, "No layers should be active before start");

        // During layer
        let active_during = timeline.active_layers_at(3000.0);
        assert_eq!(active_during.len(), 1, "Layer should be active during its time range");

        // After layer ends
        let active_after = timeline.active_layers_at(5000.0);
        assert_eq!(active_after.len(), 0, "No layers should be active after end");
    }

    #[test]
    fn test_animated_layer_with_keyframes_in_timeline() {
        let mut timeline = Timeline::new(1920, 1080, 30.0);
        timeline.duration_ms = 2000.0;

        // Create a layer that animates position from 0 to 100 over its local time
        let layer = Layer::solid_color(Color::red(), Transform::default());
        let animated = AnimatedLayer::new(layer)
            .with_position_x_keyframes(vec![
                Keyframe::new(0.0, 0.0, EasingFunction::Linear),
                Keyframe::new(1000.0, 100.0, EasingFunction::Linear),
            ]);

        // Layer is active from 500ms to 1500ms (1000ms duration)
        timeline.add_layer(TimelineLayer::new(animated, 500.0, 1500.0));

        // Render at timeline time 1000ms = local time 500ms for the layer
        // Position should be at 50.0 (halfway through the animation)
        let frame = timeline.render_frame_at(1000.0)
            .expect("Should render frame with animation");

        assert_eq!(frame.width(), 1920);
        assert_eq!(frame.height(), 1080);
    }

    #[test]
    fn test_frame_count_rounding() {
        // Test that frame count is properly rounded up
        let timeline1 = Timeline::new(1920, 1080, 30.0)
            .with_duration(1000.0);
        assert_eq!(timeline1.frame_count(), 30); // Exact: 1.0s * 30fps = 30

        let timeline2 = Timeline::new(1920, 1080, 30.0)
            .with_duration(1100.0);
        assert_eq!(timeline2.frame_count(), 33); // Rounded up: 1.1s * 30fps = 33

        let timeline3 = Timeline::new(1920, 1080, 24.0)
            .with_duration(1000.0);
        assert_eq!(timeline3.frame_count(), 24); // 1.0s * 24fps = 24
    }
}
