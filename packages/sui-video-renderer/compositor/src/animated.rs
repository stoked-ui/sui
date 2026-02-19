//! Animated layers with property animation support
//!
//! This module provides AnimatedLayer which wraps a Layer with time-varying properties
//! through keyframe interpolation. All transform properties can be animated independently.
//!
//! ## Example
//!
//! ```
//! use video_compositor::{AnimatedLayer, Layer, Transform, Keyframe, EasingFunction};
//!
//! let layer = Layer::solid_color(
//!     video_compositor::Color::red(),
//!     Transform::default(),
//! );
//!
//! let mut animated = AnimatedLayer::new(layer);
//!
//! // Animate position from 0 to 100 over 1 second
//! animated.animated_transform.position_x.add_keyframe(
//!     Keyframe::new(0.0, 0.0, EasingFunction::Linear)
//! );
//! animated.animated_transform.position_x.add_keyframe(
//!     Keyframe::new(1000.0, 100.0, EasingFunction::Linear)
//! );
//!
//! // Get the transform at time 500ms
//! let transform = animated.animated_transform.resolve_at(500.0);
//! assert!((transform.position.x - 50.0).abs() < 0.1);
//! ```

use serde::{Deserialize, Serialize};

use crate::{
    keyframe::{AnimatedProperty, Keyframe},
    layer::Layer,
    transform::Transform,
    types::Point,
};

/// Animated transform properties
///
/// Each transform property can be independently animated using keyframes.
/// Properties with no keyframes (or a single keyframe) are considered static.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimatedTransform {
    /// Animated X position
    pub position_x: AnimatedProperty<f32>,
    /// Animated Y position
    pub position_y: AnimatedProperty<f32>,
    /// Animated X scale
    pub scale_x: AnimatedProperty<f32>,
    /// Animated Y scale
    pub scale_y: AnimatedProperty<f32>,
    /// Animated rotation in degrees
    pub rotation: AnimatedProperty<f32>,
    /// Animated opacity (0.0-1.0)
    pub opacity: AnimatedProperty<f32>,
    /// Animated X anchor point (0.0-1.0)
    pub anchor_x: AnimatedProperty<f32>,
    /// Animated Y anchor point (0.0-1.0)
    pub anchor_y: AnimatedProperty<f32>,
}

impl AnimatedTransform {
    /// Create a new animated transform from a static transform
    ///
    /// All properties are initialized with a single keyframe at time 0
    pub fn from_static(transform: &Transform) -> Self {
        let mut position_x = AnimatedProperty::new();
        position_x.add_keyframe(Keyframe::new(0.0, transform.position.x, crate::keyframe::EasingFunction::Linear));

        let mut position_y = AnimatedProperty::new();
        position_y.add_keyframe(Keyframe::new(0.0, transform.position.y, crate::keyframe::EasingFunction::Linear));

        let mut scale_x = AnimatedProperty::new();
        scale_x.add_keyframe(Keyframe::new(0.0, transform.scale.x, crate::keyframe::EasingFunction::Linear));

        let mut scale_y = AnimatedProperty::new();
        scale_y.add_keyframe(Keyframe::new(0.0, transform.scale.y, crate::keyframe::EasingFunction::Linear));

        let mut rotation = AnimatedProperty::new();
        rotation.add_keyframe(Keyframe::new(0.0, transform.rotation, crate::keyframe::EasingFunction::Linear));

        let mut opacity = AnimatedProperty::new();
        opacity.add_keyframe(Keyframe::new(0.0, transform.opacity, crate::keyframe::EasingFunction::Linear));

        let mut anchor_x = AnimatedProperty::new();
        anchor_x.add_keyframe(Keyframe::new(0.0, transform.anchor.x, crate::keyframe::EasingFunction::Linear));

        let mut anchor_y = AnimatedProperty::new();
        anchor_y.add_keyframe(Keyframe::new(0.0, transform.anchor.y, crate::keyframe::EasingFunction::Linear));

        Self {
            position_x,
            position_y,
            scale_x,
            scale_y,
            rotation,
            opacity,
            anchor_x,
            anchor_y,
        }
    }

    /// Resolve all animated properties at a specific time
    ///
    /// # Arguments
    ///
    /// * `time_ms` - Time in milliseconds
    ///
    /// # Returns
    ///
    /// A Transform with all properties interpolated at the given time
    pub fn resolve_at(&self, time_ms: f64) -> Transform {
        Transform {
            position: Point::new(
                self.position_x.value_at(time_ms),
                self.position_y.value_at(time_ms),
            ),
            scale: Point::new(
                self.scale_x.value_at(time_ms),
                self.scale_y.value_at(time_ms),
            ),
            rotation: self.rotation.value_at(time_ms),
            opacity: self.opacity.value_at(time_ms).clamp(0.0, 1.0),
            anchor: Point::new(
                self.anchor_x.value_at(time_ms).clamp(0.0, 1.0),
                self.anchor_y.value_at(time_ms).clamp(0.0, 1.0),
            ),
            skew: Point::zero(), // Skew not yet animated
        }
    }

    /// Check if this transform is static (no animation)
    ///
    /// Returns true if all properties have 0 or 1 keyframe
    pub fn is_static(&self) -> bool {
        self.position_x.len() <= 1
            && self.position_y.len() <= 1
            && self.scale_x.len() <= 1
            && self.scale_y.len() <= 1
            && self.rotation.len() <= 1
            && self.opacity.len() <= 1
            && self.anchor_x.len() <= 1
            && self.anchor_y.len() <= 1
    }
}

impl Default for AnimatedTransform {
    fn default() -> Self {
        Self::from_static(&Transform::default())
    }
}

/// An animated layer that combines a static layer with time-varying transform properties
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimatedLayer {
    /// The underlying layer
    pub layer: Layer,
    /// Animated transform properties
    pub animated_transform: AnimatedTransform,
}

impl AnimatedLayer {
    /// Create a new animated layer from a static layer
    ///
    /// The animated transform is initialized from the layer's current transform
    pub fn new(layer: Layer) -> Self {
        let animated_transform = AnimatedTransform::from_static(&layer.transform);
        Self {
            layer,
            animated_transform,
        }
    }

    /// Builder: Add position X keyframes
    pub fn with_position_x_keyframes(mut self, keyframes: Vec<Keyframe<f32>>) -> Self {
        self.animated_transform.position_x = AnimatedProperty::with_keyframes(keyframes);
        self
    }

    /// Builder: Add position Y keyframes
    pub fn with_position_y_keyframes(mut self, keyframes: Vec<Keyframe<f32>>) -> Self {
        self.animated_transform.position_y = AnimatedProperty::with_keyframes(keyframes);
        self
    }

    /// Builder: Add scale X keyframes
    pub fn with_scale_x_keyframes(mut self, keyframes: Vec<Keyframe<f32>>) -> Self {
        self.animated_transform.scale_x = AnimatedProperty::with_keyframes(keyframes);
        self
    }

    /// Builder: Add scale Y keyframes
    pub fn with_scale_y_keyframes(mut self, keyframes: Vec<Keyframe<f32>>) -> Self {
        self.animated_transform.scale_y = AnimatedProperty::with_keyframes(keyframes);
        self
    }

    /// Builder: Add rotation keyframes
    pub fn with_rotation_keyframes(mut self, keyframes: Vec<Keyframe<f32>>) -> Self {
        self.animated_transform.rotation = AnimatedProperty::with_keyframes(keyframes);
        self
    }

    /// Builder: Add opacity keyframes
    pub fn with_opacity_keyframes(mut self, keyframes: Vec<Keyframe<f32>>) -> Self {
        self.animated_transform.opacity = AnimatedProperty::with_keyframes(keyframes);
        self
    }

    /// Builder: Add anchor X keyframes
    pub fn with_anchor_x_keyframes(mut self, keyframes: Vec<Keyframe<f32>>) -> Self {
        self.animated_transform.anchor_x = AnimatedProperty::with_keyframes(keyframes);
        self
    }

    /// Builder: Add anchor Y keyframes
    pub fn with_anchor_y_keyframes(mut self, keyframes: Vec<Keyframe<f32>>) -> Self {
        self.animated_transform.anchor_y = AnimatedProperty::with_keyframes(keyframes);
        self
    }

    /// Resolve the layer at a specific time
    ///
    /// Returns a static Layer with the transform resolved at the given time
    pub fn resolve_at(&self, time_ms: f64) -> Layer {
        let mut layer = self.layer.clone();
        layer.transform = self.animated_transform.resolve_at(time_ms);
        layer
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        keyframe::EasingFunction,
        types::Color,
    };

    // Test-3.2.A: position_x keyframes [(0, 0.0), (1000, 100.0)]. Compose at t=500. Assert: layer positioned at ~x=50.
    #[test]
    fn test_position_x_animation() {
        let layer = Layer::solid_color(Color::red(), Transform::default());
        let animated = AnimatedLayer::new(layer)
            .with_position_x_keyframes(vec![
                Keyframe::new(0.0, 0.0, EasingFunction::Linear),
                Keyframe::new(1000.0, 100.0, EasingFunction::Linear),
            ]);

        let resolved = animated.animated_transform.resolve_at(500.0);
        assert!((resolved.position.x - 50.0).abs() < 0.1,
            "Expected position.x ~50.0, got {}", resolved.position.x);
    }

    // Test-3.2.B: opacity keyframes [(0, 1.0), (1000, 0.0)]. Compose at t=500. Assert: alpha ~128 (50% opacity).
    #[test]
    fn test_opacity_animation() {
        let layer = Layer::solid_color(Color::red(), Transform::default());
        let animated = AnimatedLayer::new(layer)
            .with_opacity_keyframes(vec![
                Keyframe::new(0.0, 1.0, EasingFunction::Linear),
                Keyframe::new(1000.0, 0.0, EasingFunction::Linear),
            ]);

        let resolved = animated.animated_transform.resolve_at(500.0);
        assert!((resolved.opacity - 0.5).abs() < 0.01,
            "Expected opacity ~0.5, got {}", resolved.opacity);

        // Also verify alpha channel value (0.5 * 255 = 127.5, rounds to 128)
        let alpha_u8 = (resolved.opacity * 255.0) as u8;
        assert!((alpha_u8 as i32 - 128).abs() <= 1,
            "Expected alpha ~128, got {}", alpha_u8);
    }

    // Test-3.2.C: No keyframes. Assert: is_static() == true, resolve_at(0) == resolve_at(999999).
    #[test]
    fn test_static_animation() {
        let layer = Layer::solid_color(Color::red(), Transform::default());
        let animated = AnimatedLayer::new(layer);

        // Should be static (only has default keyframes at t=0)
        assert!(animated.animated_transform.is_static(),
            "AnimatedTransform with single keyframes should be static");

        let t0 = animated.animated_transform.resolve_at(0.0);
        let t_large = animated.animated_transform.resolve_at(999999.0);

        assert_eq!(t0.position, t_large.position, "Static position should not change over time");
        assert_eq!(t0.scale, t_large.scale, "Static scale should not change over time");
        assert_eq!(t0.rotation, t_large.rotation, "Static rotation should not change over time");
        assert_eq!(t0.opacity, t_large.opacity, "Static opacity should not change over time");
    }

    // Test-3.2.D: AnimatedLayer builder pattern works with multiple properties.
    #[test]
    fn test_builder_pattern() {
        let layer = Layer::solid_color(Color::blue(), Transform::default());
        let animated = AnimatedLayer::new(layer)
            .with_position_x_keyframes(vec![
                Keyframe::new(0.0, 0.0, EasingFunction::Linear),
                Keyframe::new(1000.0, 100.0, EasingFunction::Linear),
            ])
            .with_position_y_keyframes(vec![
                Keyframe::new(0.0, 0.0, EasingFunction::Linear),
                Keyframe::new(1000.0, 200.0, EasingFunction::Linear),
            ])
            .with_scale_x_keyframes(vec![
                Keyframe::new(0.0, 1.0, EasingFunction::Linear),
                Keyframe::new(1000.0, 2.0, EasingFunction::EaseInOut),
            ])
            .with_opacity_keyframes(vec![
                Keyframe::new(0.0, 1.0, EasingFunction::Linear),
                Keyframe::new(1000.0, 0.5, EasingFunction::Linear),
            ]);

        // Test at midpoint
        let resolved = animated.animated_transform.resolve_at(500.0);
        assert!((resolved.position.x - 50.0).abs() < 0.1, "position.x");
        assert!((resolved.position.y - 100.0).abs() < 0.1, "position.y");
        // scale_x with EaseInOut should be close to 1.5 at t=0.5
        assert!(resolved.scale.x > 1.0 && resolved.scale.x < 2.0, "scale.x");
        assert!((resolved.opacity - 0.75).abs() < 0.1, "opacity");

        // Test at endpoints
        let t0 = animated.animated_transform.resolve_at(0.0);
        assert_eq!(t0.position.x, 0.0);
        assert_eq!(t0.position.y, 0.0);
        assert_eq!(t0.scale.x, 1.0);
        assert_eq!(t0.opacity, 1.0);

        let t1000 = animated.animated_transform.resolve_at(1000.0);
        assert_eq!(t1000.position.x, 100.0);
        assert_eq!(t1000.position.y, 200.0);
        assert_eq!(t1000.scale.x, 2.0);
        assert_eq!(t1000.opacity, 0.5);
    }

    #[test]
    fn test_resolve_layer_at() {
        let layer = Layer::solid_color(Color::green(), Transform::default());
        let animated = AnimatedLayer::new(layer)
            .with_position_x_keyframes(vec![
                Keyframe::new(0.0, 0.0, EasingFunction::Linear),
                Keyframe::new(1000.0, 100.0, EasingFunction::Linear),
            ]);

        let resolved_layer = animated.resolve_at(500.0);
        assert!((resolved_layer.transform.position.x - 50.0).abs() < 0.1);
    }

    #[test]
    fn test_opacity_clamping() {
        let layer = Layer::solid_color(Color::red(), Transform::default());
        let animated = AnimatedLayer::new(layer)
            .with_opacity_keyframes(vec![
                Keyframe::new(0.0, -0.5, EasingFunction::Linear),
                Keyframe::new(1000.0, 1.5, EasingFunction::Linear),
            ]);

        let t0 = animated.animated_transform.resolve_at(0.0);
        assert_eq!(t0.opacity, 0.0, "Opacity should be clamped to 0.0");

        let t1000 = animated.animated_transform.resolve_at(1000.0);
        assert_eq!(t1000.opacity, 1.0, "Opacity should be clamped to 1.0");
    }

    #[test]
    fn test_anchor_clamping() {
        let layer = Layer::solid_color(Color::red(), Transform::default());
        let animated = AnimatedLayer::new(layer)
            .with_anchor_x_keyframes(vec![
                Keyframe::new(0.0, -0.5, EasingFunction::Linear),
                Keyframe::new(1000.0, 1.5, EasingFunction::Linear),
            ])
            .with_anchor_y_keyframes(vec![
                Keyframe::new(0.0, 2.0, EasingFunction::Linear),
                Keyframe::new(1000.0, -1.0, EasingFunction::Linear),
            ]);

        let t0 = animated.animated_transform.resolve_at(0.0);
        assert_eq!(t0.anchor.x, 0.0, "Anchor X should be clamped to 0.0");
        assert_eq!(t0.anchor.y, 1.0, "Anchor Y should be clamped to 1.0");

        let t1000 = animated.animated_transform.resolve_at(1000.0);
        assert_eq!(t1000.anchor.x, 1.0, "Anchor X should be clamped to 1.0");
        assert_eq!(t1000.anchor.y, 0.0, "Anchor Y should be clamped to 0.0");
    }

    #[test]
    fn test_rotation_animation() {
        let layer = Layer::solid_color(Color::blue(), Transform::default());
        let animated = AnimatedLayer::new(layer)
            .with_rotation_keyframes(vec![
                Keyframe::new(0.0, 0.0, EasingFunction::Linear),
                Keyframe::new(1000.0, 360.0, EasingFunction::Linear),
            ]);

        let t500 = animated.animated_transform.resolve_at(500.0);
        assert!((t500.rotation - 180.0).abs() < 0.1);
    }

    #[test]
    fn test_scale_animation() {
        let layer = Layer::solid_color(Color::white(), Transform::default());
        let animated = AnimatedLayer::new(layer)
            .with_scale_x_keyframes(vec![
                Keyframe::new(0.0, 0.5, EasingFunction::Linear),
                Keyframe::new(1000.0, 2.0, EasingFunction::Linear),
            ])
            .with_scale_y_keyframes(vec![
                Keyframe::new(0.0, 0.5, EasingFunction::Linear),
                Keyframe::new(1000.0, 3.0, EasingFunction::Linear),
            ]);

        let t500 = animated.animated_transform.resolve_at(500.0);
        assert!((t500.scale.x - 1.25).abs() < 0.01);
        assert!((t500.scale.y - 1.75).abs() < 0.01);
    }
}
