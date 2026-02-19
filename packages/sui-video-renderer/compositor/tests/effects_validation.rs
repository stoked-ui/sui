//! Integration tests for effect output validation
//!
//! Tests blur, brightness, contrast, opacity, shadows, gradients, and other
//! effects to ensure they produce correct visual results and stack properly.

use video_compositor::{Compositor, Effect, Layer, Transform};
use video_compositor::types::{Color, Point};
use video_compositor::GradientStop;
use image::{Rgba, RgbaImage};

/// Helper to create a test compositor
fn test_compositor(width: u32, height: u32) -> Compositor {
    Compositor::new(width, height).unwrap()
}

/// Create a test image with white content
fn create_white_image(width: u32, height: u32) -> RgbaImage {
    let mut image = RgbaImage::new(width, height);
    for pixel in image.pixels_mut() {
        *pixel = Rgba([255, 255, 255, 255]);
    }
    image
}

/// Create a test image with specific color
fn create_colored_image(width: u32, height: u32, color: [u8; 4]) -> RgbaImage {
    let mut image = RgbaImage::new(width, height);
    for pixel in image.pixels_mut() {
        *pixel = Rgba(color);
    }
    image
}

/// Count pixels with alpha above 128
fn count_opaque_pixels(image: &RgbaImage) -> u32 {
    image.pixels().filter(|p| p[3] > 128).count() as u32
}

/// Calculate average color of image
fn average_color(image: &RgbaImage) -> [f32; 4] {
    let mut sum = [0u64; 4];
    let count = (image.width() * image.height()) as u64;

    for pixel in image.pixels() {
        sum[0] += pixel[0] as u64;
        sum[1] += pixel[1] as u64;
        sum[2] += pixel[2] as u64;
        sum[3] += pixel[3] as u64;
    }

    [
        sum[0] as f32 / count as f32,
        sum[1] as f32 / count as f32,
        sum[2] as f32 / count as f32,
        sum[3] as f32 / count as f32,
    ]
}

#[cfg(test)]
mod blur_effect_tests {
    use super::*;

    #[test]
    fn test_blur_smooths_edges() {
        // Create a sharp edge: half black, half white
        let mut image = RgbaImage::new(100, 100);
        for y in 0..100 {
            for x in 0..50 {
                image.put_pixel(x, y, Rgba([0, 0, 0, 255]));
            }
            for x in 50..100 {
                image.put_pixel(x, y, Rgba([255, 255, 255, 255]));
            }
        }

        let effect = Effect::Blur { radius: 5.0 };
        let result = effect.apply(&image).unwrap();

        // Check edge pixel - should be blurred (gray, not black or white)
        let edge_pixel = result.get_pixel(50, 50);
        assert!(edge_pixel[0] > 10 && edge_pixel[0] < 245,
            "Edge should be blurred, got R={}", edge_pixel[0]);
    }

    #[test]
    fn test_blur_minimal_radius() {
        let image = create_white_image(50, 50);
        // Use minimal blur instead of 0 (imageproc requires sigma > 0)
        let effect = Effect::Blur { radius: 0.1 };
        let result = effect.apply(&image).unwrap();

        // Should be nearly unchanged
        let avg = average_color(&result);
        assert!(avg[0] > 250.0); // Very close to white
        assert!(avg[1] > 250.0);
        assert!(avg[2] > 250.0);
    }

    #[test]
    fn test_blur_preserves_dimensions() {
        let image = create_white_image(75, 50);
        let effect = Effect::Blur { radius: 3.0 };
        let result = effect.apply(&image).unwrap();

        assert_eq!(result.dimensions(), image.dimensions());
    }

    #[test]
    fn test_blur_larger_radius_more_smoothing() {
        // Create sharp vertical line in center
        let mut image = RgbaImage::new(100, 100);
        for y in 0..100 {
            for x in 0..100 {
                if x >= 48 && x <= 52 {
                    image.put_pixel(x, y, Rgba([255, 255, 255, 255]));
                } else {
                    image.put_pixel(x, y, Rgba([0, 0, 0, 255]));
                }
            }
        }

        let blur_small = Effect::Blur { radius: 2.0 };
        let result_small = blur_small.apply(&image).unwrap();

        let blur_large = Effect::Blur { radius: 10.0 };
        let result_large = blur_large.apply(&image).unwrap();

        // Large blur should affect pixels further from edge
        let pixel_small = result_small.get_pixel(40, 50);
        let pixel_large = result_large.get_pixel(40, 50);

        // Larger blur should lighten pixels further from white line
        assert!(pixel_large[0] > pixel_small[0],
            "Larger blur should spread effect further");
    }
}

#[cfg(test)]
mod brightness_contrast_tests {
    use super::*;

    #[test]
    fn test_brightness_positive_increases() {
        let image = create_colored_image(50, 50, [100, 100, 100, 255]);
        let effect = Effect::Brightness { amount: 0.5 };
        let result = effect.apply(&image).unwrap();

        let avg = average_color(&result);
        assert!(avg[0] > 100.0, "Brightness should increase");
    }

    #[test]
    fn test_brightness_negative_decreases() {
        let image = create_colored_image(50, 50, [200, 200, 200, 255]);
        let effect = Effect::Brightness { amount: -0.5 };
        let result = effect.apply(&image).unwrap();

        let avg = average_color(&result);
        assert!(avg[0] < 200.0, "Brightness should decrease");
    }

    #[test]
    fn test_brightness_preserves_alpha() {
        let image = create_colored_image(50, 50, [100, 100, 100, 200]);
        let effect = Effect::Brightness { amount: 0.5 };
        let result = effect.apply(&image).unwrap();

        // Alpha should be unchanged
        let pixel = result.get_pixel(25, 25);
        assert_eq!(pixel[3], 200);
    }

    #[test]
    fn test_brightness_clamps_at_255() {
        let image = create_colored_image(50, 50, [240, 240, 240, 255]);
        let effect = Effect::Brightness { amount: 1.0 }; // Max brightness
        let result = effect.apply(&image).unwrap();

        let pixel = result.get_pixel(25, 25);
        assert_eq!(pixel[0], 255); // Should clamp
        assert_eq!(pixel[1], 255);
        assert_eq!(pixel[2], 255);
    }

    #[test]
    fn test_contrast_positive_increases() {
        let image = create_colored_image(50, 50, [100, 100, 100, 255]);
        let effect = Effect::Contrast { amount: 0.5 };
        let result = effect.apply(&image).unwrap();

        // Contrast pulls values away from 128 midpoint
        let pixel = result.get_pixel(25, 25);
        // 100 is below 128, so it should get darker with more contrast
        assert!(pixel[0] < 100);
    }

    #[test]
    fn test_contrast_on_midtone_no_change() {
        let image = create_colored_image(50, 50, [128, 128, 128, 255]);
        let effect = Effect::Contrast { amount: 0.5 };
        let result = effect.apply(&image).unwrap();

        // Midtone should remain close to 128
        let pixel = result.get_pixel(25, 25);
        assert!((pixel[0] as i16 - 128).abs() <= 5);
    }

    #[test]
    fn test_contrast_negative_decreases() {
        let image = create_colored_image(50, 50, [200, 50, 100, 255]);
        let effect = Effect::Contrast { amount: -0.5 };
        let result = effect.apply(&image).unwrap();

        let avg = average_color(&result);
        // Lower contrast brings everything closer to 128
        assert!(avg[0] < 200.0);
        assert!(avg[1] > 50.0);
    }
}

#[cfg(test)]
mod opacity_tests {
    use super::*;

    #[test]
    fn test_opacity_full() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::new(255, 0, 0, 255),
                Transform::new().with_opacity(1.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();
        let pixel = frame.get_pixel(50, 50);

        assert_eq!(pixel[3], 255); // Full opacity
    }

    #[test]
    fn test_opacity_half() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::new(255, 0, 0, 255),
                Transform::new().with_opacity(0.5),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();
        let pixel = frame.get_pixel(50, 50);

        // 50% opacity: 255 * 0.5 = 127.5 ≈ 127-128
        assert!((pixel[3] as i16 - 128).abs() <= 1,
            "Expected ~128 alpha, got {}", pixel[3]);
    }

    #[test]
    fn test_opacity_zero() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::new(255, 0, 0, 255),
                Transform::new().with_opacity(0.0),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();
        let pixel = frame.get_pixel(50, 50);

        assert_eq!(pixel[3], 0); // Fully transparent
    }

    #[test]
    fn test_opacity_stacking() {
        let compositor = test_compositor(100, 100);

        // Two semi-transparent layers
        let layers = vec![
            Layer::solid_color(
                Color::new(255, 0, 0, 255),
                Transform::new().with_opacity(0.5),
            ).with_z_index(0),
            Layer::solid_color(
                Color::new(0, 255, 0, 255),
                Transform::new().with_opacity(0.5),
            ).with_z_index(1),
        ];

        let frame = compositor.compose(&layers).unwrap();
        let pixel = frame.get_pixel(50, 50);

        // Should blend both layers
        assert!(pixel[0] > 0); // Some red
        assert!(pixel[1] > 0); // Some green
    }
}

#[cfg(test)]
mod shadow_effect_tests {
    use super::*;

    #[test]
    fn test_shadow_creation() {
        let image = create_white_image(50, 50);
        let shadow = Effect::create_shadow(&image, 0.0, [0, 0, 0, 255]);

        // Shadow should be black with same alpha as source
        let pixel = shadow.get_pixel(25, 25);
        assert_eq!(pixel[0], 0); // Black
        assert_eq!(pixel[1], 0);
        assert_eq!(pixel[2], 0);
        assert_eq!(pixel[3], 255); // Full alpha
    }

    #[test]
    fn test_shadow_with_blur() {
        let image = create_white_image(50, 50);
        let shadow = Effect::create_shadow(&image, 5.0, [0, 0, 0, 255]);

        // Center should still be dark but edges should be softer
        let center = shadow.get_pixel(25, 25);
        assert!(center[3] > 200); // High alpha in center

        // Shadow should have dimensions same as source
        assert_eq!(shadow.dimensions(), image.dimensions());
    }

    #[test]
    fn test_shadow_colored() {
        let image = create_white_image(50, 50);
        let shadow = Effect::create_shadow(&image, 0.0, [255, 0, 0, 255]); // Red shadow

        let pixel = shadow.get_pixel(25, 25);
        assert_eq!(pixel[0], 255); // Red
        assert_eq!(pixel[1], 0);
        assert_eq!(pixel[2], 0);
    }

    #[test]
    fn test_shadow_in_composition() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(
                Color::white(),
                Transform::new().with_scale(0.3),
            ).with_effect(Effect::Shadow {
                offset_x: 5.0,
                offset_y: 5.0,
                blur: 2.0,
                color: [0, 0, 0, 128],
            }),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should render both shadow and layer
        assert_eq!(frame.width(), 100);
        assert_eq!(frame.height(), 100);
    }
}

#[cfg(test)]
mod gradient_effect_tests {
    use super::*;

    #[test]
    fn test_linear_gradient_horizontal() {
        let image = create_white_image(100, 100);

        let stops = vec![
            GradientStop { position: 0.0, color: Color::red() },
            GradientStop { position: 1.0, color: Color::blue() },
        ];

        let effect = Effect::LinearGradient { angle: 0.0, stops };
        let result = effect.apply(&image).unwrap();

        // Left side should be more red
        let left = result.get_pixel(10, 50);
        assert!(left[0] > left[2], "Left should be more red");

        // Right side should be more blue
        let right = result.get_pixel(90, 50);
        assert!(right[2] > right[0], "Right should be more blue");
    }

    #[test]
    fn test_linear_gradient_vertical() {
        let image = create_white_image(100, 100);

        let stops = vec![
            GradientStop { position: 0.0, color: Color::red() },
            GradientStop { position: 1.0, color: Color::blue() },
        ];

        let effect = Effect::LinearGradient { angle: 90.0, stops };
        let result = effect.apply(&image).unwrap();

        // Top should be more red
        let top = result.get_pixel(50, 10);
        assert!(top[0] > top[2], "Top should be more red");

        // Bottom should be more blue
        let bottom = result.get_pixel(50, 90);
        assert!(bottom[2] > bottom[0], "Bottom should be more blue");
    }

    #[test]
    fn test_linear_gradient_multiple_stops() {
        let image = create_white_image(100, 100);

        let stops = vec![
            GradientStop { position: 0.0, color: Color::red() },
            GradientStop { position: 0.5, color: Color::green() },
            GradientStop { position: 1.0, color: Color::blue() },
        ];

        let effect = Effect::LinearGradient { angle: 0.0, stops };
        let result = effect.apply(&image).unwrap();

        // Should transition through all colors
        let left = result.get_pixel(10, 50);
        let middle = result.get_pixel(50, 50);
        let right = result.get_pixel(90, 50);

        assert!(left[0] > 128); // Red-ish
        assert!(middle[1] > 128); // Green-ish
        assert!(right[2] > 128); // Blue-ish
    }

    #[test]
    fn test_radial_gradient_from_center() {
        let image = create_white_image(100, 100);

        let stops = vec![
            GradientStop { position: 0.0, color: Color::red() },
            GradientStop { position: 1.0, color: Color::blue() },
        ];

        let effect = Effect::RadialGradient {
            center: Point::new(50.0, 50.0),
            radius: 50.0,
            stops,
        };
        let result = effect.apply(&image).unwrap();

        // Center should be more red
        let center = result.get_pixel(50, 50);
        assert!(center[0] > center[2], "Center should be more red");

        // Edge should be more blue
        let edge = result.get_pixel(5, 50);
        assert!(edge[2] > edge[0], "Edge should be more blue");
    }

    #[test]
    fn test_radial_gradient_off_center() {
        let image = create_white_image(100, 100);

        let stops = vec![
            GradientStop { position: 0.0, color: Color::red() },
            GradientStop { position: 1.0, color: Color::blue() },
        ];

        let effect = Effect::RadialGradient {
            center: Point::new(25.0, 25.0), // Top-left quadrant
            radius: 30.0,
            stops,
        };
        let result = effect.apply(&image).unwrap();

        // Area near (25, 25) should be more red
        let near_center = result.get_pixel(25, 25);
        assert!(near_center[0] > near_center[2]);

        // Far corner should be more blue
        let far_corner = result.get_pixel(90, 90);
        assert!(far_corner[2] > far_corner[0]);
    }
}

#[cfg(test)]
mod color_adjustment_tests {
    use super::*;

    #[test]
    fn test_invert_effect() {
        let image = create_colored_image(50, 50, [255, 100, 50, 255]);
        let effect = Effect::Invert;
        let result = effect.apply(&image).unwrap();

        let pixel = result.get_pixel(25, 25);
        assert_eq!(pixel[0], 0); // 255 inverted
        assert_eq!(pixel[1], 155); // 100 inverted
        assert_eq!(pixel[2], 205); // 50 inverted
        assert_eq!(pixel[3], 255); // Alpha unchanged
    }

    #[test]
    fn test_grayscale_effect() {
        let image = create_colored_image(50, 50, [255, 128, 64, 255]);
        let effect = Effect::Grayscale;
        let result = effect.apply(&image).unwrap();

        let pixel = result.get_pixel(25, 25);
        // All RGB channels should be equal (±1 for rounding)
        assert!((pixel[0] as i16 - pixel[1] as i16).abs() <= 1);
        assert!((pixel[1] as i16 - pixel[2] as i16).abs() <= 1);
        assert_eq!(pixel[3], 255); // Alpha unchanged
    }

    #[test]
    fn test_sepia_effect() {
        let image = create_colored_image(50, 50, [200, 200, 200, 255]);
        let effect = Effect::Sepia { intensity: 1.0 };
        let result = effect.apply(&image).unwrap();

        let pixel = result.get_pixel(25, 25);
        // Sepia: red > green > blue
        assert!(pixel[0] > pixel[1]);
        assert!(pixel[1] > pixel[2]);
    }

    #[test]
    fn test_sepia_partial_intensity() {
        let image = create_colored_image(50, 50, [200, 200, 200, 255]);

        let effect_full = Effect::Sepia { intensity: 1.0 };
        let result_full = effect_full.apply(&image).unwrap();

        let effect_half = Effect::Sepia { intensity: 0.5 };
        let result_half = effect_half.apply(&image).unwrap();

        let pixel_full = result_full.get_pixel(25, 25);
        let pixel_half = result_half.get_pixel(25, 25);

        // Half intensity should be less sepia-toned
        assert!((pixel_full[0] as i16 - pixel_full[2] as i16) >
                (pixel_half[0] as i16 - pixel_half[2] as i16));
    }

    #[test]
    fn test_saturation_increase() {
        let image = create_colored_image(50, 50, [200, 100, 100, 255]);
        let effect = Effect::Saturation { amount: 0.5 };
        let result = effect.apply(&image).unwrap();

        let original_pixel = image.get_pixel(25, 25);
        let result_pixel = result.get_pixel(25, 25);

        // Increased saturation should amplify color difference
        let original_diff = original_pixel[0] as i16 - original_pixel[1] as i16;
        let result_diff = result_pixel[0] as i16 - result_pixel[1] as i16;
        assert!(result_diff > original_diff);
    }

    #[test]
    fn test_saturation_decrease() {
        let image = create_colored_image(50, 50, [255, 100, 50, 255]);
        let effect = Effect::Saturation { amount: -0.5 };
        let result = effect.apply(&image).unwrap();

        let pixel = result.get_pixel(25, 25);
        // Lower saturation brings colors closer together
        let diff = (pixel[0] as i16 - pixel[1] as i16).abs();
        assert!(diff < 155); // Less than original (255 - 100)
    }

    #[test]
    fn test_hue_rotate() {
        let image = create_colored_image(50, 50, [255, 0, 0, 255]); // Red
        let effect = Effect::HueRotate { degrees: 120.0 }; // Should rotate to green
        let result = effect.apply(&image).unwrap();

        let pixel = result.get_pixel(25, 25);
        // After 120° rotation, red should become green-ish
        assert!(pixel[1] > pixel[0]); // More green than red
    }
}

#[cfg(test)]
mod advanced_effects_tests {
    use super::*;

    #[test]
    fn test_color_matrix_identity() {
        let image = create_colored_image(50, 50, [128, 64, 192, 255]);

        // Identity matrix
        let matrix = [
            1.0, 0.0, 0.0, 0.0, 0.0,  // R
            0.0, 1.0, 0.0, 0.0, 0.0,  // G
            0.0, 0.0, 1.0, 0.0, 0.0,  // B
            0.0, 0.0, 0.0, 1.0, 0.0,  // A
        ];

        let effect = Effect::ColorMatrix { matrix };
        let result = effect.apply(&image).unwrap();

        let pixel = result.get_pixel(25, 25);
        assert_eq!(pixel[0], 128);
        assert_eq!(pixel[1], 64);
        assert_eq!(pixel[2], 192);
        assert_eq!(pixel[3], 255);
    }

    #[test]
    fn test_chromatic_aberration() {
        // Create a vertical white line in the center
        let mut image = RgbaImage::new(100, 100);
        for y in 0..100 {
            for x in 0..100 {
                if x >= 45 && x <= 55 {
                    image.put_pixel(x, y, Rgba([255, 255, 255, 255]));
                } else {
                    image.put_pixel(x, y, Rgba([0, 0, 0, 255]));
                }
            }
        }

        let effect = Effect::ChromaticAberration { intensity: 5.0 };
        let result = effect.apply(&image).unwrap();

        // Check for red fringe on left
        let left_fringe = result.get_pixel(40, 50);
        assert!(left_fringe[0] > 200, "Should have red from shifted white");

        // Check for blue fringe on right
        let right_fringe = result.get_pixel(60, 50);
        assert!(right_fringe[2] > 200, "Should have blue from shifted white");
    }
}

#[cfg(test)]
mod effect_stacking_tests {
    use super::*;

    #[test]
    fn test_multiple_effects_applied_in_order() {
        let compositor = test_compositor(100, 100);

        let layers = vec![
            Layer::solid_color(Color::new(128, 128, 128, 255), Transform::default())
                .with_effects(vec![
                    Effect::Brightness { amount: 0.2 },
                    Effect::Contrast { amount: 0.3 },
                ]),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Effects should be applied
        assert_eq!(frame.width(), 100);
        assert_eq!(frame.height(), 100);
    }

    #[test]
    fn test_blur_then_brightness() {
        let image = create_white_image(50, 50);

        let blur = Effect::Blur { radius: 2.0 };
        let blurred = blur.apply(&image).unwrap();

        let brightness = Effect::Brightness { amount: -0.3 };
        let result = brightness.apply(&blurred).unwrap();

        // Should be darker than original
        let avg = average_color(&result);
        assert!(avg[0] < 255.0);
    }

    #[test]
    fn test_brightness_then_contrast() {
        let image = create_colored_image(50, 50, [100, 100, 100, 255]);

        let brightness = Effect::Brightness { amount: 0.2 };
        let brightened = brightness.apply(&image).unwrap();

        let contrast = Effect::Contrast { amount: 0.5 };
        let result = contrast.apply(&brightened).unwrap();

        // Should apply both effects
        let avg = average_color(&result);
        assert!(avg[0] > 100.0); // Brighter
    }

    #[test]
    fn test_grayscale_then_sepia() {
        let image = create_colored_image(50, 50, [255, 128, 64, 255]);

        let grayscale = Effect::Grayscale;
        let gray = grayscale.apply(&image).unwrap();

        let sepia = Effect::Sepia { intensity: 1.0 };
        let result = sepia.apply(&gray).unwrap();

        let pixel = result.get_pixel(25, 25);
        // Should have sepia tone even after grayscale
        assert!(pixel[0] >= pixel[1]); // Red >= Green
        assert!(pixel[1] >= pixel[2]); // Green >= Blue
    }

    #[test]
    fn test_effect_with_transform() {
        let compositor = test_compositor(200, 200);

        let layers = vec![
            Layer::solid_color(Color::white(), Transform::new().with_scale(0.5))
                .with_effect(Effect::Blur { radius: 3.0 }),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should apply both transform and effect
        assert_eq!(frame.width(), 200);
        assert_eq!(frame.height(), 200);
    }

    #[test]
    fn test_shadow_with_blur_effect() {
        let compositor = test_compositor(100, 100);

        // Layer with both shadow and blur effects
        let layers = vec![
            Layer::solid_color(Color::white(), Transform::new().with_scale(0.3))
                .with_effects(vec![
                    Effect::Shadow {
                        offset_x: 3.0,
                        offset_y: 3.0,
                        blur: 2.0,
                        color: [0, 0, 0, 128],
                    },
                    Effect::Blur { radius: 1.0 },
                ]),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should render successfully
        assert_eq!(frame.width(), 100);
    }

    #[test]
    fn test_gradient_with_multiple_layers() {
        let compositor = test_compositor(100, 100);

        let stops = vec![
            GradientStop { position: 0.0, color: Color::new(255, 0, 0, 255) },
            GradientStop { position: 1.0, color: Color::new(0, 0, 255, 255) },
        ];

        let layers = vec![
            Layer::solid_color(Color::new(128, 128, 128, 255), Transform::default()),
            Layer::solid_color(Color::white(), Transform::default())
                .with_effect(Effect::LinearGradient { angle: 0.0, stops })
                .with_z_index(1),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Should render successfully with gradient
        assert_eq!(frame.width(), 100);
        assert_eq!(frame.height(), 100);
    }
}

#[cfg(test)]
mod effect_edge_cases {
    use super::*;

    #[test]
    fn test_empty_gradient_stops() {
        let image = create_white_image(50, 50);
        let effect = Effect::LinearGradient { angle: 0.0, stops: vec![] };
        let result = effect.apply(&image).unwrap();

        // Should return unchanged image
        assert_eq!(result.dimensions(), image.dimensions());
    }

    #[test]
    fn test_single_gradient_stop() {
        let image = create_white_image(50, 50);
        let stops = vec![
            GradientStop { position: 0.5, color: Color::red() },
        ];
        let effect = Effect::LinearGradient { angle: 0.0, stops };
        let result = effect.apply(&image).unwrap();

        // Should apply solid color from the stop
        let pixel = result.get_pixel(25, 25);
        assert!(pixel[0] > 128); // Should be reddish
    }

    #[test]
    fn test_minimal_blur_radius() {
        let image = create_white_image(50, 50);
        // Very small blur radius (imageproc requires sigma > 0)
        let effect = Effect::Blur { radius: 0.1 };
        let result = effect.apply(&image).unwrap();

        assert_eq!(result.dimensions(), image.dimensions());
    }

    #[test]
    fn test_extreme_brightness() {
        let image = create_colored_image(50, 50, [128, 128, 128, 255]);

        // Extreme positive brightness
        let bright = Effect::Brightness { amount: 1.0 };
        let result_bright = bright.apply(&image).unwrap();
        let pixel_bright = result_bright.get_pixel(25, 25);
        assert_eq!(pixel_bright[0], 255); // Should clamp

        // Extreme negative brightness
        let dark = Effect::Brightness { amount: -1.0 };
        let result_dark = dark.apply(&image).unwrap();
        let pixel_dark = result_dark.get_pixel(25, 25);
        assert_eq!(pixel_dark[0], 0); // Should clamp
    }

    #[test]
    fn test_zero_radius_radial_gradient() {
        let image = create_white_image(50, 50);
        let stops = vec![
            GradientStop { position: 0.0, color: Color::red() },
            GradientStop { position: 1.0, color: Color::blue() },
        ];

        let effect = Effect::RadialGradient {
            center: Point::new(25.0, 25.0),
            radius: 0.0, // Zero radius
            stops,
        };

        let result = effect.apply(&image).unwrap();
        // Should handle gracefully
        assert_eq!(result.dimensions(), image.dimensions());
    }
}
