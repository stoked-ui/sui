//! Integration tests for blend mode accuracy
//!
//! Tests all 18 blend modes with known input/output pairs to verify
//! mathematical correctness and edge case handling.

use video_compositor::{BlendMode, Compositor, Layer, Transform};
use video_compositor::types::Color;

/// Helper to create a test compositor
fn test_compositor(width: u32, height: u32) -> Compositor {
    Compositor::new(width, height).unwrap()
}

/// Test blend mode with specific colors
fn test_blend_colors(blend_mode: BlendMode, bottom: [u8; 4], top: [u8; 4]) -> [u8; 4] {
    blend_mode.blend(bottom, top)
}

#[cfg(test)]
mod blend_mode_tests {
    use super::*;

    // Normal Blend Tests
    #[test]
    fn test_normal_blend_opaque_over_opaque() {
        let bottom = [255, 0, 0, 255]; // Red
        let top = [0, 255, 0, 255]; // Green
        let result = test_blend_colors(BlendMode::Normal, bottom, top);

        // Top layer is fully opaque, should completely replace bottom
        assert_eq!(result[0], 0); // No red
        assert_eq!(result[1], 255); // Full green
        assert_eq!(result[2], 0); // No blue
        assert_eq!(result[3], 255); // Full alpha
    }

    #[test]
    fn test_normal_blend_transparent_source() {
        let bottom = [255, 0, 0, 255]; // Red
        let top = [0, 255, 0, 0]; // Transparent green
        let result = test_blend_colors(BlendMode::Normal, bottom, top);

        // Top layer is fully transparent, should not affect bottom
        assert_eq!(result[0], 255);
        assert_eq!(result[1], 0);
        assert_eq!(result[2], 0);
        assert_eq!(result[3], 255);
    }

    #[test]
    fn test_normal_blend_semi_transparent() {
        let bottom = [255, 0, 0, 255]; // Red
        let top = [0, 255, 0, 128]; // 50% transparent green
        let result = test_blend_colors(BlendMode::Normal, bottom, top);

        // Should blend red and green
        assert!(result[0] > 0 && result[0] < 255); // Some red
        assert!(result[1] > 0 && result[1] < 255); // Some green
        assert_eq!(result[2], 0); // No blue
        assert_eq!(result[3], 255); // Full alpha
    }

    #[test]
    fn test_normal_blend_both_transparent() {
        let bottom = [255, 0, 0, 0]; // Transparent red
        let top = [0, 255, 0, 0]; // Transparent green
        let result = test_blend_colors(BlendMode::Normal, bottom, top);

        // Both transparent should result in transparent
        assert_eq!(result[3], 0);
    }

    // Multiply Blend Tests
    #[test]
    fn test_multiply_blend_white_over_color() {
        let bottom = [255, 128, 64, 255]; // Orange
        let top = [255, 255, 255, 255]; // White
        let result = test_blend_colors(BlendMode::Multiply, bottom, top);

        // Multiply with white should preserve original
        assert_eq!(result[0], 255);
        assert_eq!(result[1], 128);
        assert_eq!(result[2], 64);
    }

    #[test]
    fn test_multiply_blend_black_over_color() {
        let bottom = [255, 128, 64, 255]; // Orange
        let top = [0, 0, 0, 255]; // Black
        let result = test_blend_colors(BlendMode::Multiply, bottom, top);

        // Multiply with black should produce black
        assert_eq!(result[0], 0);
        assert_eq!(result[1], 0);
        assert_eq!(result[2], 0);
    }

    #[test]
    fn test_multiply_blend_gray_darkens() {
        let bottom = [200, 200, 200, 255]; // Light gray
        let top = [128, 128, 128, 255]; // Mid gray
        let result = test_blend_colors(BlendMode::Multiply, bottom, top);

        // Multiply should darken
        assert!(result[0] < 200);
        assert!(result[1] < 200);
        assert!(result[2] < 200);
    }

    // Screen Blend Tests
    #[test]
    fn test_screen_blend_black_over_color() {
        let bottom = [255, 128, 64, 255]; // Orange
        let top = [0, 0, 0, 255]; // Black
        let result = test_blend_colors(BlendMode::Screen, bottom, top);

        // Screen with black should preserve original (allow ±1 for rounding)
        assert!((result[0] as i16 - 255).abs() <= 1);
        assert!((result[1] as i16 - 128).abs() <= 1);
        assert!((result[2] as i16 - 64).abs() <= 1);
    }

    #[test]
    fn test_screen_blend_white_over_color() {
        let bottom = [128, 64, 32, 255]; // Dark orange
        let top = [255, 255, 255, 255]; // White
        let result = test_blend_colors(BlendMode::Screen, bottom, top);

        // Screen with white should produce white
        assert_eq!(result[0], 255);
        assert_eq!(result[1], 255);
        assert_eq!(result[2], 255);
    }

    #[test]
    fn test_screen_blend_gray_lightens() {
        let bottom = [100, 100, 100, 255]; // Dark gray
        let top = [128, 128, 128, 255]; // Mid gray
        let result = test_blend_colors(BlendMode::Screen, bottom, top);

        // Screen should lighten
        assert!(result[0] > 100);
        assert!(result[1] > 100);
        assert!(result[2] > 100);
    }

    // Overlay Blend Tests
    #[test]
    fn test_overlay_blend_dark_base() {
        let bottom = [64, 64, 64, 255]; // Dark gray (< 0.5)
        let top = [128, 128, 128, 255]; // Mid gray
        let result = test_blend_colors(BlendMode::Overlay, bottom, top);

        // Overlay darkens when base < 0.5 (multiply mode)
        assert!(result[0] < 128);
        assert!(result[1] < 128);
        assert!(result[2] < 128);
    }

    #[test]
    fn test_overlay_blend_light_base() {
        let bottom = [192, 192, 192, 255]; // Light gray (> 0.5)
        let top = [128, 128, 128, 255]; // Mid gray
        let result = test_blend_colors(BlendMode::Overlay, bottom, top);

        // Overlay lightens when base > 0.5 (screen mode)
        assert!(result[0] > 128);
        assert!(result[1] > 128);
        assert!(result[2] > 128);
    }

    // Darken/Lighten Tests
    #[test]
    fn test_darken_blend() {
        let bottom = [200, 100, 50, 255];
        let top = [100, 150, 75, 255];
        let result = test_blend_colors(BlendMode::Darken, bottom, top);

        // Should use darker value from each channel
        assert_eq!(result[0], 100); // min(200, 100)
        assert_eq!(result[1], 100); // min(100, 150)
        assert_eq!(result[2], 50); // min(50, 75)
    }

    #[test]
    fn test_lighten_blend() {
        let bottom = [200, 100, 50, 255];
        let top = [100, 150, 75, 255];
        let result = test_blend_colors(BlendMode::Lighten, bottom, top);

        // Should use lighter value from each channel
        assert_eq!(result[0], 200); // max(200, 100)
        assert_eq!(result[1], 150); // max(100, 150)
        assert_eq!(result[2], 75); // max(50, 75)
    }

    // Color Dodge Tests
    #[test]
    fn test_color_dodge_white() {
        let bottom = [128, 128, 128, 255];
        let top = [255, 255, 255, 255]; // White
        let result = test_blend_colors(BlendMode::ColorDodge, bottom, top);

        // Dodging with white should produce white
        assert_eq!(result[0], 255);
        assert_eq!(result[1], 255);
        assert_eq!(result[2], 255);
    }

    #[test]
    fn test_color_dodge_black() {
        let bottom = [128, 128, 128, 255];
        let top = [0, 0, 0, 255]; // Black
        let result = test_blend_colors(BlendMode::ColorDodge, bottom, top);

        // Dodging with black should preserve base (128/1 = 128)
        assert_eq!(result[0], 128);
        assert_eq!(result[1], 128);
        assert_eq!(result[2], 128);
    }

    // Color Burn Tests
    #[test]
    fn test_color_burn_black() {
        let bottom = [128, 128, 128, 255];
        let top = [0, 0, 0, 255]; // Black
        let result = test_blend_colors(BlendMode::ColorBurn, bottom, top);

        // Burning with black should produce black
        assert_eq!(result[0], 0);
        assert_eq!(result[1], 0);
        assert_eq!(result[2], 0);
    }

    #[test]
    fn test_color_burn_white() {
        let bottom = [128, 128, 128, 255];
        let top = [255, 255, 255, 255]; // White
        let result = test_blend_colors(BlendMode::ColorBurn, bottom, top);

        // Burning with white should preserve base
        assert_eq!(result[0], 128);
        assert_eq!(result[1], 128);
        assert_eq!(result[2], 128);
    }

    // Hard Light Tests
    #[test]
    fn test_hard_light_dark_top() {
        let bottom = [128, 128, 128, 255];
        let top = [64, 64, 64, 255]; // Dark (< 0.5)
        let result = test_blend_colors(BlendMode::HardLight, bottom, top);

        // Hard light darkens when top < 0.5
        assert!(result[0] < 128);
        assert!(result[1] < 128);
        assert!(result[2] < 128);
    }

    #[test]
    fn test_hard_light_light_top() {
        let bottom = [128, 128, 128, 255];
        let top = [192, 192, 192, 255]; // Light (> 0.5)
        let result = test_blend_colors(BlendMode::HardLight, bottom, top);

        // Hard light lightens when top > 0.5
        assert!(result[0] > 128);
        assert!(result[1] > 128);
        assert!(result[2] > 128);
    }

    // Soft Light Tests
    #[test]
    fn test_soft_light_dark_top() {
        let bottom = [128, 128, 128, 255];
        let top = [64, 64, 64, 255]; // Dark (< 0.5)
        let result = test_blend_colors(BlendMode::SoftLight, bottom, top);

        // Soft light darkens when top < 0.5
        assert!(result[0] < 128);
        assert!(result[1] < 128);
        assert!(result[2] < 128);
    }

    #[test]
    fn test_soft_light_light_top() {
        let bottom = [128, 128, 128, 255];
        let top = [192, 192, 192, 255]; // Light (> 0.5)
        let result = test_blend_colors(BlendMode::SoftLight, bottom, top);

        // Soft light lightens when top > 0.5
        assert!(result[0] > 128);
        assert!(result[1] > 128);
        assert!(result[2] > 128);
    }

    // Difference Tests
    #[test]
    fn test_difference_identical_colors() {
        let bottom = [100, 150, 200, 255];
        let top = [100, 150, 200, 255]; // Same as bottom
        let result = test_blend_colors(BlendMode::Difference, bottom, top);

        // Same colors should produce black
        assert_eq!(result[0], 0);
        assert_eq!(result[1], 0);
        assert_eq!(result[2], 0);
    }

    #[test]
    fn test_difference_opposite_colors() {
        let bottom = [200, 100, 50, 255];
        let top = [50, 150, 200, 255];
        let result = test_blend_colors(BlendMode::Difference, bottom, top);

        // Should be absolute difference
        assert_eq!(result[0], 150); // |200 - 50|
        assert_eq!(result[1], 50); // |100 - 150|
        assert_eq!(result[2], 150); // |50 - 200|
    }

    // Exclusion Tests
    #[test]
    fn test_exclusion_identical_colors() {
        let bottom = [128, 128, 128, 255];
        let top = [128, 128, 128, 255];
        let result = test_blend_colors(BlendMode::Exclusion, bottom, top);

        // Exclusion of identical colors produces mid-gray, not black
        assert!(result[0] > 0);
        assert!(result[1] > 0);
        assert!(result[2] > 0);
    }

    #[test]
    fn test_exclusion_black_and_white() {
        let bottom = [0, 0, 0, 255]; // Black
        let top = [255, 255, 255, 255]; // White
        let result = test_blend_colors(BlendMode::Exclusion, bottom, top);

        // Exclusion of black and white should produce white
        assert_eq!(result[0], 255);
        assert_eq!(result[1], 255);
        assert_eq!(result[2], 255);
    }

    // Add/Subtract Tests
    #[test]
    fn test_add_blend_no_overflow() {
        let bottom = [100, 100, 100, 255];
        let top = [50, 50, 50, 255];
        let result = test_blend_colors(BlendMode::Add, bottom, top);

        // Should add values
        assert_eq!(result[0], 150);
        assert_eq!(result[1], 150);
        assert_eq!(result[2], 150);
    }

    #[test]
    fn test_add_blend_with_clipping() {
        let bottom = [200, 200, 200, 255];
        let top = [100, 100, 100, 255];
        let result = test_blend_colors(BlendMode::Add, bottom, top);

        // Should clip at 255
        assert_eq!(result[0], 255);
        assert_eq!(result[1], 255);
        assert_eq!(result[2], 255);
    }

    #[test]
    fn test_subtract_blend_no_underflow() {
        let bottom = [150, 150, 150, 255];
        let top = [50, 50, 50, 255];
        let result = test_blend_colors(BlendMode::Subtract, bottom, top);

        // Should subtract values
        assert_eq!(result[0], 100);
        assert_eq!(result[1], 100);
        assert_eq!(result[2], 100);
    }

    #[test]
    fn test_subtract_blend_with_clipping() {
        let bottom = [50, 50, 50, 255];
        let top = [100, 100, 100, 255];
        let result = test_blend_colors(BlendMode::Subtract, bottom, top);

        // Should clip at 0
        assert_eq!(result[0], 0);
        assert_eq!(result[1], 0);
        assert_eq!(result[2], 0);
    }

    // Hue/Saturation/Color/Luminosity Tests
    #[test]
    fn test_hue_blend_preserves_saturation_and_luminosity() {
        let bottom = [0, 0, 255, 255]; // Blue
        let top = [255, 0, 0, 255]; // Red
        let result = test_blend_colors(BlendMode::Hue, bottom, top);

        // Should have red's hue but preserve blue's saturation and luminosity
        // Red hue means R should be dominant
        assert!(result[0] > result[2]); // More red than blue
    }

    #[test]
    fn test_saturation_blend_preserves_hue_and_luminosity() {
        let bottom = [128, 128, 128, 255]; // Gray (no saturation)
        let top = [255, 0, 0, 255]; // Red (high saturation)
        let result = test_blend_colors(BlendMode::Saturation, bottom, top);

        // Should preserve gray's hue but gain saturation from red
        // Result should not be gray anymore
        assert!(result[0] != result[1] || result[1] != result[2]);
    }

    #[test]
    fn test_color_blend_preserves_luminosity() {
        let bottom = [128, 128, 128, 255]; // Mid-gray
        let top = [255, 0, 0, 255]; // Bright red
        let result = test_blend_colors(BlendMode::Color, bottom, top);

        // Should have red's hue and saturation
        assert!(result[0] > result[1]);
        assert!(result[0] > result[2]);
    }

    #[test]
    fn test_luminosity_blend_preserves_hue_and_saturation() {
        let bottom = [64, 64, 64, 255]; // Dark gray
        let top = [200, 200, 200, 255]; // Light gray
        let result = test_blend_colors(BlendMode::Luminosity, bottom, top);

        // Should be brighter (adopt top's luminosity)
        assert!(result[0] > 64);
        assert!(result[1] > 64);
        assert!(result[2] > 64);
    }
}

#[cfg(test)]
mod layer_composition_blend_tests {
    use super::*;

    /// Test blend modes in actual layer composition
    #[test]
    fn test_multiply_in_composition() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(Color::new(255, 255, 255, 255), Transform::default()), // White background
            Layer::solid_color(Color::new(128, 128, 128, 255), Transform::default())
                .with_blend_mode(BlendMode::Multiply),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Multiply gray over white should produce gray
        let pixel = frame.get_pixel(50, 50);
        assert!(pixel[0] < 255);
        assert!(pixel[1] < 255);
        assert!(pixel[2] < 255);
    }

    #[test]
    fn test_screen_in_composition() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(Color::new(64, 64, 64, 255), Transform::default()), // Dark background
            Layer::solid_color(Color::new(128, 128, 128, 255), Transform::default())
                .with_blend_mode(BlendMode::Screen),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Screen should lighten
        let pixel = frame.get_pixel(50, 50);
        assert!(pixel[0] > 64);
        assert!(pixel[1] > 64);
        assert!(pixel[2] > 64);
    }

    #[test]
    fn test_overlay_in_composition() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(Color::new(200, 200, 200, 255), Transform::default()), // Light background
            Layer::solid_color(Color::new(128, 128, 128, 255), Transform::default())
                .with_blend_mode(BlendMode::Overlay),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Overlay over light base should lighten
        let pixel = frame.get_pixel(50, 50);
        assert!(pixel[0] >= 128);
        assert!(pixel[1] >= 128);
        assert!(pixel[2] >= 128);
    }

    #[test]
    fn test_difference_in_composition() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(Color::new(255, 0, 0, 255), Transform::default()), // Red
            Layer::solid_color(Color::new(255, 0, 0, 255), Transform::default()) // Same red
                .with_blend_mode(BlendMode::Difference),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Difference of identical colors should be black
        let pixel = frame.get_pixel(50, 50);
        assert_eq!(pixel[0], 0);
        assert_eq!(pixel[1], 0);
        assert_eq!(pixel[2], 0);
    }

    #[test]
    fn test_add_in_composition() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(Color::new(100, 100, 100, 255), Transform::default()),
            Layer::solid_color(Color::new(50, 50, 50, 255), Transform::default())
                .with_blend_mode(BlendMode::Add),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Add should sum colors
        let pixel = frame.get_pixel(50, 50);
        assert_eq!(pixel[0], 150);
        assert_eq!(pixel[1], 150);
        assert_eq!(pixel[2], 150);
    }

    #[test]
    fn test_multiple_blend_modes_stacked() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(Color::new(255, 255, 255, 255), Transform::default()),
            Layer::solid_color(Color::new(200, 0, 0, 255), Transform::default())
                .with_blend_mode(BlendMode::Multiply)
                .with_z_index(1),
            Layer::solid_color(Color::new(0, 200, 0, 255), Transform::default())
                .with_blend_mode(BlendMode::Screen)
                .with_z_index(2),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should apply both blend modes in order
        let pixel = frame.get_pixel(50, 50);
        assert!(pixel[0] < 255); // Affected by multiply
        assert!(pixel[1] > 0); // Affected by screen
    }
}
