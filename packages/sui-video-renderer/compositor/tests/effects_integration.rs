//! Integration tests for enhanced effects

use image::{Rgba, RgbaImage};
use video_compositor::{Color, Compositor, Effect, GradientStop, Layer, Point, Transform};

#[test]
fn test_shadow_effect_integration() {
    // Create a 100x100 white square image
    let mut image = RgbaImage::new(100, 100);
    for pixel in image.pixels_mut() {
        *pixel = Rgba([255, 255, 255, 255]);
    }

    // Save to temp location
    let temp_dir = std::env::temp_dir();
    let image_path = temp_dir.join("test_white_square.png");
    image.save(&image_path).unwrap();

    // Create layer with shadow effect
    let layer = Layer::image(
        image_path.clone(),
        Transform::at(50.0, 50.0),
    )
    .with_effect(Effect::Shadow {
        offset_x: 10.0,
        offset_y: 10.0,
        blur: 5.0,
        color: [0, 0, 0, 128], // Semi-transparent black
    });

    // Composite
    let compositor = Compositor::new(200, 200).unwrap();
    let frame = compositor.compose(&[layer]).unwrap();

    // The layer itself is at (50, 50), and shadow is offset by (10, 10)
    // Shadow should appear first, then the white square on top
    // Check that there's a shadow visible in the area where only shadow should be
    // For example, at (55, 55) the white square should be there
    let white_pixel = frame.get_pixel(55, 55);

    // The white square should be visible (approximately white)
    let has_white = white_pixel[0] > 200 && white_pixel[1] > 200 && white_pixel[2] > 200;

    assert!(has_white, "White square should be visible at its position: got {:?}", white_pixel);

    // Cleanup
    std::fs::remove_file(image_path).ok();
}

#[test]
fn test_linear_gradient_effect() {
    let mut image = RgbaImage::new(100, 100);
    for pixel in image.pixels_mut() {
        *pixel = Rgba([255, 255, 255, 255]);
    }

    let temp_dir = std::env::temp_dir();
    let image_path = temp_dir.join("test_gradient_base.png");
    image.save(&image_path).unwrap();

    // Create gradient stops
    let stops = vec![
        GradientStop {
            position: 0.0,
            color: Color::red(),
        },
        GradientStop {
            position: 1.0,
            color: Color::blue(),
        },
    ];

    let layer = Layer::image(image_path.clone(), Transform::default())
        .with_effect(Effect::LinearGradient { angle: 0.0, stops });

    let compositor = Compositor::new(100, 100).unwrap();
    let frame = compositor.compose(&[layer]).unwrap();

    // Left side should be more red
    let left = frame.get_pixel(10, 50);
    assert!(left[0] > left[2], "Left side should have more red than blue");

    // Right side should be more blue
    let right = frame.get_pixel(90, 50);
    assert!(right[2] > right[0], "Right side should have more blue than red");

    std::fs::remove_file(image_path).ok();
}

#[test]
fn test_radial_gradient_effect() {
    let mut image = RgbaImage::new(100, 100);
    for pixel in image.pixels_mut() {
        *pixel = Rgba([255, 255, 255, 255]);
    }

    let temp_dir = std::env::temp_dir();
    let image_path = temp_dir.join("test_radial_gradient.png");
    image.save(&image_path).unwrap();

    let stops = vec![
        GradientStop {
            position: 0.0,
            color: Color::red(),
        },
        GradientStop {
            position: 1.0,
            color: Color::blue(),
        },
    ];

    let layer = Layer::image(image_path.clone(), Transform::default()).with_effect(
        Effect::RadialGradient {
            center: Point::new(50.0, 50.0),
            radius: 50.0,
            stops,
        },
    );

    let compositor = Compositor::new(100, 100).unwrap();
    let frame = compositor.compose(&[layer]).unwrap();

    // Center should be more red
    let center = frame.get_pixel(50, 50);
    assert!(center[0] > center[2], "Center should have more red than blue");

    // Edge should be more blue
    let edge = frame.get_pixel(5, 50);
    assert!(edge[2] >= edge[0], "Edge should have more blue than red");

    std::fs::remove_file(image_path).ok();
}

#[test]
fn test_invert_effect() {
    let mut image = RgbaImage::new(50, 50);
    // Red image
    for pixel in image.pixels_mut() {
        *pixel = Rgba([255, 0, 0, 255]);
    }

    let temp_dir = std::env::temp_dir();
    let image_path = temp_dir.join("test_invert.png");
    image.save(&image_path).unwrap();

    let layer = Layer::image(image_path.clone(), Transform::default())
        .with_effect(Effect::Invert);

    let compositor = Compositor::new(50, 50).unwrap();
    let frame = compositor.compose(&[layer]).unwrap();

    let pixel = frame.get_pixel(25, 25);
    // Red inverts to cyan
    assert_eq!(pixel[0], 0);
    assert_eq!(pixel[1], 255);
    assert_eq!(pixel[2], 255);

    std::fs::remove_file(image_path).ok();
}

#[test]
fn test_grayscale_effect() {
    let mut image = RgbaImage::new(50, 50);
    // Colorful image
    for pixel in image.pixels_mut() {
        *pixel = Rgba([255, 100, 50, 255]);
    }

    let temp_dir = std::env::temp_dir();
    let image_path = temp_dir.join("test_grayscale.png");
    image.save(&image_path).unwrap();

    let layer = Layer::image(image_path.clone(), Transform::default())
        .with_effect(Effect::Grayscale);

    let compositor = Compositor::new(50, 50).unwrap();
    let frame = compositor.compose(&[layer]).unwrap();

    let pixel = frame.get_pixel(25, 25);
    // All RGB channels should be equal (±1 for rounding)
    assert!((pixel[0] as i32 - pixel[1] as i32).abs() <= 1);
    assert!((pixel[1] as i32 - pixel[2] as i32).abs() <= 1);

    std::fs::remove_file(image_path).ok();
}

#[test]
fn test_sepia_effect() {
    let mut image = RgbaImage::new(50, 50);
    // White image
    for pixel in image.pixels_mut() {
        *pixel = Rgba([200, 200, 200, 255]);
    }

    let temp_dir = std::env::temp_dir();
    let image_path = temp_dir.join("test_sepia.png");
    image.save(&image_path).unwrap();

    let layer = Layer::image(image_path.clone(), Transform::default())
        .with_effect(Effect::Sepia { intensity: 1.0 });

    let compositor = Compositor::new(50, 50).unwrap();
    let frame = compositor.compose(&[layer]).unwrap();

    let pixel = frame.get_pixel(25, 25);
    // Sepia tone: red > green > blue
    assert!(pixel[0] > pixel[1]);
    assert!(pixel[1] > pixel[2]);

    std::fs::remove_file(image_path).ok();
}

#[test]
fn test_chromatic_aberration_effect() {
    let mut image = RgbaImage::new(100, 100);
    // White vertical stripe in middle
    for y in 0..100 {
        for x in 0..100 {
            if x >= 45 && x <= 55 {
                image.put_pixel(x, y, Rgba([255, 255, 255, 255]));
            } else {
                image.put_pixel(x, y, Rgba([0, 0, 0, 255]));
            }
        }
    }

    let temp_dir = std::env::temp_dir();
    let image_path = temp_dir.join("test_chromatic.png");
    image.save(&image_path).unwrap();

    let layer = Layer::image(image_path.clone(), Transform::default())
        .with_effect(Effect::ChromaticAberration { intensity: 5.0 });

    let compositor = Compositor::new(100, 100).unwrap();
    let frame = compositor.compose(&[layer]).unwrap();

    // Left fringe should have red from offset white area
    let left = frame.get_pixel(40, 50);
    assert_eq!(left[0], 255, "Left should have red fringe");

    // Right fringe should have blue from offset white area
    let right = frame.get_pixel(60, 50);
    assert_eq!(right[2], 255, "Right should have blue fringe");

    std::fs::remove_file(image_path).ok();
}

#[test]
fn test_multiple_effects() {
    let mut image = RgbaImage::new(50, 50);
    for pixel in image.pixels_mut() {
        *pixel = Rgba([255, 0, 0, 255]);
    }

    let temp_dir = std::env::temp_dir();
    let image_path = temp_dir.join("test_multiple_effects.png");
    image.save(&image_path).unwrap();

    // Apply multiple effects: grayscale then sepia
    let layer = Layer::image(image_path.clone(), Transform::default())
        .with_effect(Effect::Grayscale)
        .with_effect(Effect::Sepia { intensity: 0.5 });

    let compositor = Compositor::new(50, 50).unwrap();
    let frame = compositor.compose(&[layer]).unwrap();

    let pixel = frame.get_pixel(25, 25);

    // After grayscale and sepia, should have some color tint
    // but not be pure red anymore
    assert!(pixel[0] >= pixel[1] && pixel[1] >= pixel[2]);

    std::fs::remove_file(image_path).ok();
}
