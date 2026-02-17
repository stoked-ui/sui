//! Example demonstrating text rendering capabilities

use video_compositor::{Compositor, Layer, Transform, Color};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create a compositor
    let compositor = Compositor::new(800, 600)?
        .with_background(Color { r: 30, g: 30, b: 40, a: 255 });

    // Create text layers with various styles
    let layers = vec![
        // Title
        Layer::text(
            "Text Rendering Demo".to_string(),
            64.0,
            Color::white(),
            Transform::new().with_position(50.0, 50.0),
        ),

        // Subtitle with different color
        Layer::text(
            "Powered by fontdue".to_string(),
            32.0,
            Color { r: 100, g: 200, b: 255, a: 255 },
            Transform::new().with_position(50.0, 130.0),
        ),

        // Scaled and positioned text
        Layer::text(
            "Scaled Text".to_string(),
            24.0,
            Color { r: 255, g: 255, b: 100, a: 255 },
            Transform::new()
                .with_position(50.0, 250.0)
                .with_scale(2.0),
        ),

        // Semi-transparent text
        Layer::text(
            "Transparent Text".to_string(),
            36.0,
            Color { r: 255, g: 100, b: 100, a: 255 },
            Transform::new()
                .with_position(50.0, 400.0)
                .with_opacity(0.5),
        ),
    ];

    // Compose the frame
    let frame = compositor.compose(&layers)?;

    // Save to file
    frame.save("text_rendering_example.png")?;

    println!("Text rendering example saved to text_rendering_example.png");

    Ok(())
}
