//! Transform operations for layers (position, scale, rotation, opacity)

use serde::{Deserialize, Serialize};

use crate::types::Point;

/// Transform applied to a layer
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Transform {
    /// Position offset (x, y)
    pub position: Point,

    /// Scale factor (1.0 = 100%)
    pub scale: Point,

    /// Rotation in degrees (clockwise)
    pub rotation: f32,

    /// Opacity (0.0 = transparent, 1.0 = opaque)
    pub opacity: f32,

    /// Anchor point for transforms (0.0-1.0, relative to layer size)
    pub anchor: Point,
}

impl Transform {
    /// Create a new transform with default values
    pub fn new() -> Self {
        Self::default()
    }

    /// Create transform with specific position
    pub fn at(x: f32, y: f32) -> Self {
        Self {
            position: Point::new(x, y),
            ..Default::default()
        }
    }

    /// Create transform with position and opacity
    pub fn at_with_opacity(x: f32, y: f32, opacity: f32) -> Self {
        Self {
            position: Point::new(x, y),
            opacity: opacity.clamp(0.0, 1.0),
            ..Default::default()
        }
    }

    /// Set position
    pub fn with_position(mut self, x: f32, y: f32) -> Self {
        self.position = Point::new(x, y);
        self
    }

    /// Set scale (uniform)
    pub fn with_scale(mut self, scale: f32) -> Self {
        self.scale = Point::new(scale, scale);
        self
    }

    /// Set scale (non-uniform)
    pub fn with_scale_xy(mut self, scale_x: f32, scale_y: f32) -> Self {
        self.scale = Point::new(scale_x, scale_y);
        self
    }

    /// Set rotation in degrees
    pub fn with_rotation(mut self, degrees: f32) -> Self {
        self.rotation = degrees;
        self
    }

    /// Set opacity (clamped to 0.0-1.0)
    pub fn with_opacity(mut self, opacity: f32) -> Self {
        self.opacity = opacity.clamp(0.0, 1.0);
        self
    }

    /// Set anchor point (center of transforms)
    pub fn with_anchor(mut self, x: f32, y: f32) -> Self {
        self.anchor = Point::new(x.clamp(0.0, 1.0), y.clamp(0.0, 1.0));
        self
    }

    /// Check if transform is identity (no changes)
    pub fn is_identity(&self) -> bool {
        self.position.x == 0.0
            && self.position.y == 0.0
            && self.scale.x == 1.0
            && self.scale.y == 1.0
            && self.rotation == 0.0
            && self.opacity == 1.0
    }
}

impl Default for Transform {
    fn default() -> Self {
        Self {
            position: Point::zero(),
            scale: Point::new(1.0, 1.0),
            rotation: 0.0,
            opacity: 1.0,
            anchor: Point::new(0.5, 0.5), // Center
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_transform() {
        let t = Transform::default();
        assert!(t.is_identity());
    }

    #[test]
    fn test_builder_pattern() {
        let t = Transform::new()
            .with_position(100.0, 200.0)
            .with_scale(2.0)
            .with_rotation(45.0)
            .with_opacity(0.5);

        assert_eq!(t.position, Point::new(100.0, 200.0));
        assert_eq!(t.scale, Point::new(2.0, 2.0));
        assert_eq!(t.rotation, 45.0);
        assert_eq!(t.opacity, 0.5);
    }

    #[test]
    fn test_opacity_clamping() {
        let t = Transform::new().with_opacity(1.5);
        assert_eq!(t.opacity, 1.0);

        let t = Transform::new().with_opacity(-0.5);
        assert_eq!(t.opacity, 0.0);
    }
}
