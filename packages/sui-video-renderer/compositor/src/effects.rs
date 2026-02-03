//! Image effects and filters

use image::RgbaImage;
use imageproc::filter::gaussian_blur_f32;
use serde::{Deserialize, Serialize};

use crate::Result;

/// Effects that can be applied to layers
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Effect {
    /// Gaussian blur with radius
    Blur { radius: f32 },

    /// Brightness adjustment (-1.0 to 1.0)
    Brightness { amount: f32 },

    /// Contrast adjustment (-1.0 to 1.0)
    Contrast { amount: f32 },

    /// Saturation adjustment (-1.0 to 1.0)
    Saturation { amount: f32 },

    /// Hue rotation in degrees
    HueRotate { degrees: f32 },

    /// Drop shadow
    Shadow {
        offset_x: f32,
        offset_y: f32,
        blur: f32,
        color: [u8; 4],
    },
}

impl Effect {
    /// Apply this effect to an image
    pub fn apply(&self, image: &RgbaImage) -> Result<RgbaImage> {
        match self {
            Effect::Blur { radius } => Ok(Self::apply_blur(image, *radius)),
            Effect::Brightness { amount } => Ok(Self::apply_brightness(image, *amount)),
            Effect::Contrast { amount } => Ok(Self::apply_contrast(image, *amount)),
            Effect::Saturation { amount } => Ok(Self::apply_saturation(image, *amount)),
            Effect::HueRotate { degrees } => Ok(Self::apply_hue_rotate(image, *degrees)),
            Effect::Shadow { .. } => {
                // Shadow requires special handling in compositor
                Ok(image.clone())
            }
        }
    }

    fn apply_blur(image: &RgbaImage, radius: f32) -> RgbaImage {
        gaussian_blur_f32(image, radius)
    }

    fn apply_brightness(image: &RgbaImage, amount: f32) -> RgbaImage {
        let mut result = image.clone();
        let clamped = amount.clamp(-1.0, 1.0);
        let adjustment = (clamped * 255.0) as i16;

        for pixel in result.pixels_mut() {
            pixel[0] = (pixel[0] as i16 + adjustment).clamp(0, 255) as u8;
            pixel[1] = (pixel[1] as i16 + adjustment).clamp(0, 255) as u8;
            pixel[2] = (pixel[2] as i16 + adjustment).clamp(0, 255) as u8;
        }

        result
    }

    fn apply_contrast(image: &RgbaImage, amount: f32) -> RgbaImage {
        let mut result = image.clone();
        let clamped = amount.clamp(-1.0, 1.0);
        let factor = (1.0 + clamped).max(0.0);

        for pixel in result.pixels_mut() {
            let r = ((pixel[0] as f32 - 128.0) * factor + 128.0).clamp(0.0, 255.0) as u8;
            let g = ((pixel[1] as f32 - 128.0) * factor + 128.0).clamp(0.0, 255.0) as u8;
            let b = ((pixel[2] as f32 - 128.0) * factor + 128.0).clamp(0.0, 255.0) as u8;

            pixel[0] = r;
            pixel[1] = g;
            pixel[2] = b;
        }

        result
    }

    fn apply_saturation(image: &RgbaImage, amount: f32) -> RgbaImage {
        let mut result = image.clone();
        let clamped = amount.clamp(-1.0, 1.0);
        let factor = 1.0 + clamped;

        for pixel in result.pixels_mut() {
            let r = pixel[0] as f32 / 255.0;
            let g = pixel[1] as f32 / 255.0;
            let b = pixel[2] as f32 / 255.0;

            // Convert to grayscale
            let gray = 0.299 * r + 0.587 * g + 0.114 * b;

            // Interpolate between grayscale and original
            let r_new = (gray + (r - gray) * factor).clamp(0.0, 1.0);
            let g_new = (gray + (g - gray) * factor).clamp(0.0, 1.0);
            let b_new = (gray + (b - gray) * factor).clamp(0.0, 1.0);

            pixel[0] = (r_new * 255.0) as u8;
            pixel[1] = (g_new * 255.0) as u8;
            pixel[2] = (b_new * 255.0) as u8;
        }

        result
    }

    fn apply_hue_rotate(image: &RgbaImage, degrees: f32) -> RgbaImage {
        let mut result = image.clone();
        let radians = degrees.to_radians();

        for pixel in result.pixels_mut() {
            let (r, g, b) = Self::rgb_to_hsl(pixel[0], pixel[1], pixel[2]);

            // Rotate hue
            let h_new = (r + radians) % (2.0 * std::f32::consts::PI);

            let (r_new, g_new, b_new) = Self::hsl_to_rgb(h_new, g, b);

            pixel[0] = r_new;
            pixel[1] = g_new;
            pixel[2] = b_new;
        }

        result
    }

    fn rgb_to_hsl(r: u8, g: u8, b: u8) -> (f32, f32, f32) {
        let r = r as f32 / 255.0;
        let g = g as f32 / 255.0;
        let b = b as f32 / 255.0;

        let max = r.max(g).max(b);
        let min = r.min(g).min(b);
        let delta = max - min;

        let l = (max + min) / 2.0;

        if delta == 0.0 {
            return (0.0, 0.0, l);
        }

        let s = if l < 0.5 {
            delta / (max + min)
        } else {
            delta / (2.0 - max - min)
        };

        let h = if max == r {
            ((g - b) / delta + if g < b { 6.0 } else { 0.0 }) / 6.0
        } else if max == g {
            ((b - r) / delta + 2.0) / 6.0
        } else {
            ((r - g) / delta + 4.0) / 6.0
        } * 2.0
            * std::f32::consts::PI;

        (h, s, l)
    }

    fn hsl_to_rgb(h: f32, s: f32, l: f32) -> (u8, u8, u8) {
        if s == 0.0 {
            let gray = (l * 255.0) as u8;
            return (gray, gray, gray);
        }

        let h = h / (2.0 * std::f32::consts::PI);

        let q = if l < 0.5 { l * (1.0 + s) } else { l + s - l * s };
        let p = 2.0 * l - q;

        let r = Self::hue_to_rgb(p, q, h + 1.0 / 3.0);
        let g = Self::hue_to_rgb(p, q, h);
        let b = Self::hue_to_rgb(p, q, h - 1.0 / 3.0);

        ((r * 255.0) as u8, (g * 255.0) as u8, (b * 255.0) as u8)
    }

    fn hue_to_rgb(p: f32, q: f32, mut t: f32) -> f32 {
        if t < 0.0 {
            t += 1.0;
        }
        if t > 1.0 {
            t -= 1.0;
        }
        if t < 1.0 / 6.0 {
            return p + (q - p) * 6.0 * t;
        }
        if t < 1.0 / 2.0 {
            return q;
        }
        if t < 2.0 / 3.0 {
            return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
        }
        p
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::Rgba;

    #[test]
    fn test_brightness() {
        let mut image = RgbaImage::new(10, 10);
        for pixel in image.pixels_mut() {
            *pixel = Rgba([100, 100, 100, 255]);
        }

        let effect = Effect::Brightness { amount: 0.5 };
        let result = effect.apply(&image).unwrap();

        // Should be brighter
        assert!(result.get_pixel(0, 0)[0] > 100);
    }

    #[test]
    fn test_blur() {
        let mut image = RgbaImage::new(100, 100);
        // Create a sharp edge
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

        // Edge should be blurred
        let edge_pixel = result.get_pixel(50, 50);
        assert!(edge_pixel[0] > 0 && edge_pixel[0] < 255);
    }
}
