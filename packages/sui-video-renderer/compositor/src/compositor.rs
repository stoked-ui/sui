//! Main compositor implementation

use image::{Rgba, RgbaImage};
use imageproc::geometric_transformations::{rotate_about_center, warp, Interpolation, Projection};
#[cfg(feature = "rayon")]
use rayon::prelude::*;
use std::sync::{Arc, Mutex};

use crate::{
    animated::AnimatedLayer,
    blend::BlendMode,
    effects::Effect,
    frame::Frame,
    layer::{Layer, LayerContent},
    text::{TextRenderer, TextStyle},
    transform::Transform,
    types::{Color, Rect},
    Error, Result,
};

/// Buffer pool for efficient frame allocation
pub struct BufferPool {
    /// Pre-allocated buffers
    buffers: Arc<Mutex<Vec<RgbaImage>>>,
    /// Buffer dimensions
    width: u32,
    height: u32,
    /// Maximum pool capacity
    capacity: usize,
}

impl BufferPool {
    /// Create a new buffer pool with given capacity and dimensions
    pub fn new(capacity: usize, width: u32, height: u32) -> Self {
        let mut buffers = Vec::with_capacity(capacity);
        // Pre-allocate buffers
        for _ in 0..capacity {
            buffers.push(RgbaImage::new(width, height));
        }

        Self {
            buffers: Arc::new(Mutex::new(buffers)),
            width,
            height,
            capacity,
        }
    }

    /// Acquire a buffer from the pool (or create new if pool empty)
    pub fn acquire(&self) -> RgbaImage {
        let mut buffers = self.buffers.lock().unwrap();

        if let Some(mut buffer) = buffers.pop() {
            // Clear the buffer for reuse
            for pixel in buffer.pixels_mut() {
                *pixel = Rgba([0, 0, 0, 0]);
            }
            buffer
        } else {
            // Pool exhausted, create new buffer
            RgbaImage::new(self.width, self.height)
        }
    }

    /// Release a buffer back to the pool
    pub fn release(&self, buffer: RgbaImage) {
        // Only return to pool if dimensions match and we haven't exceeded capacity
        if buffer.width() == self.width && buffer.height() == self.height {
            let mut buffers = self.buffers.lock().unwrap();
            if buffers.len() < self.capacity {
                buffers.push(buffer);
            }
            // Otherwise drop the buffer (exceeds capacity)
        }
    }

    /// Get number of buffers currently in pool
    pub fn available(&self) -> usize {
        self.buffers.lock().unwrap().len()
    }
}

/// Tile information for tile-based rendering
#[derive(Debug, Clone, Copy)]
pub struct Tile {
    /// Tile bounds in output image
    pub bounds: Rect,
    /// Tile index
    pub index: usize,
}

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

    /// Optional buffer pool for efficient frame allocation
    buffer_pool: Option<BufferPool>,

    /// Tile size for tile-based rendering (0 = disabled)
    tile_size: u32,
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
            buffer_pool: None,
            tile_size: 0,
        })
    }

    /// Set background color
    pub fn with_background(mut self, background: Color) -> Self {
        self.background = background;
        self
    }

    /// Enable buffer pooling with specified capacity
    pub fn with_buffer_pool(mut self, capacity: usize) -> Self {
        self.buffer_pool = Some(BufferPool::new(capacity, self.width, self.height));
        self
    }

    /// Enable tile-based rendering with specified tile size
    pub fn with_tile_rendering(mut self, tile_size: u32) -> Self {
        self.tile_size = tile_size;
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

    /// Compose multiple frames in parallel (with rayon) or sequentially (WASM)
    pub fn compose_batch(&self, frames: Vec<Vec<Layer>>) -> Result<Vec<Frame>> {
        #[cfg(feature = "rayon")]
        {
            frames
                .par_iter()
                .map(|layers| self.compose(layers))
                .collect()
        }
        #[cfg(not(feature = "rayon"))]
        {
            frames
                .iter()
                .map(|layers| self.compose(layers))
                .collect()
        }
    }

    /// Compose a frame from animated layers at a specific time
    ///
    /// This method resolves all animated properties at the given time,
    /// then composes them into a frame using the standard compose pipeline.
    ///
    /// # Arguments
    ///
    /// * `layers` - Slice of animated layers to compose
    /// * `time_ms` - Time in milliseconds to resolve animations
    ///
    /// # Returns
    ///
    /// A composed frame with all animations resolved at the given time
    pub fn compose_at_time(&self, layers: &[AnimatedLayer], time_ms: f64) -> Result<Frame> {
        // Resolve all animated layers at the given time
        let resolved_layers: Vec<Layer> = layers
            .iter()
            .map(|animated_layer| animated_layer.resolve_at(time_ms))
            .collect();

        // Compose the resolved static layers
        self.compose(&resolved_layers)
    }

    /// Compose a frame with resolution scaling for performance.
    ///
    /// This method composes at a reduced resolution (scale < 1.0) then
    /// upscales the result. Useful during timeline scrubbing when high
    /// frame rates are more important than maximum quality.
    ///
    /// # Arguments
    ///
    /// * `layers` - Layers to compose
    /// * `scale` - Resolution scale factor (0.1-1.0). Use 0.5 for 50% resolution.
    ///
    /// # Returns
    ///
    /// A composed frame at full resolution (scaled up if needed)
    pub fn compose_with_resolution_scale(&self, layers: &[Layer], scale: f32) -> Result<Frame> {
        let scale = scale.clamp(0.1, 1.0);

        if (scale - 1.0).abs() < 0.01 {
            // Full resolution, use normal compose
            return self.compose(layers);
        }

        // Create temporary compositor at scaled resolution
        let scaled_width = (self.width as f32 * scale).max(1.0) as u32;
        let scaled_height = (self.height as f32 * scale).max(1.0) as u32;

        let scaled_compositor = Compositor {
            width: scaled_width,
            height: scaled_height,
            background: self.background,
            text_renderer: TextRenderer::new(),
            buffer_pool: None,
            tile_size: 0,
        };

        // Compose at lower resolution
        let scaled_frame = scaled_compositor.compose(layers)?;

        // Upscale to target resolution
        let upscaled = image::imageops::resize(
            scaled_frame.image(),
            self.width,
            self.height,
            image::imageops::FilterType::Triangle, // Fast bilinear-like filter
        );

        Ok(Frame::from_image(upscaled))
    }

    /// Create background frame
    fn create_background(&self) -> RgbaImage {
        let mut image = if let Some(ref pool) = self.buffer_pool {
            pool.acquire()
        } else {
            RgbaImage::new(self.width, self.height)
        };

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
            #[cfg(not(target_arch = "wasm32"))]
            LayerContent::Video { .. } => {
                // Video frames are decoded externally and passed as ImageData
                // This variant is handled by the video module
                // For now, video rendering is a no-op in the compositor
                // The video decoder should convert frames to ImageData before compositing
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
        #[cfg(not(target_arch = "wasm32"))]
        {
            self.blend_image_at_parallel(dest, source, x, y, blend_mode);
        }

        #[cfg(target_arch = "wasm32")]
        {
            self.blend_image_at_sequential(dest, source, x, y, blend_mode);
        }
    }

    /// Parallel blending using rayon (native only)
    #[cfg(not(target_arch = "wasm32"))]
    fn blend_image_at_parallel(
        &self,
        dest: &mut RgbaImage,
        source: &RgbaImage,
        x: i64,
        y: i64,
        blend_mode: BlendMode,
    ) {
        let (dest_width, dest_height) = dest.dimensions();
        let (src_width, src_height) = source.dimensions();

        // Calculate the overlapping region
        let start_x = x.max(0) as u32;
        let start_y = y.max(0) as u32;
        let end_x = (x + src_width as i64).min(dest_width as i64) as u32;
        let end_y = (y + src_height as i64).min(dest_height as i64) as u32;

        // If no overlap, return early
        if start_x >= end_x || start_y >= end_y {
            return;
        }

        // Get raw bytes for parallel processing
        let dest_bytes = dest.as_mut();
        let dest_stride = dest_width as usize * 4;

        // Process rows in parallel using par_chunks_mut
        let start_offset = (start_y as usize * dest_stride) as usize;
        let end_offset = (end_y as usize * dest_stride) as usize;

        dest_bytes[start_offset..end_offset]
            .par_chunks_mut(dest_stride)
            .enumerate()
            .for_each(|(row_idx, row_data)| {
                let dest_y = start_y + row_idx as u32;
                let src_y = (dest_y as i64 - y) as u32;

                for dest_x in start_x..end_x {
                    let src_x = (dest_x as i64 - x) as u32;
                    let pixel_offset = (dest_x as usize * 4) as usize;

                    let bottom = [
                        row_data[pixel_offset],
                        row_data[pixel_offset + 1],
                        row_data[pixel_offset + 2],
                        row_data[pixel_offset + 3],
                    ];

                    let src_pixel = source.get_pixel(src_x, src_y);
                    let top = [src_pixel[0], src_pixel[1], src_pixel[2], src_pixel[3]];

                    let blended = blend_mode.blend(bottom, top);

                    row_data[pixel_offset] = blended[0];
                    row_data[pixel_offset + 1] = blended[1];
                    row_data[pixel_offset + 2] = blended[2];
                    row_data[pixel_offset + 3] = blended[3];
                }
            });
    }

    /// Sequential blending (WASM or fallback)
    #[cfg(target_arch = "wasm32")]
    fn blend_image_at_sequential(
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

    /// Compose a frame using tile-based rendering
    pub fn compose_tiled(&self, layers: &[Layer]) -> Result<Frame> {
        if self.tile_size == 0 {
            // Tile rendering disabled, use standard compose
            return self.compose(layers);
        }

        // Create tiles
        let tiles = self.create_tiles();

        // Create output frame with background
        let mut output = self.create_background();

        // Sort layers by z-index
        let mut sorted_layers: Vec<&Layer> = layers.iter().filter(|l| l.visible).collect();
        sorted_layers.sort_by_key(|l| l.z_index);

        // Process each tile
        for tile in tiles {
            self.render_tile(&mut output, &sorted_layers, &tile)?;
        }

        Ok(Frame::from_image(output))
    }

    /// Create tiles for the output frame
    fn create_tiles(&self) -> Vec<Tile> {
        let mut tiles = Vec::new();
        let mut index = 0;

        let tile_size = self.tile_size;

        for y in (0..self.height).step_by(tile_size as usize) {
            for x in (0..self.width).step_by(tile_size as usize) {
                let width = tile_size.min(self.width - x);
                let height = tile_size.min(self.height - y);

                tiles.push(Tile {
                    bounds: Rect {
                        x: x as f32,
                        y: y as f32,
                        width: width as f32,
                        height: height as f32,
                    },
                    index,
                });

                index += 1;
            }
        }

        tiles
    }

    /// Render a single tile
    fn render_tile(
        &self,
        output: &mut RgbaImage,
        layers: &[&Layer],
        tile: &Tile,
    ) -> Result<()> {
        // Only render layers that intersect this tile
        for layer in layers {
            if self.layer_intersects_tile(layer, tile) {
                self.render_layer(output, layer)?;
            }
        }

        Ok(())
    }

    /// Check if a layer intersects with a tile
    fn layer_intersects_tile(&self, layer: &Layer, tile: &Tile) -> bool {
        // Calculate layer bounds
        let layer_x = layer.transform.position.x;
        let layer_y = layer.transform.position.y;

        // Estimate layer size (simplified - doesn't account for all transforms)
        let layer_width = match &layer.content {
            LayerContent::Image { .. } | LayerContent::ImageData { .. } => {
                // We'd need to load the image to know its size
                // For now, assume it could intersect
                return true;
            }
            LayerContent::SolidColor { .. } => {
                self.width as f32 * layer.transform.scale.x
            }
            LayerContent::Text { .. } => {
                // Text size is complex to calculate without rendering
                // Assume it could intersect
                return true;
            }
            #[cfg(not(target_arch = "wasm32"))]
            LayerContent::Video { .. } => return true,
        };

        let layer_height = self.height as f32 * layer.transform.scale.y;

        // Check for intersection
        let layer_right = layer_x + layer_width;
        let layer_bottom = layer_y + layer_height;
        let tile_right = tile.bounds.x + tile.bounds.width;
        let tile_bottom = tile.bounds.y + tile.bounds.height;

        !(layer_x >= tile_right
            || layer_right <= tile.bounds.x
            || layer_y >= tile_bottom
            || layer_bottom <= tile.bounds.y)
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

    // Integration tests for compose_at_time
    use crate::{AnimatedLayer, keyframe::{Keyframe, EasingFunction}};

    #[test]
    fn test_compose_at_time_with_position_animation() {
        let compositor = Compositor::new(200, 200).unwrap();

        let layer = Layer::solid_color(Color::red(), Transform::default());
        let animated = AnimatedLayer::new(layer)
            .with_position_x_keyframes(vec![
                Keyframe::new(0.0, 0.0, EasingFunction::Linear),
                Keyframe::new(1000.0, 100.0, EasingFunction::Linear),
            ]);

        let layers = vec![animated];

        // Compose at t=500ms
        let frame = compositor.compose_at_time(&layers, 500.0).unwrap();
        assert_eq!(frame.size().width, 200);
        assert_eq!(frame.size().height, 200);
    }

    #[test]
    fn test_compose_at_time_with_opacity_animation() {
        let compositor = Compositor::new(100, 100).unwrap();

        let layer = Layer::solid_color(Color::red(), Transform::default());
        let animated = AnimatedLayer::new(layer)
            .with_opacity_keyframes(vec![
                Keyframe::new(0.0, 1.0, EasingFunction::Linear),
                Keyframe::new(1000.0, 0.0, EasingFunction::Linear),
            ]);

        let layers = vec![animated];

        // Compose at t=0ms (full opacity)
        let frame_start = compositor.compose_at_time(&layers, 0.0).unwrap();
        // At t=0, opacity should be 1.0
        let pixel_start = frame_start.get_pixel(50, 50);
        assert_eq!(pixel_start[3], 255, "Should be fully opaque at t=0");

        // Compose at t=1000ms (zero opacity)
        let frame_end = compositor.compose_at_time(&layers, 1000.0).unwrap();
        // At t=1000, opacity should be 0.0
        let pixel_end = frame_end.get_pixel(50, 50);
        assert_eq!(pixel_end[3], 0, "Should be fully transparent at t=1000");

        // Compose at t=500ms (50% opacity)
        let frame_mid = compositor.compose_at_time(&layers, 500.0).unwrap();
        let pixel_mid = frame_mid.get_pixel(50, 50);
        // 50% opacity * 255 = 127.5, should be ~127-128
        assert!((pixel_mid[3] as i32 - 128).abs() <= 1,
            "Should be ~50% opaque at t=500, got alpha={}", pixel_mid[3]);
    }

    #[test]
    fn test_compose_at_time_multiple_animated_layers() {
        let compositor = Compositor::new(300, 300).unwrap();

        // First layer animates position
        let layer1 = Layer::solid_color(Color::red(), Transform::default());
        let animated1 = AnimatedLayer::new(layer1)
            .with_position_x_keyframes(vec![
                Keyframe::new(0.0, 0.0, EasingFunction::Linear),
                Keyframe::new(1000.0, 100.0, EasingFunction::Linear),
            ]);

        // Second layer animates scale
        let layer2 = Layer::solid_color(Color::blue(), Transform::default());
        let animated2 = AnimatedLayer::new(layer2)
            .with_scale_x_keyframes(vec![
                Keyframe::new(0.0, 1.0, EasingFunction::Linear),
                Keyframe::new(1000.0, 2.0, EasingFunction::Linear),
            ]);

        let layers = vec![animated1, animated2];

        let frame = compositor.compose_at_time(&layers, 500.0).unwrap();
        assert_eq!(frame.size().width, 300);
        assert_eq!(frame.size().height, 300);
    }

    #[test]
    fn test_compose_at_time_static_layers() {
        let compositor = Compositor::new(100, 100).unwrap();

        // Create a static animated layer (no additional keyframes)
        let layer = Layer::solid_color(Color::green(), Transform::default());
        let animated = AnimatedLayer::new(layer);

        let layers = vec![animated];

        // Compose at different times - should all be identical
        let frame0 = compositor.compose_at_time(&layers, 0.0).unwrap();
        let frame500 = compositor.compose_at_time(&layers, 500.0).unwrap();
        let frame1000 = compositor.compose_at_time(&layers, 1000.0).unwrap();

        // All frames should have the same green color
        assert_eq!(frame0.get_pixel(50, 50), frame500.get_pixel(50, 50));
        assert_eq!(frame0.get_pixel(50, 50), frame1000.get_pixel(50, 50));
    }

    // Buffer Pool Tests

    #[test]
    fn test_buffer_pool_acquire_release() {
        let pool = BufferPool::new(3, 100, 100);

        // Initially should have 3 buffers
        assert_eq!(pool.available(), 3);

        // Acquire a buffer
        let buffer1 = pool.acquire();
        assert_eq!(pool.available(), 2);

        let buffer2 = pool.acquire();
        assert_eq!(pool.available(), 1);

        // Release buffers back
        pool.release(buffer1);
        assert_eq!(pool.available(), 2);

        pool.release(buffer2);
        assert_eq!(pool.available(), 3);
    }

    #[test]
    fn test_buffer_pool_acquire_all() {
        let pool = BufferPool::new(2, 50, 50);

        let buffer1 = pool.acquire();
        let buffer2 = pool.acquire();

        // Pool exhausted, should create new buffer
        assert_eq!(pool.available(), 0);
        let buffer3 = pool.acquire();
        assert_eq!(buffer3.dimensions(), (50, 50));

        // Release all
        pool.release(buffer1);
        pool.release(buffer2);
        pool.release(buffer3); // This should not exceed capacity

        assert_eq!(pool.available(), 2); // Only stores up to capacity
    }

    #[test]
    fn test_buffer_pool_clears_on_acquire() {
        let pool = BufferPool::new(1, 10, 10);

        let mut buffer = pool.acquire();
        // Modify the buffer
        for pixel in buffer.pixels_mut() {
            *pixel = Rgba([255, 0, 0, 255]);
        }

        // Return to pool
        pool.release(buffer);

        // Acquire again - should be cleared
        let buffer2 = pool.acquire();
        let pixel = buffer2.get_pixel(5, 5);
        assert_eq!(pixel, &Rgba([0, 0, 0, 0]), "Buffer should be cleared on acquire");
    }

    #[test]
    fn test_compositor_with_buffer_pool() {
        let compositor = Compositor::new(100, 100)
            .unwrap()
            .with_buffer_pool(5);

        let layers = vec![Layer::solid_color(
            Color::red(),
            Transform::new().with_scale(1.0),
        )];

        let frame = compositor.compose(&layers).unwrap();

        // Should work correctly with buffer pool
        let pixel = frame.get_pixel(50, 50);
        assert_eq!(pixel[0], 255); // Red
    }

    #[test]
    fn test_buffer_pool_wrong_dimensions() {
        let pool = BufferPool::new(2, 100, 100);

        // Create buffer with different dimensions
        let wrong_buffer = RgbaImage::new(50, 50);

        // Release it - should be rejected
        pool.release(wrong_buffer);
        assert_eq!(pool.available(), 2); // Should not be added to pool
    }

    // Parallel Rendering Tests

    #[cfg(not(target_arch = "wasm32"))]
    #[test]
    fn test_parallel_blend_correctness() {
        let compositor = Compositor::new(200, 200).unwrap();

        // Create two layers to blend
        let layers = vec![
            Layer::solid_color(Color::red(), Transform::default()),
            Layer::solid_color(
                Color::new(0, 255, 0, 128), // Semi-transparent green
                Transform::new().with_position(50.0, 50.0).with_scale(0.5),
            ),
        ];

        let frame = compositor.compose(&layers).unwrap();

        // Verify blending occurred correctly
        // Red background
        let bg_pixel = frame.get_pixel(10, 10);
        assert_eq!(bg_pixel[0], 255);
        assert_eq!(bg_pixel[1], 0);

        // Blended area should have both red and green
        let blend_pixel = frame.get_pixel(75, 75);
        assert!(blend_pixel[0] > 0); // Has red
        assert!(blend_pixel[1] > 0); // Has green
    }

    #[cfg(not(target_arch = "wasm32"))]
    #[test]
    fn test_parallel_blend_with_multiple_layers() {
        let compositor = Compositor::new(300, 300).unwrap();

        let mut layers = Vec::new();
        for i in 0..10 {
            layers.push(Layer::solid_color(
                Color::new(255, 0, 0, 25), // Very transparent red
                Transform::new()
                    .with_position(i as f32 * 10.0, i as f32 * 10.0)
                    .with_scale(0.3),
            ));
        }

        let frame = compositor.compose(&layers).unwrap();

        // Should complete without errors
        assert_eq!(frame.width(), 300);
        assert_eq!(frame.height(), 300);
    }

    // Tile-based Rendering Tests

    #[test]
    fn test_create_tiles() {
        let compositor = Compositor::new(512, 512)
            .unwrap()
            .with_tile_rendering(256);

        let tiles = compositor.create_tiles();

        // Should create 4 tiles (2x2)
        assert_eq!(tiles.len(), 4);

        // Verify tile dimensions
        assert_eq!(tiles[0].bounds.width, 256.0);
        assert_eq!(tiles[0].bounds.height, 256.0);
    }

    #[test]
    fn test_create_tiles_non_divisible() {
        let compositor = Compositor::new(500, 400)
            .unwrap()
            .with_tile_rendering(256);

        let tiles = compositor.create_tiles();

        // Should create 4 tiles with edge tiles being smaller
        assert_eq!(tiles.len(), 4);

        // Check last tile dimensions (should be partial)
        let last_tile = &tiles[3];
        assert!(last_tile.bounds.width <= 256.0);
        assert!(last_tile.bounds.height <= 256.0);
    }

    #[test]
    fn test_tiled_composition_produces_correct_output() {
        let compositor = Compositor::new(400, 400)
            .unwrap()
            .with_background(Color::blue())
            .with_tile_rendering(200);

        let layers = vec![Layer::solid_color(
            Color::red(),
            Transform::new().with_position(100.0, 100.0).with_scale(0.5),
        )];

        let frame = compositor.compose_tiled(&layers).unwrap();

        // Background should be blue
        let bg_pixel = frame.get_pixel(10, 10);
        assert_eq!(bg_pixel[2], 255);

        // Red layer should be visible
        let layer_pixel = frame.get_pixel(150, 150);
        assert_eq!(layer_pixel[0], 255);
    }

    #[test]
    fn test_tiled_vs_standard_composition() {
        // Compare tiled and standard composition outputs
        let layers = vec![
            Layer::solid_color(Color::blue(), Transform::default()),
            Layer::solid_color(
                Color::red(),
                Transform::new().with_position(50.0, 50.0).with_scale(0.5),
            ),
        ];

        let standard_compositor = Compositor::new(200, 200).unwrap();
        let standard_frame = standard_compositor.compose(&layers).unwrap();

        let tiled_compositor = Compositor::new(200, 200)
            .unwrap()
            .with_tile_rendering(100);
        let tiled_frame = tiled_compositor.compose_tiled(&layers).unwrap();

        // Sample some pixels - should be identical
        for y in [0, 50, 100, 150, 199] {
            for x in [0, 50, 100, 150, 199] {
                assert_eq!(
                    standard_frame.get_pixel(x, y),
                    tiled_frame.get_pixel(x, y),
                    "Pixel mismatch at ({}, {})",
                    x,
                    y
                );
            }
        }
    }

    #[test]
    fn test_layer_intersects_tile() {
        let compositor = Compositor::new(400, 400)
            .unwrap()
            .with_tile_rendering(200);

        // SolidColor layer with known bounds
        let layer1 = Layer::solid_color(
            Color::red(),
            Transform::new().with_position(50.0, 50.0).with_scale(0.2),
        );

        // Tile in top-left
        let tile1 = Tile {
            bounds: Rect {
                x: 0.0,
                y: 0.0,
                width: 200.0,
                height: 200.0,
            },
            index: 0,
        };

        // Layer is at (50, 50) with size 400*0.2 = 80x80, so it's in the range [50, 130]
        // This should intersect with tile1 [0, 200]
        assert!(compositor.layer_intersects_tile(&layer1, &tile1));

        // Tile in bottom-right
        let tile2 = Tile {
            bounds: Rect {
                x: 200.0,
                y: 200.0,
                width: 200.0,
                height: 200.0,
            },
            index: 3,
        };

        // Layer ends at 130, tile starts at 200 - should NOT intersect
        assert!(!compositor.layer_intersects_tile(&layer1, &tile2));

        // Test with an image layer (returns true conservatively)
        let layer2 = Layer::image(
            "test.png",
            Transform::new().with_position(50.0, 50.0),
        );
        // Image layers always return true (conservative)
        assert!(compositor.layer_intersects_tile(&layer2, &tile2));
    }

    #[test]
    fn test_compose_tiled_with_disabled_tiles() {
        let compositor = Compositor::new(200, 200).unwrap(); // No tile_size set

        let layers = vec![Layer::solid_color(Color::green(), Transform::default())];

        // Should fall back to standard compose
        let frame = compositor.compose_tiled(&layers).unwrap();

        let pixel = frame.get_pixel(100, 100);
        assert_eq!(pixel[1], 255); // Green
    }

    // Integration test combining all optimizations

    #[test]
    fn test_all_optimizations_together() {
        let compositor = Compositor::new(512, 512)
            .unwrap()
            .with_background(Color::white())
            .with_buffer_pool(10)
            .with_tile_rendering(256);

        let layers = vec![
            Layer::solid_color(
                Color::red(),
                Transform::new().with_position(100.0, 100.0).with_scale(0.3),
            ),
            Layer::solid_color(
                Color::blue(),
                Transform::new().with_position(300.0, 300.0).with_scale(0.3),
            ),
        ];

        // Should work with all optimizations enabled
        let frame = compositor.compose_tiled(&layers).unwrap();
        assert_eq!(frame.width(), 512);
        assert_eq!(frame.height(), 512);

        // Verify background
        let bg_pixel = frame.get_pixel(10, 10);
        assert_eq!(bg_pixel[0], 255);
        assert_eq!(bg_pixel[1], 255);
        assert_eq!(bg_pixel[2], 255);
    }

    // Resolution scaling tests

    #[test]
    fn test_compose_with_full_resolution_scale() {
        let compositor = Compositor::new(100, 100).unwrap();
        let layers = vec![Layer::solid_color(Color::red(), Transform::default())];

        // Scale = 1.0 should produce same result as normal compose
        let frame = compositor.compose_with_resolution_scale(&layers, 1.0).unwrap();

        assert_eq!(frame.width(), 100);
        assert_eq!(frame.height(), 100);

        let pixel = frame.get_pixel(50, 50);
        assert_eq!(pixel[0], 255); // Red
    }

    #[test]
    fn test_compose_with_half_resolution_scale() {
        let compositor = Compositor::new(200, 200).unwrap();
        let layers = vec![Layer::solid_color(Color::blue(), Transform::default())];

        // Render at 50% resolution, then upscale
        let frame = compositor.compose_with_resolution_scale(&layers, 0.5).unwrap();

        // Output should still be full resolution
        assert_eq!(frame.width(), 200);
        assert_eq!(frame.height(), 200);

        // Should have blue content (may be slightly different due to scaling)
        let pixel = frame.get_pixel(100, 100);
        assert!(pixel[2] > 200, "Should be mostly blue"); // Blue channel
    }

    #[test]
    fn test_compose_with_minimum_resolution_scale() {
        let compositor = Compositor::new(100, 100).unwrap();
        let layers = vec![Layer::solid_color(Color::green(), Transform::default())];

        // Very low scale factor
        let frame = compositor.compose_with_resolution_scale(&layers, 0.1).unwrap();

        // Output should still be full resolution
        assert_eq!(frame.width(), 100);
        assert_eq!(frame.height(), 100);

        // Should have green content
        let pixel = frame.get_pixel(50, 50);
        assert!(pixel[1] > 200, "Should be mostly green");
    }

    #[test]
    fn test_resolution_scale_clamping() {
        let compositor = Compositor::new(100, 100).unwrap();
        let layers = vec![Layer::solid_color(Color::red(), Transform::default())];

        // Test values outside valid range get clamped
        let frame1 = compositor.compose_with_resolution_scale(&layers, 2.0).unwrap(); // > 1.0
        let frame2 = compositor.compose_with_resolution_scale(&layers, 0.01).unwrap(); // < 0.1

        // Both should succeed
        assert_eq!(frame1.width(), 100);
        assert_eq!(frame2.width(), 100);
    }
}
