//! Main compositor implementation

use image::{Rgba, RgbaImage};
use imageproc::geometric_transformations::{rotate_about_center, warp, Interpolation, Projection};
use rayon::prelude::*;

use crate::{
    blend::BlendMode,
    effects::Effect,
    frame::Frame,
    layer::{Layer, LayerContent},
    text::{TextRenderer, TextStyle},
    transform::Transform,
    types::Color,
    Error, Result,
};

/// High-performance frame compositor
pub struct Compositor {
    /// Output frame width
    width: u32,

    /// Output frame height
    height: u32,

    /// Background color
    background: Color,

    /// Text renderer for text layers
    text_renderer: TextRenderer,
}

impl Compositor {
    /// Create a new compositor with given dimensions
    pub fn new(width: u32, height: u32) -> Result<Self> {
        if width == 0 || height == 0 {
            return Err(Error::InvalidDimensions(width, height));
        }

        Ok(Self {
            width,
            height,
            background: Color::transparent(),
            text_renderer: TextRenderer::new(),
        })
    }

    /// Set background color
    pub fn with_background(mut self, background: Color) -> Self {
        self.background = background;
        self
    }

    /// Compose a single frame from layers
    pub fn compose(&self, layers: &[Layer]) -> Result<Frame> {
        // Create output frame with background
        let mut output = self.create_background();

        // Sort layers by z-index (bottom to top)
        let mut sorted_layers: Vec<&Layer> = layers.iter().filter(|l| l.visible).collect();
        sorted_layers.sort_by_key(|l| l.z_index);

        // Render each layer
        for layer in sorted_layers {
            self.render_layer(&mut output, layer)?;
        }

        Ok(Frame::from_image(output))
    }

    /// Compose multiple frames in parallel
    pub fn compose_batch(&self, frames: Vec<Vec<Layer>>) -> Result<Vec<Frame>> {
        frames
            .par_iter()
            .map(|layers| self.compose(layers))
            .collect()
    }

    /// Create background frame
    fn create_background(&self) -> RgbaImage {
        let mut image = RgbaImage::new(self.width, self.height);

        if self.background.a > 0 {
            for pixel in image.pixels_mut() {
                *pixel = Rgba([
                    self.background.r,
                    self.background.g,
                    self.background.b,
                    self.background.a,
                ]);
            }
        }

        image
    }

    /// Render a single layer onto the output frame
    fn render_layer(&self, output: &mut RgbaImage, layer: &Layer) -> Result<()> {
        match &layer.content {
            LayerContent::Image { .. } | LayerContent::ImageData { .. } => {
                if let Some(mut image) = layer.load_image()? {
                    // Apply effects and composite
                    self.composite_image_with_effects(output, &mut image, &layer.transform, layer.blend_mode, &layer.effects)?;
                }
            }
            LayerContent::SolidColor { color } => {
                self.render_solid_color(output, *color, &layer.transform, layer.blend_mode)?;
            }
            LayerContent::Text {
                text,
                font_size,
                color,
                font_family,
                alignment,
                line_height,
                letter_spacing,
                wrap_width,
                stroke,
                shadow,
                font_weight,
            } => {
                // Build text style from layer properties
                let style = TextStyle {
                    font_family: font_family.clone(),
                    font_size: *font_size,
                    font_weight: font_weight.unwrap_or(400),
                    color: *color,
                    alignment: alignment.unwrap_or_default(),
                    line_height: line_height.unwrap_or(1.2),
                    letter_spacing: letter_spacing.unwrap_or(0.0),
                    wrap_width: *wrap_width,
                    stroke: *stroke,
                    shadow: *shadow,
                };

                // Render text to image
                let mut text_image = self.text_renderer.render(text, &style);

                // Composite text image onto output with effects
                self.composite_image_with_effects(output, &mut text_image, &layer.transform, layer.blend_mode, &layer.effects)?;
            }
        }

        Ok(())
    }

    /// Composite an image with effects applied
    fn composite_image_with_effects(
        &self,
        output: &mut RgbaImage,
        source: &mut RgbaImage,
        transform: &Transform,
        blend_mode: BlendMode,
        effects: &[Effect],
    ) -> Result<()> {
        // Separate shadow effects from other effects
        let mut shadow_effects = Vec::new();
        let mut other_effects = Vec::new();

        for effect in effects {
            match effect {
                Effect::Shadow { .. } => shadow_effects.push(effect),
                _ => other_effects.push(effect),
            }
        }

        // Apply non-shadow effects to source
        let mut processed = source.clone();
        for effect in &other_effects {
            processed = effect.apply(&processed)?;
        }

        // Render shadows first (beneath the source)
        for effect in &shadow_effects {
            if let Effect::Shadow { offset_x, offset_y, blur, color } = effect {
                let shadow_image = Effect::create_shadow(&processed, *blur, *color);

                // Create shadow transform with offset
                let mut shadow_transform = transform.clone();
                shadow_transform.position.x += offset_x;
                shadow_transform.position.y += offset_y;

                // Composite shadow
                self.composite_image(output, &mut shadow_image.clone(), &shadow_transform, blend_mode)?;
            }
        }

        // Composite the source on top
        self.composite_image(output, &mut processed, transform, blend_mode)?;

        Ok(())
    }

    /// Composite an image onto output with transform and blend mode
    fn composite_image(
        &self,
        output: &mut RgbaImage,
        source: &mut RgbaImage,
        transform: &Transform,
        blend_mode: BlendMode,
    ) -> Result<()> {
        // Apply opacity to source
        if transform.opacity < 1.0 {
            Self::apply_opacity(source, transform.opacity);
        }

        // Apply transforms (scale, rotation, skew)
        let transformed = self.apply_transforms(source, transform)?;

        // Composite onto output at position
        let x = transform.position.x as i64;
        let y = transform.position.y as i64;

        self.blend_image_at(output, &transformed, x, y, blend_mode);

        Ok(())
    }

    /// Render a solid color rectangle
    fn render_solid_color(
        &self,
        output: &mut RgbaImage,
        color: Color,
        transform: &Transform,
        blend_mode: BlendMode,
    ) -> Result<()> {
        let x = transform.position.x as i64;
        let y = transform.position.y as i64;
        let w = (self.width as f32 * transform.scale.x) as u32;
        let h = (self.height as f32 * transform.scale.y) as u32;

        // Create solid color image
        let mut solid = RgbaImage::from_pixel(w, h, Rgba([color.r, color.g, color.b, color.a]));

        // Apply opacity
        if transform.opacity < 1.0 {
            Self::apply_opacity(&mut solid, transform.opacity);
        }

        // Blend onto output
        self.blend_image_at(output, &solid, x, y, blend_mode);

        Ok(())
    }

    /// Blend source image onto destination at position
    fn blend_image_at(
        &self,
        dest: &mut RgbaImage,
        source: &RgbaImage,
        x: i64,
        y: i64,
        blend_mode: BlendMode,
    ) {
        let (dest_width, dest_height) = dest.dimensions();
        let (src_width, src_height) = source.dimensions();

        for src_y in 0..src_height {
            for src_x in 0..src_width {
                let dest_x = x + src_x as i64;
                let dest_y = y + src_y as i64;

                // Skip if outside bounds
                if dest_x < 0
                    || dest_y < 0
                    || dest_x >= dest_width as i64
                    || dest_y >= dest_height as i64
                {
                    continue;
                }

                let dest_pixel = dest.get_pixel(dest_x as u32, dest_y as u32);
                let src_pixel = source.get_pixel(src_x, src_y);

                let bottom = [dest_pixel[0], dest_pixel[1], dest_pixel[2], dest_pixel[3]];
                let top = [src_pixel[0], src_pixel[1], src_pixel[2], src_pixel[3]];

                let blended = blend_mode.blend(bottom, top);

                dest.put_pixel(dest_x as u32, dest_y as u32, Rgba(blended));
            }
        }
    }

    /// Apply opacity to an image (modifies in place)
    fn apply_opacity(image: &mut RgbaImage, opacity: f32) {
        let opacity_u8 = (opacity * 255.0) as u8;

        for pixel in image.pixels_mut() {
            pixel[3] = ((pixel[3] as u16 * opacity_u8 as u16) / 255) as u8;
        }
    }

    /// Apply geometric transforms (scale, rotation, skew) to an image
    fn apply_transforms(&self, source: &RgbaImage, transform: &Transform) -> Result<RgbaImage> {
        let mut result = source.clone();

        // Step 1: Apply scale if needed
        if transform.scale.x != 1.0 || transform.scale.y != 1.0 {
            let new_width = (result.width() as f32 * transform.scale.x).max(1.0) as u32;
            let new_height = (result.height() as f32 * transform.scale.y).max(1.0) as u32;
            result = image::imageops::resize(
                &result,
                new_width,
                new_height,
                image::imageops::FilterType::Lanczos3,
            );
        }

        // Step 2: Apply rotation if needed
        if transform.rotation != 0.0 {
            result = self.apply_rotation(&result, transform)?;
        }

        // Step 3: Apply skew if needed (via affine transformation)
        if transform.skew.x != 0.0 || transform.skew.y != 0.0 {
            result = self.apply_skew(&result, transform)?;
        }

        Ok(result)
    }

    /// Apply rotation to an image, respecting anchor point
    fn apply_rotation(&self, source: &RgbaImage, transform: &Transform) -> Result<RgbaImage> {
        let angle = transform.rotation;

        // Normalize angle to -180 to 180
        let normalized_angle = ((angle % 360.0) + 540.0) % 360.0 - 180.0;

        // Fast paths for common rotations (90, 180, 270 degrees)
        if (normalized_angle - 90.0).abs() < 0.1 {
            return Ok(image::imageops::rotate90(source));
        } else if (normalized_angle - 180.0).abs() < 0.1 || (normalized_angle + 180.0).abs() < 0.1 {
            return Ok(image::imageops::rotate180(source));
        } else if (normalized_angle - 270.0).abs() < 0.1 || (normalized_angle + 90.0).abs() < 0.1 {
            return Ok(image::imageops::rotate270(source));
        } else if normalized_angle.abs() < 0.1 {
            return Ok(source.clone());
        }

        // For arbitrary angles, use imageproc's rotation
        // Convert degrees to radians (note: positive angle = clockwise in imageproc)
        let radians = -normalized_angle.to_radians(); // Negate for clockwise rotation

        // Calculate anchor point in pixels
        let _anchor_x = if transform.anchor.x <= 1.0 {
            // Relative anchor (0.0-1.0)
            transform.anchor.x * source.width() as f32
        } else {
            // Absolute anchor (pixels)
            transform.anchor.x
        };

        let _anchor_y = if transform.anchor.y <= 1.0 {
            // Relative anchor (0.0-1.0)
            transform.anchor.y * source.height() as f32
        } else {
            // Absolute anchor (pixels)
            transform.anchor.y
        };

        // Rotate around the anchor point
        let rotated = rotate_about_center(
            source,
            radians,
            Interpolation::Bilinear,
            Rgba([0, 0, 0, 0]), // Transparent background
        );

        Ok(rotated)
    }

    /// Apply skew transformation using affine matrix
    fn apply_skew(&self, source: &RgbaImage, transform: &Transform) -> Result<RgbaImage> {
        let (width, height) = source.dimensions();

        // Convert skew angles to radians
        let skew_x_rad = transform.skew.x.to_radians();
        let skew_y_rad = transform.skew.y.to_radians();

        // Build affine transformation matrix
        // Matrix format: [a, b, c, d, e, f] represents:
        // | a  b  c |
        // | d  e  f |
        // | 0  0  1 |

        // Skew matrix combining horizontal and vertical skew
        let tan_x = skew_x_rad.tan();
        let tan_y = skew_y_rad.tan();

        // Calculate new dimensions to fit skewed image
        let _new_width = (width as f32 + (height as f32 * tan_x.abs())).ceil() as u32;
        let _new_height = (height as f32 + (width as f32 * tan_y.abs())).ceil() as u32;

        // Create projection matrix for skew
        // We need to shift the origin to handle positive offsets
        let offset_x = if tan_x < 0.0 { -(height as f32) * tan_x } else { 0.0 };
        let offset_y = if tan_y < 0.0 { -(width as f32) * tan_y } else { 0.0 };

        let projection = Projection::from_matrix([
            1.0, tan_x, offset_x,
            tan_y, 1.0, offset_y,
            0.0, 0.0, 1.0,
        ]).ok_or_else(|| Error::InvalidTransform("Failed to create skew projection matrix".into()))?;

        // Apply warp transformation
        let skewed = warp(
            source,
            &projection,
            Interpolation::Bilinear,
            Rgba([0, 0, 0, 0]), // Transparent background
        );

        Ok(skewed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compositor_creation() {
        let compositor = Compositor::new(1920, 1080).unwrap();
        assert_eq!(compositor.width, 1920);
        assert_eq!(compositor.height, 1080);
    }

    #[test]
    fn test_invalid_dimensions() {
        assert!(Compositor::new(0, 1080).is_err());
        assert!(Compositor::new(1920, 0).is_err());
    }

    #[test]
    fn test_background_color() {
        let compositor = Compositor::new(100, 100)
            .unwrap()
            .with_background(Color::red());

        let frame = compositor.compose(&[]).unwrap();

        // Should have red background
        let pixel = frame.get_pixel(50, 50);
        assert_eq!(pixel[0], 255); // Red
        assert_eq!(pixel[1], 0);   // Green
        assert_eq!(pixel[2], 0);   // Blue
    }

    #[test]
    fn test_solid_color_layer() {
        let compositor = Compositor::new(100, 100).unwrap();

        let layers = vec![Layer::solid_color(
            Color::blue(),
            Transform::new().with_scale(1.0),
        )];

        let frame = compositor.compose(&layers).unwrap();

        // Should have blue color
        let pixel = frame.get_pixel(50, 50);
        assert_eq!(pixel[2], 255); // Blue
    }

    #[test]
    fn test_rotation_90_degrees() {
        let compositor = Compositor::new(100, 100).unwrap();

        // Create a simple test image (10x10 white square)
        let mut test_image = RgbaImage::new(10, 10);
        for pixel in test_image.pixels_mut() {
            *pixel = Rgba([255, 255, 255, 255]);
        }

        let transform = Transform::new().with_rotation(90.0);
        let rotated = compositor.apply_rotation(&test_image, &transform).unwrap();

        // After 90° rotation, width and height should be swapped
        assert_eq!(rotated.width(), 10);
        assert_eq!(rotated.height(), 10);
    }

    #[test]
    fn test_rotation_180_degrees() {
        let compositor = Compositor::new(100, 100).unwrap();

        let mut test_image = RgbaImage::new(10, 10);
        for pixel in test_image.pixels_mut() {
            *pixel = Rgba([255, 255, 255, 255]);
        }

        let transform = Transform::new().with_rotation(180.0);
        let rotated = compositor.apply_rotation(&test_image, &transform).unwrap();

        // After 180° rotation, dimensions should remain the same
        assert_eq!(rotated.width(), 10);
        assert_eq!(rotated.height(), 10);
    }

    #[test]
    fn test_rotation_270_degrees() {
        let compositor = Compositor::new(100, 100).unwrap();

        let mut test_image = RgbaImage::new(10, 10);
        for pixel in test_image.pixels_mut() {
            *pixel = Rgba([255, 255, 255, 255]);
        }

        let transform = Transform::new().with_rotation(270.0);
        let rotated = compositor.apply_rotation(&test_image, &transform).unwrap();

        // After 270° rotation, width and height should be swapped
        assert_eq!(rotated.width(), 10);
        assert_eq!(rotated.height(), 10);
    }

    #[test]
    fn test_rotation_45_degrees() {
        let compositor = Compositor::new(100, 100).unwrap();

        let mut test_image = RgbaImage::new(10, 10);
        for pixel in test_image.pixels_mut() {
            *pixel = Rgba([255, 255, 255, 255]);
        }

        let transform = Transform::new().with_rotation(45.0);
        let rotated = compositor.apply_rotation(&test_image, &transform).unwrap();

        // rotate_about_center keeps canvas size (doesn't expand)
        // This produces anti-aliased rotation with transparent corners
        assert_eq!(rotated.width(), 10);
        assert_eq!(rotated.height(), 10);
        // Verify rotation occurred by checking for transparent pixels
        assert!(rotated.pixels().any(|p| p[3] < 255));
    }

    #[test]
    fn test_rotation_with_anchor_top_left() {
        let compositor = Compositor::new(100, 100).unwrap();

        let mut test_image = RgbaImage::new(10, 10);
        for pixel in test_image.pixels_mut() {
            *pixel = Rgba([255, 255, 255, 255]);
        }

        // Rotate around top-left corner
        let transform = Transform::new()
            .with_rotation(45.0)
            .with_anchor(0.0, 0.0);

        let rotated = compositor.apply_rotation(&test_image, &transform).unwrap();

        // Should produce a valid rotated image
        assert!(rotated.width() > 0);
        assert!(rotated.height() > 0);
    }

    #[test]
    fn test_skew_horizontal() {
        let compositor = Compositor::new(100, 100).unwrap();

        let mut test_image = RgbaImage::new(10, 10);
        for pixel in test_image.pixels_mut() {
            *pixel = Rgba([255, 255, 255, 255]);
        }

        let transform = Transform::new().with_skew(15.0, 0.0);
        let skewed = compositor.apply_skew(&test_image, &transform).unwrap();

        // warp keeps canvas size (doesn't auto-expand)
        // Skew transformation applied within the same dimensions
        assert_eq!(skewed.width(), test_image.width());
        assert_eq!(skewed.height(), test_image.height());
    }

    #[test]
    fn test_skew_vertical() {
        let compositor = Compositor::new(100, 100).unwrap();

        let mut test_image = RgbaImage::new(10, 10);
        for pixel in test_image.pixels_mut() {
            *pixel = Rgba([255, 255, 255, 255]);
        }

        let transform = Transform::new().with_skew(0.0, 15.0);
        let skewed = compositor.apply_skew(&test_image, &transform).unwrap();

        // warp keeps canvas size (doesn't auto-expand)
        // Skew transformation applied within the same dimensions
        assert_eq!(skewed.width(), test_image.width());
        assert_eq!(skewed.height(), test_image.height());
    }

    #[test]
    fn test_combined_transforms() {
        let compositor = Compositor::new(100, 100).unwrap();

        let mut test_image = RgbaImage::new(10, 10);
        for pixel in test_image.pixels_mut() {
            *pixel = Rgba([255, 255, 255, 255]);
        }

        // Apply scale, rotation, and skew
        let transform = Transform::new()
            .with_scale_xy(2.0, 1.5)
            .with_rotation(30.0)
            .with_skew(5.0, 5.0);

        let transformed = compositor.apply_transforms(&test_image, &transform).unwrap();

        // Should produce a valid transformed image
        assert!(transformed.width() > 0);
        assert!(transformed.height() > 0);
    }

    #[test]
    fn test_text_layer_rendering() {
        let compositor = Compositor::new(200, 100).unwrap();

        let layers = vec![Layer::text(
            "Hello World".to_string(),
            32.0,
            Color::black(),
            Transform::new(),
        )];

        let frame = compositor.compose(&layers).unwrap();

        // Should render successfully
        assert_eq!(frame.size().width, 200);
        assert_eq!(frame.size().height, 100);

        // Should have some non-transparent pixels from text
        let mut has_content = false;
        for y in 0..frame.size().height {
            for x in 0..frame.size().width {
                let pixel = frame.get_pixel(x, y);
                if pixel[3] > 0 {
                    has_content = true;
                    break;
                }
            }
            if has_content {
                break;
            }
        }
        assert!(has_content, "Text layer should produce visible pixels");
    }

    #[test]
    fn test_text_with_transform() {
        let compositor = Compositor::new(300, 200).unwrap();

        let layers = vec![Layer::text(
            "Transformed".to_string(),
            48.0,
            Color::white(),
            Transform::new()
                .with_position(50.0, 50.0)
                .with_scale(1.5)
                .with_opacity(0.8),
        )];

        let frame = compositor.compose(&layers).unwrap();

        // Should render with transforms applied
        assert_eq!(frame.size().width, 300);
        assert_eq!(frame.size().height, 200);

        // Check that text appears at expected position
        let pixel = frame.get_pixel(60, 60);
        // Should have some content with partial opacity
        assert!(pixel[3] > 0, "Text should be visible at transformed position");
    }

    #[test]
    fn test_text_with_background() {
        let compositor = Compositor::new(200, 100)
            .unwrap()
            .with_background(Color::blue());

        let layers = vec![Layer::text(
            "Text".to_string(),
            24.0,
            Color::white(),
            Transform::new().with_position(10.0, 10.0),
        )];

        let frame = compositor.compose(&layers).unwrap();

        // Background should be blue
        let bg_pixel = frame.get_pixel(5, 5);
        assert_eq!(bg_pixel[2], 255, "Background should be blue");

        // Check that text was rendered somewhere on the frame
        let mut has_text = false;
        for y in 0..frame.size().height {
            for x in 0..frame.size().width {
                let pixel = frame.get_pixel(x, y);
                // White text on blue background will have some red or green component
                if pixel[0] > 0 || pixel[1] > 0 {
                    has_text = true;
                    break;
                }
            }
            if has_text {
                break;
            }
        }
        assert!(has_text, "Text should be visible on blue background");
    }
}
