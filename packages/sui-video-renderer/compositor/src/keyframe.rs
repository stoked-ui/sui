//! Keyframe animation system with interpolation engine
//!
//! This module provides a generic keyframe animation system with support for multiple
//! easing functions and interpolation between values over time.
//!
//! ## Example
//!
//! ```
//! use video_compositor::keyframe::{Keyframe, EasingFunction, AnimatedProperty, Interpolate};
//!
//! let mut property = AnimatedProperty::new();
//! property.add_keyframe(Keyframe::new(0.0, 0.0, EasingFunction::Linear));
//! property.add_keyframe(Keyframe::new(1000.0, 100.0, EasingFunction::Linear));
//!
//! assert_eq!(property.value_at(500.0), 50.0);
//! ```

use serde::{Deserialize, Serialize};
use crate::types::{Color, Point};

/// Trait for types that can be interpolated between two values
pub trait Interpolate: Clone {
    /// Linearly interpolate between two values
    ///
    /// # Arguments
    ///
    /// * `a` - Start value (t = 0.0)
    /// * `b` - End value (t = 1.0)
    /// * `t` - Interpolation parameter (0.0 to 1.0)
    ///
    /// # Returns
    ///
    /// Interpolated value between a and b
    fn lerp(a: &Self, b: &Self, t: f32) -> Self;
}

/// Easing function for keyframe animation
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum EasingFunction {
    /// Linear interpolation (no easing)
    Linear,
    /// Quadratic ease-in (slow start, accelerating)
    EaseIn,
    /// Quadratic ease-out (fast start, decelerating)
    EaseOut,
    /// Quadratic ease-in-out (slow start and end, fast middle)
    EaseInOut,
    /// Cubic Bezier curve defined by two control points
    /// (x1, y1, x2, y2) where x and y are in range [0, 1]
    CubicBezier(f32, f32, f32, f32),
    /// Discrete steps with specified position
    /// (number of steps, step position)
    Steps(u32, StepPosition),
    /// Hold the value until exactly reaching the next keyframe
    Hold,
}

/// Position where step change occurs
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum StepPosition {
    /// Change at the start of each interval
    Start,
    /// Change at the end of each interval
    End,
}

impl EasingFunction {
    /// Apply easing function to a normalized time value (0.0 to 1.0)
    ///
    /// # Arguments
    ///
    /// * `t` - Normalized time parameter (0.0 to 1.0)
    ///
    /// # Returns
    ///
    /// Eased time value
    pub fn apply(&self, t: f32) -> f32 {
        let t = t.clamp(0.0, 1.0);

        match self {
            EasingFunction::Linear => t,

            EasingFunction::EaseIn => t * t,

            EasingFunction::EaseOut => t * (2.0 - t),

            EasingFunction::EaseInOut => {
                if t < 0.5 {
                    2.0 * t * t
                } else {
                    -1.0 + (4.0 - 2.0 * t) * t
                }
            }

            EasingFunction::CubicBezier(x1, y1, x2, y2) => {
                // Use Newton-Raphson method to solve for t given x
                // Then evaluate the Bezier curve at that t to get y
                cubic_bezier(*x1, *y1, *x2, *y2, t)
            }

            EasingFunction::Steps(n, position) => {
                if *n == 0 {
                    return t;
                }

                let steps = *n as f32;
                match position {
                    StepPosition::Start => {
                        (t * steps).ceil() / steps
                    }
                    StepPosition::End => {
                        (t * steps).floor() / steps
                    }
                }
            }

            EasingFunction::Hold => {
                if t < 1.0 {
                    0.0
                } else {
                    1.0
                }
            }
        }
    }
}

/// Cubic Bezier curve evaluation using Newton-Raphson method
fn cubic_bezier(x1: f32, y1: f32, x2: f32, y2: f32, x: f32) -> f32 {
    // Edge cases
    if x <= 0.0 {
        return 0.0;
    }
    if x >= 1.0 {
        return 1.0;
    }

    // For a cubic Bezier curve with control points at (0,0), (x1,y1), (x2,y2), (1,1)
    // The parametric equations are:
    // x(t) = 3(1-t)²t·x1 + 3(1-t)t²·x2 + t³
    // y(t) = 3(1-t)²t·y1 + 3(1-t)t²·y2 + t³

    // Newton-Raphson to find t for given x
    let mut t = x; // Initial guess
    for _ in 0..8 {
        let xt = bezier_x(t, x1, x2);
        let dt = bezier_x_derivative(t, x1, x2);
        if dt.abs() < 1e-6 {
            break;
        }
        t -= (xt - x) / dt;
        t = t.clamp(0.0, 1.0);
    }

    // Evaluate y at the found t
    bezier_y(t, y1, y2)
}

fn bezier_x(t: f32, x1: f32, x2: f32) -> f32 {
    let t2 = t * t;
    let t3 = t2 * t;
    let mt = 1.0 - t;
    let mt2 = mt * mt;

    3.0 * mt2 * t * x1 + 3.0 * mt * t2 * x2 + t3
}

fn bezier_y(t: f32, y1: f32, y2: f32) -> f32 {
    let t2 = t * t;
    let t3 = t2 * t;
    let mt = 1.0 - t;
    let mt2 = mt * mt;

    3.0 * mt2 * t * y1 + 3.0 * mt * t2 * y2 + t3
}

fn bezier_x_derivative(t: f32, x1: f32, x2: f32) -> f32 {
    let t2 = t * t;
    let mt = 1.0 - t;

    3.0 * mt * mt * x1 + 6.0 * mt * t * (x2 - x1) + 3.0 * t2 * (1.0 - x2)
}

/// A keyframe with a time, value, and easing function
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Keyframe<T: Interpolate> {
    /// Time in milliseconds
    pub time_ms: f64,
    /// Value at this keyframe
    pub value: T,
    /// Easing function to use when interpolating TO this keyframe
    pub easing: EasingFunction,
}

impl<T: Interpolate> Keyframe<T> {
    /// Create a new keyframe
    ///
    /// # Arguments
    ///
    /// * `time_ms` - Time in milliseconds
    /// * `value` - Value at this keyframe
    /// * `easing` - Easing function to use when interpolating TO this keyframe
    pub fn new(time_ms: f64, value: T, easing: EasingFunction) -> Self {
        Self {
            time_ms,
            value,
            easing,
        }
    }
}

/// A collection of keyframes that can be interpolated at any time
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimatedProperty<T: Interpolate> {
    keyframes: Vec<Keyframe<T>>,
}

impl<T: Interpolate> AnimatedProperty<T> {
    /// Create a new animated property with no keyframes
    pub fn new() -> Self {
        Self {
            keyframes: Vec::new(),
        }
    }

    /// Create a new animated property with initial keyframes
    pub fn with_keyframes(keyframes: Vec<Keyframe<T>>) -> Self {
        let mut property = Self::new();
        for keyframe in keyframes {
            property.add_keyframe(keyframe);
        }
        property
    }

    /// Add a keyframe to the property
    ///
    /// Keyframes are automatically sorted by time
    pub fn add_keyframe(&mut self, keyframe: Keyframe<T>) {
        self.keyframes.push(keyframe);
        self.keyframes.sort_by(|a, b| a.time_ms.partial_cmp(&b.time_ms).unwrap());
    }

    /// Get the value at a specific time
    ///
    /// # Arguments
    ///
    /// * `time_ms` - Time in milliseconds
    ///
    /// # Returns
    ///
    /// Interpolated value at the given time
    ///
    /// If time is before the first keyframe, returns the first keyframe's value.
    /// If time is after the last keyframe, returns the last keyframe's value.
    pub fn value_at(&self, time_ms: f64) -> T {
        if self.keyframes.is_empty() {
            panic!("AnimatedProperty has no keyframes");
        }

        // Before first keyframe
        if time_ms <= self.keyframes[0].time_ms {
            return self.keyframes[0].value.clone();
        }

        // After last keyframe
        if time_ms >= self.keyframes[self.keyframes.len() - 1].time_ms {
            return self.keyframes[self.keyframes.len() - 1].value.clone();
        }

        // Find bracketing keyframes
        for i in 0..self.keyframes.len() - 1 {
            let k1 = &self.keyframes[i];
            let k2 = &self.keyframes[i + 1];

            if time_ms >= k1.time_ms && time_ms <= k2.time_ms {
                // Calculate normalized progress
                let duration = k2.time_ms - k1.time_ms;
                if duration <= 0.0 {
                    return k1.value.clone();
                }

                let t = ((time_ms - k1.time_ms) / duration) as f32;

                // Apply easing function from k2 (easing TO the next keyframe)
                let eased_t = k2.easing.apply(t);

                // Interpolate
                return T::lerp(&k1.value, &k2.value, eased_t);
            }
        }

        // Fallback (should never reach here)
        self.keyframes[self.keyframes.len() - 1].value.clone()
    }

    /// Get the number of keyframes
    pub fn len(&self) -> usize {
        self.keyframes.len()
    }

    /// Check if the property has no keyframes
    pub fn is_empty(&self) -> bool {
        self.keyframes.is_empty()
    }
}

impl<T: Interpolate> Default for AnimatedProperty<T> {
    fn default() -> Self {
        Self::new()
    }
}

// Implement Interpolate for f32
impl Interpolate for f32 {
    fn lerp(a: &Self, b: &Self, t: f32) -> Self {
        a + (b - a) * t
    }
}

// Implement Interpolate for Point
impl Interpolate for Point {
    fn lerp(a: &Self, b: &Self, t: f32) -> Self {
        Point {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t,
        }
    }
}

// Implement Interpolate for Color (u8 values)
impl Interpolate for Color {
    fn lerp(a: &Self, b: &Self, t: f32) -> Self {
        Color {
            r: (a.r as f32 + (b.r as f32 - a.r as f32) * t).round() as u8,
            g: (a.g as f32 + (b.g as f32 - a.g as f32) * t).round() as u8,
            b: (a.b as f32 + (b.b as f32 - a.b as f32) * t).round() as u8,
            a: (a.a as f32 + (b.a as f32 - a.a as f32) * t).round() as u8,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Test-3.1.A: Linear interpolation
    #[test]
    fn test_linear_interpolation() {
        let mut property = AnimatedProperty::new();
        property.add_keyframe(Keyframe::new(0.0, 0.0, EasingFunction::Linear));
        property.add_keyframe(Keyframe::new(1000.0, 100.0, EasingFunction::Linear));

        assert_eq!(property.value_at(0.0), 0.0);
        assert!((property.value_at(500.0) - 50.0).abs() < 0.01);
        assert_eq!(property.value_at(1000.0), 100.0);
    }

    // Test-3.1.B: EaseInOut behavior
    #[test]
    fn test_ease_in_out() {
        let mut property = AnimatedProperty::new();
        property.add_keyframe(Keyframe::new(0.0, 0.0, EasingFunction::Linear));
        property.add_keyframe(Keyframe::new(1000.0, 100.0, EasingFunction::EaseInOut));

        let val_250 = property.value_at(250.0);
        let val_500 = property.value_at(500.0);
        let val_750 = property.value_at(750.0);

        // EaseInOut should be slower at the start and end
        assert!(val_250 < 25.0, "value_at(250) = {} should be < 25.0", val_250);
        assert!(val_750 > 75.0, "value_at(750) = {} should be > 75.0", val_750);
        assert!((val_500 - 50.0).abs() < 2.0, "value_at(500) = {} should be ~50.0", val_500);
    }

    // Test-3.1.C: CubicBezier monotonically increasing
    #[test]
    fn test_cubic_bezier_monotonic() {
        let mut property = AnimatedProperty::new();
        property.add_keyframe(Keyframe::new(0.0, 0.0, EasingFunction::Linear));
        property.add_keyframe(Keyframe::new(1000.0, 100.0, EasingFunction::CubicBezier(0.42, 0.0, 0.58, 1.0)));

        let mut prev_val = property.value_at(0.0);
        assert!((prev_val - 0.0).abs() < 0.01);

        // Check monotonically increasing at 10 sample points
        for i in 1..=10 {
            let time = (i as f64) * 100.0;
            let val = property.value_at(time);
            assert!(val >= prev_val, "Value should be monotonically increasing at t={}: {} >= {}", time, val, prev_val);
            prev_val = val;
        }

        assert!((prev_val - 100.0).abs() < 0.01);
    }

    // Test-3.1.D: Steps(4, End)
    #[test]
    fn test_steps_end() {
        let mut property = AnimatedProperty::new();
        property.add_keyframe(Keyframe::new(0.0, 0.0, EasingFunction::Linear));
        property.add_keyframe(Keyframe::new(1000.0, 100.0, EasingFunction::Steps(4, StepPosition::End)));

        assert_eq!(property.value_at(0.0), 0.0);
        assert_eq!(property.value_at(249.0), 0.0);
        assert!((property.value_at(250.0) - 25.0).abs() < 0.01);
        assert!((property.value_at(999.0) - 75.0).abs() < 0.01);
        assert_eq!(property.value_at(1000.0), 100.0);
    }

    // Test-3.1.E: Hold
    #[test]
    fn test_hold() {
        let mut property = AnimatedProperty::new();
        property.add_keyframe(Keyframe::new(0.0, 0.0, EasingFunction::Linear));
        property.add_keyframe(Keyframe::new(1000.0, 100.0, EasingFunction::Hold));

        assert_eq!(property.value_at(0.0), 0.0);
        assert_eq!(property.value_at(999.0), 0.0);
        assert_eq!(property.value_at(1000.0), 100.0);
    }

    // Test-3.1.F: Before first and after last keyframe
    #[test]
    fn test_before_and_after() {
        let mut property = AnimatedProperty::new();
        property.add_keyframe(Keyframe::new(500.0, 50.0, EasingFunction::Linear));
        property.add_keyframe(Keyframe::new(1000.0, 100.0, EasingFunction::Linear));

        // Before first keyframe
        assert_eq!(property.value_at(0.0), property.value_at(500.0));
        assert_eq!(property.value_at(0.0), 50.0);

        // After last keyframe
        assert_eq!(property.value_at(2000.0), property.value_at(1000.0));
        assert_eq!(property.value_at(2000.0), 100.0);
    }

    // Additional tests for Point interpolation
    #[test]
    fn test_point_interpolation() {
        let mut property = AnimatedProperty::new();
        property.add_keyframe(Keyframe::new(0.0, Point::new(0.0, 0.0), EasingFunction::Linear));
        property.add_keyframe(Keyframe::new(1000.0, Point::new(100.0, 200.0), EasingFunction::Linear));

        let mid = property.value_at(500.0);
        assert!((mid.x - 50.0).abs() < 0.01);
        assert!((mid.y - 100.0).abs() < 0.01);
    }

    // Additional tests for Color interpolation
    #[test]
    fn test_color_interpolation() {
        let mut property = AnimatedProperty::new();
        property.add_keyframe(Keyframe::new(0.0, Color::new(0, 0, 0, 0), EasingFunction::Linear));
        property.add_keyframe(Keyframe::new(1000.0, Color::new(100, 200, 50, 255), EasingFunction::Linear));

        let mid = property.value_at(500.0);
        // Should be approximately halfway
        assert!((mid.r as i32 - 50).abs() <= 1);
        assert!((mid.g as i32 - 100).abs() <= 1);
        assert!((mid.b as i32 - 25).abs() <= 1);
        assert!((mid.a as i32 - 128).abs() <= 1);
    }

    // Test easing function edge cases
    #[test]
    fn test_easing_clamp() {
        let easing = EasingFunction::Linear;
        assert_eq!(easing.apply(-0.5), 0.0);
        assert_eq!(easing.apply(1.5), 1.0);
    }

    // Test steps with zero steps (edge case)
    #[test]
    fn test_steps_zero() {
        let easing = EasingFunction::Steps(0, StepPosition::End);
        let result = easing.apply(0.5);
        assert_eq!(result, 0.5);
    }

    // Test ease functions produce expected values
    #[test]
    fn test_ease_in() {
        let easing = EasingFunction::EaseIn;
        assert!((easing.apply(0.5) - 0.25).abs() < 0.01);
    }

    #[test]
    fn test_ease_out() {
        let easing = EasingFunction::EaseOut;
        assert!((easing.apply(0.5) - 0.75).abs() < 0.01);
    }
}
