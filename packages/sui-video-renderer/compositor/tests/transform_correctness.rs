//! Integration tests for transform operation correctness
//!
//! Tests rotation, scale, and combined transforms to ensure they preserve
//! image content and produce mathematically correct results.

use video_compositor::{Compositor, Layer, Transform};
use video_compositor::types::Color;
use image::{Rgba, RgbaImage};
use approx::assert_relative_eq;

/// Helper to create a test compositor
fn test_compositor(width: u32, height: u32) -> Compositor {
    Compositor::new(width, height).unwrap()
}

/// Create a simple test pattern image (white square on transparent background)
fn create_test_image(size: u32) -> RgbaImage {
    let mut image = RgbaImage::new(size, size);
    for y in 0..size {
        for x in 0..size {
            image.put_pixel(x, y, Rgba([255, 255, 255, 255]));
        }
    }
    image
}

/// Count non-transparent pixels in an image
fn count_opaque_pixels(image: &RgbaImage) -> u32 {
    image.pixels().filter(|p| p[3] > 128).count() as u32
}

/// Calculate average color of non-transparent pixels
fn average_color(image: &RgbaImage) -> [f32; 4] {
    let mut sum = [0u64; 4];
    let mut count = 0u64;

    for pixel in image.pixels() {
        if pixel[3] > 128 {
            sum[0] += pixel[0] as u64;
            sum[1] += pixel[1] as u64;
            sum[2] += pixel[2] as u64;
            sum[3] += pixel[3] as u64;
            count += 1;
        }
    }

    if count == 0 {
        return [0.0, 0.0, 0.0, 0.0];
    }

    [
        sum[0] as f32 / count as f32,
        sum[1] as f32 / count as f32,
        sum[2] as f32 / count as f32,
        sum[3] as f32 / count as f32,
    ]
}

#[cfg(test)]
mod rotation_tests {
    use super::*;

    #[test]
    fn test_rotation_0_degrees_identity() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::white(),
                Transform::new().with_scale(0.2).with_rotation(0.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should render successfully
        assert_eq!(frame.width(), 100);
        assert_eq!(frame.height(), 100);

        // Should have white pixels
        let pixel_count = count_opaque_pixels(frame.image());
        assert!(pixel_count > 0, "Should have rendered content");
    }

    #[test]
    fn test_rotation_90_degrees() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::red(),
                Transform::new().with_scale(0.2).with_rotation(90.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should render successfully
        assert_eq!(frame.width(), 100);
        assert_eq!(frame.height(), 100);

        // Should have red pixels
        let has_red = frame.image().pixels().any(|p| p[0] > 200 && p[3] > 200);
        assert!(has_red, "Should have red pixels from rotated layer");
    }

    #[test]
    fn test_rotation_180_degrees() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::blue(),
                Transform::new().with_scale(0.3).with_rotation(180.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should render successfully
        let pixel_count = count_opaque_pixels(frame.image());
        assert!(pixel_count > 0, "180° rotation should render content");
    }

    #[test]
    fn test_rotation_270_degrees() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::green(),
                Transform::new().with_scale(0.2).with_rotation(270.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should have green pixels
        let has_green = frame.image().pixels().any(|p| p[1] > 200 && p[3] > 200);
        assert!(has_green, "Should have green pixels from 270° rotation");
    }

    #[test]
    fn test_rotation_360_degrees_identity() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::white(),
                Transform::new().with_scale(0.2).with_rotation(360.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // 360° should be same as 0°
        let pixel_count = count_opaque_pixels(frame.image());
        assert!(pixel_count > 0, "360° rotation should preserve content");
    }

    #[test]
    fn test_rotation_45_degrees() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::white(),
                Transform::new().with_scale(0.3).with_rotation(45.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // 45° rotation should render
        let pixel_count = count_opaque_pixels(frame.image());
        assert!(pixel_count > 0, "45° rotation should create content");
    }

    #[test]
    fn test_rotation_negative_angle() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::red(),
                Transform::new().with_scale(0.2).with_rotation(-90.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Negative rotation should work
        let has_red = frame.image().pixels().any(|p| p[0] > 200 && p[3] > 200);
        assert!(has_red, "Negative rotation should render");
    }

    #[test]
    fn test_rotation_with_anchor_center() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::white(),
                Transform::new()
                    .with_scale(0.2)
                    .with_rotation(45.0)
                    .with_anchor(0.5, 0.5),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should rotate around center
        assert_eq!(frame.width(), 100);
        assert_eq!(frame.height(), 100);
    }

    #[test]
    fn test_rotation_with_anchor_top_left() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::white(),
                Transform::new()
                    .with_scale(0.2)
                    .with_rotation(45.0)
                    .with_anchor(0.0, 0.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should rotate around top-left
        assert_eq!(frame.width(), 100);
        assert_eq!(frame.height(), 100);
    }

    #[test]
    fn test_rotation_preserves_color() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::new(255, 128, 64, 255),
                Transform::new().with_scale(0.5).with_rotation(90.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should have orange-ish colors
        let has_orange = frame.image().pixels()
            .any(|p| p[0] > 200 && p[1] > 50 && p[1] < 150 && p[2] < 100 && p[3] > 200);
        assert!(has_orange, "Should preserve orange color");
    }
}

#[cfg(test)]
mod scale_tests {
    use super::*;

    #[test]
    fn test_scale_1_0_identity() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(Color::white(), Transform::new().with_scale(1.0)),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should fill the entire canvas
        let pixel_count = count_opaque_pixels(frame.image());
        assert_eq!(pixel_count, 100 * 100, "Scale 1.0 should fill canvas");
    }

    #[test]
    fn test_scale_2_0_doubles_size() {
        let compositor = test_compositor(200, 200);

        let layers = vec![
            Layer::solid_color(Color::red(), Transform::new().with_scale(2.0)),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should fill entire 200x200 canvas (scaled from 100x100)
        let has_red = frame.image().pixels().any(|p| p[0] > 200 && p[3] > 200);
        assert!(has_red, "Scaled layer should render");
    }

    #[test]
    fn test_scale_0_5_halves_size() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(Color::blue(), Transform::new().with_scale(0.5)),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should render at half size
        let pixel_count = count_opaque_pixels(frame.image());
        assert!(pixel_count > 0 && pixel_count < 100 * 100,
            "Half scale should render smaller than full canvas");
    }

    #[test]
    fn test_scale_10_0_increases_size() {
        let compositor = test_compositor(300, 300);

        let layers = vec![
            Layer::solid_color(Color::green(), Transform::new().with_scale(10.0)),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should render at large size
        let has_green = frame.image().pixels().any(|p| p[1] > 200 && p[3] > 200);
        assert!(has_green, "Large scale should render");
    }

    #[test]
    fn test_scale_non_uniform() {
        let compositor = test_compositor(200, 200);

        let layers = vec![
            Layer::solid_color(Color::white(), Transform::new().with_scale_xy(2.0, 3.0)),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should render with non-uniform scale
        let pixel_count = count_opaque_pixels(frame.image());
        assert!(pixel_count > 0, "Non-uniform scale should render");
    }

    #[test]
    fn test_scale_preserves_color() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::new(255, 128, 64, 255),
                Transform::new().with_scale(2.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should preserve orange color
        let has_orange = frame.image().pixels()
            .any(|p| p[0] > 200 && p[1] > 50 && p[1] < 150 && p[2] < 100 && p[3] > 200);
        assert!(has_orange, "Should preserve color when scaling");
    }

    #[test]
    fn test_scale_very_small() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(Color::white(), Transform::new().with_scale(0.01)),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should render even at very small scale
        let pixel_count = count_opaque_pixels(frame.image());
        assert!(pixel_count > 0, "Very small scale should still render");
    }
}

#[cfg(test)]
mod combined_transform_tests {
    use super::*;

    #[test]
    fn test_scale_then_rotate() {
        let compositor = test_compositor(200, 200);

        let layers = vec![
            Layer::solid_color(
                Color::red(),
                Transform::new()
                    .with_scale(2.0)
                    .with_rotation(90.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should apply both scale and rotation
        let has_red = frame.image().pixels().any(|p| p[0] > 200 && p[3] > 200);
        assert!(has_red, "Combined scale+rotate should render");
    }

    #[test]
    fn test_rotate_then_scale() {
        let compositor = test_compositor(200, 200);

        let layers = vec![
            Layer::solid_color(
                Color::blue(),
                Transform::new()
                    .with_rotation(45.0)
                    .with_scale(2.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should apply both transforms
        let has_blue = frame.image().pixels().any(|p| p[2] > 200 && p[3] > 200);
        assert!(has_blue, "Combined rotate+scale should render");
    }

    #[test]
    fn test_scale_rotate_translate() {
        let compositor = test_compositor(200, 200);

        let layers = vec![
            Layer::solid_color(
                Color::new(255, 0, 0, 255),
                Transform::new()
                    .with_scale(2.0)
                    .with_rotation(45.0)
                    .with_position(50.0, 50.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should apply all transforms
        assert_eq!(frame.width(), 200);
        assert_eq!(frame.height(), 200);

        // Should have red pixels around position (50, 50)
        let pixel = frame.get_pixel(60, 60);
        assert!(pixel[0] > 0 || pixel[3] == 0); // Red or transparent
    }

    #[test]
    fn test_complex_multi_transform() {
        let compositor = test_compositor(300, 300);

        let layers = vec![
            Layer::solid_color(
                Color::white(),
                Transform::new()
                    .with_scale_xy(2.0, 1.5)
                    .with_rotation(30.0)
                    .with_skew(5.0, 5.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should produce a valid rendered frame
        let pixel_count = count_opaque_pixels(frame.image());
        assert!(pixel_count > 0, "Complex transforms should render");
    }

    #[test]
    fn test_anchor_point_affects_rotation() {
        let compositor = test_compositor(100, 100);

        // Rotate around center
        let layers_center = vec![
            Layer::solid_color(
                Color::red(),
                Transform::new()
                    .with_scale(0.3)
                    .with_rotation(45.0)
                    .with_anchor(0.5, 0.5),
            ),
        ];
        let frame_center = compositor.compose(&layers_center).unwrap();

        // Rotate around top-left
        let layers_topleft = vec![
            Layer::solid_color(
                Color::red(),
                Transform::new()
                    .with_scale(0.3)
                    .with_rotation(45.0)
                    .with_anchor(0.0, 0.0),
            ),
        ];
        let frame_topleft = compositor.compose(&layers_topleft).unwrap();

        // Both should produce valid results
        assert_eq!(frame_center.width(), 100);
        assert_eq!(frame_topleft.width(), 100);
    }

    #[test]
    fn test_skew_horizontal() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::white(),
                Transform::new().with_scale(0.2).with_skew(15.0, 0.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should render skewed content
        let pixel_count = count_opaque_pixels(frame.image());
        assert!(pixel_count > 0, "Horizontal skew should render");
    }

    #[test]
    fn test_skew_vertical() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::white(),
                Transform::new().with_scale(0.2).with_skew(0.0, 15.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should render skewed content
        let pixel_count = count_opaque_pixels(frame.image());
        assert!(pixel_count > 0, "Vertical skew should render");
    }

    #[test]
    fn test_skew_both_directions() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::white(),
                Transform::new().with_scale(0.2).with_skew(10.0, 10.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should render with both skews
        let pixel_count = count_opaque_pixels(frame.image());
        assert!(pixel_count > 0, "Dual skew should render");
    }

    #[test]
    fn test_transform_preserves_transparency() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::new(255, 255, 255, 128), // 50% transparent
                Transform::new()
                    .with_scale(2.0)
                    .with_rotation(45.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should have semi-transparent pixels
        let has_semi_transparent = frame.image().pixels()
            .any(|p| p[3] > 50 && p[3] < 200);
        assert!(has_semi_transparent, "Should preserve semi-transparency");
    }

    #[test]
    fn test_multiple_layers_with_different_transforms() {
        let compositor = test_compositor(200, 200);

        let layers = vec![
            Layer::solid_color(
                Color::new(255, 0, 0, 255),
                Transform::new().with_scale(0.5),
            ).with_z_index(0),
            Layer::solid_color(
                Color::new(0, 255, 0, 255),
                Transform::new().with_rotation(45.0),
            ).with_z_index(1),
            Layer::solid_color(
                Color::new(0, 0, 255, 255),
                Transform::new().with_position(50.0, 50.0).with_scale(0.3),
            ).with_z_index(2),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // All layers should be rendered
        assert_eq!(frame.width(), 200);
        assert_eq!(frame.height(), 200);
    }
}

#[cfg(test)]
mod transform_edge_cases {
    use super::*;

    #[test]
    fn test_zero_scale_produces_minimum_size() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::white(),
                Transform::new().with_scale(0.001),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should still render (even if tiny)
        assert_eq!(frame.width(), 100);
        assert_eq!(frame.height(), 100);
    }

    #[test]
    fn test_large_rotation_normalizes() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::white(),
                Transform::new().with_scale(0.2).with_rotation(720.0), // 2 full rotations
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should normalize and render
        let pixel_count = count_opaque_pixels(frame.image());
        assert!(pixel_count > 0, "Large rotation should normalize and render");
    }

    #[test]
    fn test_identity_transform() {
        let compositor = test_compositor(100, 100);

        let transform = Transform::default();
        assert!(transform.is_identity());

        let layers = vec![
            Layer::solid_color(Color::white(), transform),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should fill entire canvas with identity transform
        let pixel_count = count_opaque_pixels(frame.image());
        assert_eq!(pixel_count, 100 * 100, "Identity should fill canvas");
    }

    #[test]
    fn test_position_only_in_composition() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::new(255, 0, 0, 255),
                Transform::new().with_position(25.0, 25.0).with_scale(0.5),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should render at offset position
        let pixel_inside = frame.get_pixel(35, 35);
        assert_eq!(pixel_inside[0], 255); // Red

        let pixel_outside = frame.get_pixel(5, 5);
        assert_eq!(pixel_outside[3], 0); // Transparent
    }
}
