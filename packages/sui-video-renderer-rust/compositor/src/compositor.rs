//! Main compositor implementation

use image::{GenericImage, ImageBuffer, Rgba, RgbaImage};
use rayon::prelude::*;
use std::sync::Arc;

use crate::{
    blend::BlendMode,
    effects::Effect,
    frame::Frame,
    layer::{Layer, LayerContent},
    transform::Transform,
    types::{Color, Point, Size},
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
                    // Apply transform and blend
                    self.composite_image(output, &mut image, &layer.transform, layer.blend_mode)?;
                }
            }
            LayerContent::SolidColor { color } => {
                self.render_solid_color(output, *color, &layer.transform, layer.blend_mode)?;
            }
            LayerContent::Text { .. } => {
                // Text rendering would use a font library like rusttype
                // For now, skip text rendering in this POC
                tracing::warn!("Text rendering not implemented in POC");
            }
        }

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

        // Apply scale if needed
        let scaled = if transform.scale.x != 1.0 || transform.scale.y != 1.0 {
            let new_width = (source.width() as f32 * transform.scale.x) as u32;
            let new_height = (source.height() as f32 * transform.scale.y) as u32;
            image::imageops::resize(
                source,
                new_width,
                new_height,
                image::imageops::FilterType::Lanczos3,
            )
        } else {
            source.clone()
        };

        // Apply rotation if needed
        let rotated = if transform.rotation != 0.0 {
            // For POC, skip rotation to keep it simple
            // Full implementation would use imageproc::geometric_transformations::rotate
            tracing::warn!("Rotation not implemented in POC, using unrotated image");
            scaled
        } else {
            scaled
        };

        // Composite onto output at position
        let x = transform.position.x as i64;
        let y = transform.position.y as i64;

        self.blend_image_at(output, &rotated, x, y, blend_mode);

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
}
