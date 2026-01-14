//! Frame representation and operations

use image::RgbaImage;
use std::path::Path;

use crate::{types::Size, Result};

/// A single video frame
pub struct Frame {
    /// The underlying image data
    image: RgbaImage,

    /// Frame size
    size: Size,
}

impl Frame {
    /// Create a new frame with given dimensions
    pub fn new(width: u32, height: u32) -> Self {
        let image = RgbaImage::new(width, height);
        Self {
            image,
            size: Size::new(width, height),
        }
    }

    /// Create a frame from an existing image
    pub fn from_image(image: RgbaImage) -> Self {
        let (width, height) = image.dimensions();
        Self {
            image,
            size: Size::new(width, height),
        }
    }

    /// Get frame dimensions
    pub fn size(&self) -> Size {
        self.size
    }

    /// Get reference to underlying image
    pub fn image(&self) -> &RgbaImage {
        &self.image
    }

    /// Get mutable reference to underlying image
    pub fn image_mut(&mut self) -> &mut RgbaImage {
        &mut self.image
    }

    /// Save frame to file
    pub fn save<P: AsRef<Path>>(&self, path: P) -> Result<()> {
        self.image.save(path)?;
        Ok(())
    }

    /// Convert to raw RGBA bytes
    pub fn to_bytes(&self) -> &[u8] {
        self.image.as_raw()
    }

    /// Get pixel at position (x, y)
    pub fn get_pixel(&self, x: u32, y: u32) -> [u8; 4] {
        let pixel = self.image.get_pixel(x, y);
        [pixel[0], pixel[1], pixel[2], pixel[3]]
    }

    /// Set pixel at position (x, y)
    pub fn set_pixel(&mut self, x: u32, y: u32, color: [u8; 4]) {
        use image::Pixel;
        let pixel = image::Rgba(color);
        self.image.put_pixel(x, y, pixel);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_frame_creation() {
        let frame = Frame::new(1920, 1080);
        assert_eq!(frame.size().width, 1920);
        assert_eq!(frame.size().height, 1080);
    }

    #[test]
    fn test_pixel_operations() {
        let mut frame = Frame::new(100, 100);
        frame.set_pixel(50, 50, [255, 0, 0, 255]);

        let pixel = frame.get_pixel(50, 50);
        assert_eq!(pixel, [255, 0, 0, 255]);
    }
}
