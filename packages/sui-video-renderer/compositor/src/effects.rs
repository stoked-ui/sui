//! Image effects and filters

use image::{Rgba, RgbaImage};
use imageproc::filter::gaussian_blur_f32;
use serde::{Deserialize, Serialize};

use crate::{types::{Color, Point}, Result};

/// Gradient stop for gradient effects
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GradientStop {
    /// Position along the gradient (0.0 to 1.0)
    pub position: f32,
    /// Color at this stop
    pub color: Color,
}

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

    /// Linear gradient
    LinearGradient {
        angle: f32,
        stops: Vec<GradientStop>
    },

    /// Radial gradient
    RadialGradient {
        center: Point,
        radius: f32,
        stops: Vec<GradientStop>
    },

    /// Invert colors
    Invert,

    /// Convert to grayscale
    Grayscale,

    /// Apply sepia tone
    Sepia { intensity: f32 },

    /// Apply 4x5 color matrix
    ColorMatrix { matrix: [f32; 20] },

    /// Chromatic aberration effect
    ChromaticAberration { intensity: f32 },
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
            Effect::LinearGradient { angle, stops } => Ok(Self::apply_linear_gradient(image, *angle, stops)),
            Effect::RadialGradient { center, radius, stops } => Ok(Self::apply_radial_gradient(image, *center, *radius, stops)),
            Effect::Invert => Ok(Self::apply_invert(image)),
            Effect::Grayscale => Ok(Self::apply_grayscale(image)),
            Effect::Sepia { intensity } => Ok(Self::apply_sepia(image, *intensity)),
            Effect::ColorMatrix { matrix } => Ok(Self::apply_color_matrix(image, matrix)),
            Effect::ChromaticAberration { intensity } => Ok(Self::apply_chromatic_aberration(image, *intensity)),
        }
    }

    /// Create a shadow image from the source
    pub fn create_shadow(image: &RgbaImage, blur: f32, color: [u8; 4]) -> RgbaImage {
        let (width, height) = image.dimensions();
        let mut shadow = RgbaImage::new(width, height);

        // Extract alpha channel and fill with shadow color
        for y in 0..height {
            for x in 0..width {
                let pixel = image.get_pixel(x, y);
                let alpha = pixel[3];
                shadow.put_pixel(x, y, Rgba([color[0], color[1], color[2], alpha]));
            }
        }

        // Apply blur
        if blur > 0.0 {
            shadow = gaussian_blur_f32(&shadow, blur);
        }

        shadow
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

    fn apply_linear_gradient(image: &RgbaImage, angle: f32, stops: &[GradientStop]) -> RgbaImage {
        let (width, height) = image.dimensions();
        let mut result = image.clone();

        if stops.is_empty() {
            return result;
        }

        // Convert angle to radians
        let radians = angle.to_radians();
        let cos = radians.cos();
        let sin = radians.sin();

        // Calculate gradient line length
        let w = width as f32;
        let h = height as f32;
        let gradient_length = (w * cos.abs() + h * sin.abs()).max(1.0);

        for y in 0..height {
            for x in 0..width {
                // Calculate position along gradient (0.0 to 1.0)
                let dx = x as f32 - w / 2.0;
                let dy = y as f32 - h / 2.0;
                let t = ((dx * cos + dy * sin) / gradient_length + 0.5).clamp(0.0, 1.0);

                // Interpolate color from gradient stops
                let gradient_color = Self::interpolate_gradient(t, stops);

                // Blend gradient color with source pixel
                let src_pixel = image.get_pixel(x, y);
                let blended = Self::blend_colors(
                    [src_pixel[0], src_pixel[1], src_pixel[2], src_pixel[3]],
                    [gradient_color.r, gradient_color.g, gradient_color.b, gradient_color.a],
                );

                result.put_pixel(x, y, Rgba(blended));
            }
        }

        result
    }

    fn apply_radial_gradient(image: &RgbaImage, center: Point, radius: f32, stops: &[GradientStop]) -> RgbaImage {
        let (width, height) = image.dimensions();
        let mut result = image.clone();

        if stops.is_empty() || radius <= 0.0 {
            return result;
        }

        for y in 0..height {
            for x in 0..width {
                // Calculate distance from center
                let dx = x as f32 - center.x;
                let dy = y as f32 - center.y;
                let distance = (dx * dx + dy * dy).sqrt();
                let t = (distance / radius).clamp(0.0, 1.0);

                // Interpolate color from gradient stops
                let gradient_color = Self::interpolate_gradient(t, stops);

                // Blend gradient color with source pixel
                let src_pixel = image.get_pixel(x, y);
                let blended = Self::blend_colors(
                    [src_pixel[0], src_pixel[1], src_pixel[2], src_pixel[3]],
                    [gradient_color.r, gradient_color.g, gradient_color.b, gradient_color.a],
                );

                result.put_pixel(x, y, Rgba(blended));
            }
        }

        result
    }

    fn interpolate_gradient(t: f32, stops: &[GradientStop]) -> Color {
        if stops.is_empty() {
            return Color::transparent();
        }
        if stops.len() == 1 {
            return stops[0].color;
        }

        // Find the two stops to interpolate between
        let mut prev_stop = &stops[0];
        let mut next_stop = &stops[stops.len() - 1];

        for i in 0..stops.len() - 1 {
            if t >= stops[i].position && t <= stops[i + 1].position {
                prev_stop = &stops[i];
                next_stop = &stops[i + 1];
                break;
            }
        }

        // Handle edge cases
        if t <= prev_stop.position {
            return prev_stop.color;
        }
        if t >= next_stop.position {
            return next_stop.color;
        }

        // Linear interpolation between stops
        let range = next_stop.position - prev_stop.position;
        let local_t = if range > 0.0 {
            (t - prev_stop.position) / range
        } else {
            0.0
        };

        Color::new(
            Self::lerp(prev_stop.color.r, next_stop.color.r, local_t),
            Self::lerp(prev_stop.color.g, next_stop.color.g, local_t),
            Self::lerp(prev_stop.color.b, next_stop.color.b, local_t),
            Self::lerp(prev_stop.color.a, next_stop.color.a, local_t),
        )
    }

    fn lerp(a: u8, b: u8, t: f32) -> u8 {
        let a = a as f32;
        let b = b as f32;
        (a + (b - a) * t).clamp(0.0, 255.0) as u8
    }

    fn blend_colors(bottom: [u8; 4], top: [u8; 4]) -> [u8; 4] {
        let alpha_top = top[3] as f32 / 255.0;
        let alpha_bottom = bottom[3] as f32 / 255.0;
        let alpha_out = alpha_top + alpha_bottom * (1.0 - alpha_top);

        if alpha_out == 0.0 {
            return [0, 0, 0, 0];
        }

        let r = ((top[0] as f32 * alpha_top + bottom[0] as f32 * alpha_bottom * (1.0 - alpha_top)) / alpha_out) as u8;
        let g = ((top[1] as f32 * alpha_top + bottom[1] as f32 * alpha_bottom * (1.0 - alpha_top)) / alpha_out) as u8;
        let b = ((top[2] as f32 * alpha_top + bottom[2] as f32 * alpha_bottom * (1.0 - alpha_top)) / alpha_out) as u8;
        let a = (alpha_out * 255.0) as u8;

        [r, g, b, a]
    }

    fn apply_invert(image: &RgbaImage) -> RgbaImage {
        let mut result = image.clone();

        for pixel in result.pixels_mut() {
            pixel[0] = 255 - pixel[0]; // Invert R
            pixel[1] = 255 - pixel[1]; // Invert G
            pixel[2] = 255 - pixel[2]; // Invert B
            // Keep alpha unchanged
        }

        result
    }

    fn apply_grayscale(image: &RgbaImage) -> RgbaImage {
        let mut result = image.clone();

        for pixel in result.pixels_mut() {
            let r = pixel[0] as f32 / 255.0;
            let g = pixel[1] as f32 / 255.0;
            let b = pixel[2] as f32 / 255.0;

            // Standard luminance formula
            let gray = (0.299 * r + 0.587 * g + 0.114 * b) * 255.0;
            let gray_u8 = gray as u8;

            pixel[0] = gray_u8;
            pixel[1] = gray_u8;
            pixel[2] = gray_u8;
            // Keep alpha unchanged
        }

        result
    }

    fn apply_sepia(image: &RgbaImage, intensity: f32) -> RgbaImage {
        let mut result = image.clone();
        let intensity = intensity.clamp(0.0, 1.0);

        for pixel in result.pixels_mut() {
            let r = pixel[0] as f32 / 255.0;
            let g = pixel[1] as f32 / 255.0;
            let b = pixel[2] as f32 / 255.0;

            // Sepia tone matrix
            let tr = (0.393 * r + 0.769 * g + 0.189 * b).min(1.0);
            let tg = (0.349 * r + 0.686 * g + 0.168 * b).min(1.0);
            let tb = (0.272 * r + 0.534 * g + 0.131 * b).min(1.0);

            // Blend with original based on intensity
            let r_new = (r + (tr - r) * intensity) * 255.0;
            let g_new = (g + (tg - g) * intensity) * 255.0;
            let b_new = (b + (tb - b) * intensity) * 255.0;

            pixel[0] = r_new as u8;
            pixel[1] = g_new as u8;
            pixel[2] = b_new as u8;
            // Keep alpha unchanged
        }

        result
    }

    fn apply_color_matrix(image: &RgbaImage, matrix: &[f32; 20]) -> RgbaImage {
        let mut result = image.clone();

        for pixel in result.pixels_mut() {
            let r = pixel[0] as f32 / 255.0;
            let g = pixel[1] as f32 / 255.0;
            let b = pixel[2] as f32 / 255.0;
            let a = pixel[3] as f32 / 255.0;

            // Apply 4x5 color matrix (RGBA + offset)
            let r_new = (matrix[0] * r + matrix[1] * g + matrix[2] * b + matrix[3] * a + matrix[4]).clamp(0.0, 1.0);
            let g_new = (matrix[5] * r + matrix[6] * g + matrix[7] * b + matrix[8] * a + matrix[9]).clamp(0.0, 1.0);
            let b_new = (matrix[10] * r + matrix[11] * g + matrix[12] * b + matrix[13] * a + matrix[14]).clamp(0.0, 1.0);
            let a_new = (matrix[15] * r + matrix[16] * g + matrix[17] * b + matrix[18] * a + matrix[19]).clamp(0.0, 1.0);

            pixel[0] = (r_new * 255.0) as u8;
            pixel[1] = (g_new * 255.0) as u8;
            pixel[2] = (b_new * 255.0) as u8;
            pixel[3] = (a_new * 255.0) as u8;
        }

        result
    }

    fn apply_chromatic_aberration(image: &RgbaImage, intensity: f32) -> RgbaImage {
        let (width, height) = image.dimensions();
        let mut result = image.clone();
        let offset = intensity.round() as i32;

        for y in 0..height {
            for x in 0..width {
                let pixel = image.get_pixel(x, y);

                // Red channel offset to the right
                let r_x = (x as i32 + offset).clamp(0, width as i32 - 1) as u32;
                let r_pixel = image.get_pixel(r_x, y);

                // Blue channel offset to the left
                let b_x = (x as i32 - offset).clamp(0, width as i32 - 1) as u32;
                let b_pixel = image.get_pixel(b_x, y);

                // Combine: R from offset right, G from original, B from offset left
                result.put_pixel(x, y, Rgba([
                    r_pixel[0],  // Red from right offset
                    pixel[1],    // Green from original
                    b_pixel[2],  // Blue from left offset
                    pixel[3],    // Alpha from original
                ]));
            }
        }

        result
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

    #[test]
    fn test_shadow_creation() {
        // Create a 50x50 white square with full alpha
        let mut image = RgbaImage::new(50, 50);
        for pixel in image.pixels_mut() {
            *pixel = Rgba([255, 255, 255, 255]);
        }

        // Create shadow with black color and blur
        let shadow = Effect::create_shadow(&image, 5.0, [0, 0, 0, 255]);

        // Shadow should be blurred, so edge pixels should have lower opacity
        let center = shadow.get_pixel(25, 25);
        assert_eq!(center[0], 0); // Black
        assert_eq!(center[1], 0);
        assert_eq!(center[2], 0);
        // Alpha should be preserved (around 255, might be slightly less due to blur)
        assert!(center[3] > 200);
    }

    #[test]
    fn test_linear_gradient() {
        // Create a 100x100 image
        let mut image = RgbaImage::new(100, 100);
        for pixel in image.pixels_mut() {
            *pixel = Rgba([255, 255, 255, 255]);
        }

        // Create a gradient from red to blue
        let stops = vec![
            GradientStop { position: 0.0, color: Color::red() },
            GradientStop { position: 1.0, color: Color::blue() },
        ];

        let effect = Effect::LinearGradient { angle: 0.0, stops };
        let result = effect.apply(&image).unwrap();

        // Left side should be more red, right side more blue
        let left = result.get_pixel(10, 50);
        let right = result.get_pixel(90, 50);

        // Left should have more red
        assert!(left[0] > left[2]);
        // Right should have more blue
        assert!(right[2] > right[0]);
    }

    #[test]
    fn test_invert() {
        let mut image = RgbaImage::new(10, 10);
        // Red pixel
        for pixel in image.pixels_mut() {
            *pixel = Rgba([255, 0, 0, 255]);
        }

        let effect = Effect::Invert;
        let result = effect.apply(&image).unwrap();

        let pixel = result.get_pixel(0, 0);
        // Red inverts to cyan (0, 255, 255)
        assert_eq!(pixel[0], 0);
        assert_eq!(pixel[1], 255);
        assert_eq!(pixel[2], 255);
        assert_eq!(pixel[3], 255); // Alpha unchanged
    }

    #[test]
    fn test_grayscale() {
        let mut image = RgbaImage::new(10, 10);
        // Red pixel
        for pixel in image.pixels_mut() {
            *pixel = Rgba([255, 100, 50, 255]);
        }

        let effect = Effect::Grayscale;
        let result = effect.apply(&image).unwrap();

        let pixel = result.get_pixel(0, 0);
        // All RGB channels should be equal (±1 for rounding)
        assert!((pixel[0] as i32 - pixel[1] as i32).abs() <= 1);
        assert!((pixel[1] as i32 - pixel[2] as i32).abs() <= 1);
        assert_eq!(pixel[3], 255); // Alpha unchanged
    }

    #[test]
    fn test_sepia() {
        let mut image = RgbaImage::new(10, 10);
        // White pixel
        for pixel in image.pixels_mut() {
            *pixel = Rgba([200, 200, 200, 255]);
        }

        let effect = Effect::Sepia { intensity: 1.0 };
        let result = effect.apply(&image).unwrap();

        let pixel = result.get_pixel(0, 0);
        // Sepia tone: red > green > blue for non-black pixels
        assert!(pixel[0] > pixel[1]);
        assert!(pixel[1] > pixel[2]);
        assert_eq!(pixel[3], 255); // Alpha unchanged
    }

    #[test]
    fn test_chromatic_aberration() {
        let mut image = RgbaImage::new(100, 100);
        // Create a vertical white line in the middle
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

        // Chromatic aberration shifts R right and B left
        // At x=40 (left of white bar): R comes from x=45 (white), so R should be 255
        let left_fringe = result.get_pixel(40, 50);
        assert_eq!(left_fringe[0], 255, "Left fringe should have red from shifted white area");
        assert_eq!(left_fringe[1], 0, "Left fringe green should be from black area");
        assert_eq!(left_fringe[2], 0, "Left fringe blue should be from black area");

        // At x=60 (right of white bar): B comes from x=55 (white), so B should be 255
        let right_fringe = result.get_pixel(60, 50);
        assert_eq!(right_fringe[0], 0, "Right fringe red should be from black area");
        assert_eq!(right_fringe[1], 0, "Right fringe green should be from black area");
        assert_eq!(right_fringe[2], 255, "Right fringe should have blue from shifted white area");
    }

    #[test]
    fn test_radial_gradient() {
        let mut image = RgbaImage::new(100, 100);
        for pixel in image.pixels_mut() {
            *pixel = Rgba([255, 255, 255, 255]);
        }

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
        assert!(center[0] > center[2]);

        // Edge should be more blue
        let edge = result.get_pixel(5, 50);
        assert!(edge[2] > edge[0]);
    }

    #[test]
    fn test_color_matrix_identity() {
        let mut image = RgbaImage::new(10, 10);
        for pixel in image.pixels_mut() {
            *pixel = Rgba([128, 64, 192, 255]);
        }

        // Identity matrix
        #[allow(clippy::excessive_precision)]
        let matrix = [
            1.0, 0.0, 0.0, 0.0, 0.0,  // R
            0.0, 1.0, 0.0, 0.0, 0.0,  // G
            0.0, 0.0, 1.0, 0.0, 0.0,  // B
            0.0, 0.0, 0.0, 1.0, 0.0,  // A
        ];

        let effect = Effect::ColorMatrix { matrix };
        let result = effect.apply(&image).unwrap();

        let pixel = result.get_pixel(0, 0);
        // Should be unchanged
        assert_eq!(pixel[0], 128);
        assert_eq!(pixel[1], 64);
        assert_eq!(pixel[2], 192);
        assert_eq!(pixel[3], 255);
    }
}
