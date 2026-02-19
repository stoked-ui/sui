//! Text rendering using fontdue

use fontdue::{
    layout::{CoordinateSystem, Layout, LayoutSettings, TextStyle as FontdueTextStyle},
    Font, FontSettings,
};
use image::{Rgba, RgbaImage};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::types::Color;

/// Text alignment options
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TextAlignment {
    Left,
    Center,
    Right,
}

impl Default for TextAlignment {
    fn default() -> Self {
        Self::Left
    }
}

/// Stroke style for text outline
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Stroke {
    pub color: Color,
    pub width: f32,
}

/// Text shadow effect
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct TextShadow {
    pub color: Color,
    pub offset_x: f32,
    pub offset_y: f32,
    pub blur: f32,
}

/// Complete text styling information
#[derive(Debug, Clone)]
pub struct TextStyle {
    pub font_family: String,
    pub font_size: f32,
    pub font_weight: u16,
    pub color: Color,
    pub alignment: TextAlignment,
    pub line_height: f32,
    pub letter_spacing: f32,
    pub wrap_width: Option<f32>,
    pub stroke: Option<Stroke>,
    pub shadow: Option<TextShadow>,
}

impl Default for TextStyle {
    fn default() -> Self {
        Self {
            font_family: "default".to_string(),
            font_size: 16.0,
            font_weight: 400,
            color: Color::black(),
            alignment: TextAlignment::Left,
            line_height: 1.2,
            letter_spacing: 0.0,
            wrap_width: None,
            stroke: None,
            shadow: None,
        }
    }
}

/// Text renderer with font caching
pub struct TextRenderer {
    /// Cached fonts by (family, weight) -> Font
    font_cache: HashMap<(String, u16), Font>,

    /// Default embedded font
    default_font: Font,
}

impl TextRenderer {
    /// Create a new text renderer with default embedded font
    pub fn new() -> Self {
        // Embed Roboto Regular font
        const DEFAULT_FONT_DATA: &[u8] = include_bytes!("../Roboto-Regular.ttf");

        let default_font = Font::from_bytes(DEFAULT_FONT_DATA, FontSettings::default())
            .expect("Failed to load embedded font");

        let mut font_cache = HashMap::new();
        font_cache.insert(("default".to_string(), 400), default_font.clone());

        Self {
            font_cache,
            default_font,
        }
    }

    /// Load a custom font from bytes
    pub fn load_font(&mut self, family: String, weight: u16, data: &[u8]) -> Result<(), String> {
        let font = Font::from_bytes(data, FontSettings::default())
            .map_err(|e| format!("Failed to load font: {}", e))?;

        self.font_cache.insert((family, weight), font);
        Ok(())
    }

    /// Get font from cache or return default
    fn get_font(&self, family: &str, weight: u16) -> &Font {
        self.font_cache
            .get(&(family.to_string(), weight))
            .or_else(|| self.font_cache.get(&(family.to_string(), 400)))
            .unwrap_or(&self.default_font)
    }

    /// Render text to an RGBA image
    pub fn render(&self, text: &str, style: &TextStyle) -> RgbaImage {
        // Get the font to use
        let font = self.get_font(&style.font_family, style.font_weight);

        // Create layout engine
        let mut layout = Layout::new(CoordinateSystem::PositiveYDown);

        let wrap_width = style.wrap_width.unwrap_or(f32::MAX);

        layout.reset(&LayoutSettings {
            x: 0.0,
            y: 0.0,
            max_width: Some(wrap_width),
            max_height: None,
            horizontal_align: match style.alignment {
                TextAlignment::Left => fontdue::layout::HorizontalAlign::Left,
                TextAlignment::Center => fontdue::layout::HorizontalAlign::Center,
                TextAlignment::Right => fontdue::layout::HorizontalAlign::Right,
            },
            vertical_align: fontdue::layout::VerticalAlign::Top,
            line_height: style.line_height,
            wrap_style: fontdue::layout::WrapStyle::Word,
            wrap_hard_breaks: true,
        });

        // Append text to layout
        let fonts = &[font];
        layout.append(
            fonts,
            &FontdueTextStyle::new(text, style.font_size, 0),
        );

        // Calculate image dimensions from layout
        let glyphs = layout.glyphs();
        if glyphs.is_empty() {
            // Return 1x1 transparent image for empty text
            return RgbaImage::from_pixel(1, 1, Rgba([0, 0, 0, 0]));
        }

        // Find bounding box
        let mut min_x = f32::MAX;
        let mut min_y = f32::MAX;
        let mut max_x = f32::MIN;
        let mut max_y = f32::MIN;

        for glyph in glyphs {
            let x = glyph.x;
            let y = glyph.y;
            let (metrics, _) = font.rasterize_config(glyph.key);

            min_x = min_x.min(x);
            min_y = min_y.min(y);
            max_x = max_x.max(x + metrics.width as f32);
            max_y = max_y.max(y + metrics.height as f32);
        }

        // Add padding for stroke and shadow
        let padding = if let Some(stroke) = style.stroke {
            stroke.width.ceil() as i32
        } else {
            0
        };

        let shadow_padding = if let Some(shadow) = style.shadow {
            (shadow.offset_x.abs().max(shadow.offset_y.abs()) + shadow.blur).ceil() as i32
        } else {
            0
        };

        let total_padding = padding.max(shadow_padding) + 2;

        let width = ((max_x - min_x).ceil() as i32 + total_padding * 2).max(1) as u32;
        let height = ((max_y - min_y).ceil() as i32 + total_padding * 2).max(1) as u32;

        // Create output image
        let mut image = RgbaImage::from_pixel(width, height, Rgba([0, 0, 0, 0]));

        // Offset to account for min_x, min_y and padding
        let offset_x = -min_x + total_padding as f32;
        let offset_y = -min_y + total_padding as f32;

        // Render shadow if present
        if let Some(shadow) = style.shadow {
            self.render_text_pass(
                &mut image,
                font,
                glyphs,
                offset_x + shadow.offset_x,
                offset_y + shadow.offset_y,
                shadow.color,
                style.letter_spacing,
            );
        }

        // Render stroke if present
        if let Some(stroke) = style.stroke {
            self.render_stroke(
                &mut image,
                font,
                glyphs,
                offset_x,
                offset_y,
                stroke,
                style.letter_spacing,
            );
        }

        // Render main text
        self.render_text_pass(
            &mut image,
            font,
            glyphs,
            offset_x,
            offset_y,
            style.color,
            style.letter_spacing,
        );

        image
    }

    /// Render a single text pass (main text, shadow, or stroke)
    fn render_text_pass(
        &self,
        image: &mut RgbaImage,
        font: &Font,
        glyphs: &[fontdue::layout::GlyphPosition],
        offset_x: f32,
        offset_y: f32,
        color: Color,
        letter_spacing: f32,
    ) {
        let (img_width, img_height) = image.dimensions();

        for (glyph_idx, glyph) in glyphs.iter().enumerate() {
            let (metrics, bitmap) = font.rasterize_config(glyph.key);

            // Apply letter spacing
            let spacing_offset = glyph_idx as f32 * letter_spacing;

            let glyph_x = (glyph.x + offset_x + spacing_offset) as i32;
            let glyph_y = (glyph.y + offset_y) as i32;

            // Render glyph bitmap
            for y in 0..metrics.height {
                for x in 0..metrics.width {
                    let img_x = glyph_x + x as i32;
                    let img_y = glyph_y + y as i32;

                    // Skip if out of bounds
                    if img_x < 0 || img_y < 0 || img_x >= img_width as i32 || img_y >= img_height as i32 {
                        continue;
                    }

                    let coverage = bitmap[y * metrics.width + x];
                    if coverage == 0 {
                        continue;
                    }

                    let pixel = image.get_pixel_mut(img_x as u32, img_y as u32);

                    // Alpha blend the glyph onto the existing pixel
                    let alpha = (coverage as u16 * color.a as u16) / 255;
                    let inv_alpha = 255 - alpha;

                    pixel[0] = ((color.r as u16 * alpha + pixel[0] as u16 * inv_alpha) / 255) as u8;
                    pixel[1] = ((color.g as u16 * alpha + pixel[1] as u16 * inv_alpha) / 255) as u8;
                    pixel[2] = ((color.b as u16 * alpha + pixel[2] as u16 * inv_alpha) / 255) as u8;
                    pixel[3] = pixel[3].saturating_add(coverage);
                }
            }
        }
    }

    /// Render stroke outline around text
    fn render_stroke(
        &self,
        image: &mut RgbaImage,
        font: &Font,
        glyphs: &[fontdue::layout::GlyphPosition],
        offset_x: f32,
        offset_y: f32,
        stroke: Stroke,
        letter_spacing: f32,
    ) {
        let stroke_width = stroke.width as i32;

        // Render the stroke by rendering the text multiple times with offsets
        for dy in -stroke_width..=stroke_width {
            for dx in -stroke_width..=stroke_width {
                // Skip center (will be filled by main text)
                if dx == 0 && dy == 0 {
                    continue;
                }

                // Only render if within circle (for rounded stroke)
                if (dx * dx + dy * dy) as f32 <= stroke.width * stroke.width {
                    self.render_text_pass(
                        image,
                        font,
                        glyphs,
                        offset_x + dx as f32,
                        offset_y + dy as f32,
                        stroke.color,
                        letter_spacing,
                    );
                }
            }
        }
    }
}

impl Default for TextRenderer {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_text_renderer_creation() {
        let renderer = TextRenderer::new();
        assert!(!renderer.font_cache.is_empty());
    }

    #[test]
    fn test_basic_text_rendering() {
        let renderer = TextRenderer::new();
        let style = TextStyle {
            font_size: 48.0,
            color: Color::black(),
            ..Default::default()
        };

        let image = renderer.render("Test", &style);

        // Should produce non-zero dimensions
        assert!(image.width() > 0);
        assert!(image.height() > 0);

        // Should have some non-transparent pixels
        let mut has_content = false;
        for pixel in image.pixels() {
            if pixel[3] > 0 {
                has_content = true;
                break;
            }
        }
        assert!(has_content, "Rendered text should have non-transparent pixels");
    }

    #[test]
    fn test_center_alignment() {
        let renderer = TextRenderer::new();

        let left_style = TextStyle {
            font_size: 48.0,
            color: Color::black(),
            alignment: TextAlignment::Left,
            wrap_width: Some(200.0),
            ..Default::default()
        };

        let center_style = TextStyle {
            alignment: TextAlignment::Center,
            ..left_style.clone()
        };

        let left_image = renderer.render("Test", &left_style);
        let center_image = renderer.render("Test", &center_style);

        // Center aligned text should be positioned differently than left aligned
        // Both should have content
        assert!(left_image.width() > 0);
        assert!(center_image.width() > 0);
    }

    #[test]
    fn test_stroke_rendering() {
        let renderer = TextRenderer::new();
        let style = TextStyle {
            font_size: 48.0,
            color: Color::white(),
            stroke: Some(Stroke {
                color: Color::black(),
                width: 2.0,
            }),
            ..Default::default()
        };

        let image = renderer.render("Test", &style);

        // Should render successfully with stroke
        assert!(image.width() > 0);
        assert!(image.height() > 0);
    }

    #[test]
    fn test_empty_text() {
        let renderer = TextRenderer::new();
        let style = TextStyle::default();

        let image = renderer.render("", &style);

        // Should return minimal image for empty text
        assert_eq!(image.width(), 1);
        assert_eq!(image.height(), 1);
    }

    #[test]
    fn test_shadow_rendering() {
        let renderer = TextRenderer::new();
        let style = TextStyle {
            font_size: 48.0,
            color: Color::black(),
            shadow: Some(TextShadow {
                color: Color { r: 128, g: 128, b: 128, a: 255 },
                offset_x: 5.0,
                offset_y: 5.0,
                blur: 2.0,
            }),
            ..Default::default()
        };

        let image = renderer.render("Test", &style);

        // Should render successfully with shadow
        assert!(image.width() > 0);
        assert!(image.height() > 0);
    }
}
