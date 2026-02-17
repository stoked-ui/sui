//! Layer types and rendering

use std::path::PathBuf;

use image::RgbaImage;
use serde::{Deserialize, Serialize};

use crate::{blend::BlendMode, effects::Effect, text::{TextAlignment, Stroke, TextShadow}, transform::Transform, types::Color, Result};

/// Layer content type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LayerContent {
    /// Image from file path
    Image { path: PathBuf },

    /// Solid color rectangle
    SolidColor { color: Color },

    /// Text with font and styling
    Text {
        text: String,
        font_size: f32,
        color: Color,
        font_family: String,
        // Optional extended properties for backward compatibility
        #[serde(default)]
        alignment: Option<TextAlignment>,
        #[serde(default)]
        line_height: Option<f32>,
        #[serde(default)]
        letter_spacing: Option<f32>,
        #[serde(default)]
        wrap_width: Option<f32>,
        #[serde(default)]
        stroke: Option<Stroke>,
        #[serde(default)]
        shadow: Option<TextShadow>,
        #[serde(default)]
        font_weight: Option<u16>,
    },

    /// Pre-loaded image data
    ImageData { data: Vec<u8>, width: u32, height: u32 },
}

/// A single compositable layer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Layer {
    /// Unique identifier
    pub id: String,

    /// Layer content
    pub content: LayerContent,

    /// Transform applied to this layer
    pub transform: Transform,

    /// Blend mode for compositing
    pub blend_mode: BlendMode,

    /// Whether this layer is visible
    pub visible: bool,

    /// Z-index for sorting (higher = on top)
    pub z_index: i32,

    /// Effects applied to this layer
    #[serde(default)]
    pub effects: Vec<Effect>,
}

impl Layer {
    /// Create a new image layer from file path
    pub fn image<P: Into<PathBuf>>(path: P, transform: Transform) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            content: LayerContent::Image { path: path.into() },
            transform,
            blend_mode: BlendMode::Normal,
            visible: true,
            z_index: 0,
            effects: Vec::new(),
        }
    }

    /// Create a solid color layer
    pub fn solid_color(color: Color, transform: Transform) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            content: LayerContent::SolidColor { color },
            transform,
            blend_mode: BlendMode::Normal,
            visible: true,
            z_index: 0,
            effects: Vec::new(),
        }
    }

    /// Create a text layer
    pub fn text(text: String, font_size: f32, color: Color, transform: Transform) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            content: LayerContent::Text {
                text,
                font_size,
                color,
                font_family: "Arial".to_string(),
                alignment: None,
                line_height: None,
                letter_spacing: None,
                wrap_width: None,
                stroke: None,
                shadow: None,
                font_weight: None,
            },
            transform,
            blend_mode: BlendMode::Normal,
            visible: true,
            z_index: 0,
            effects: Vec::new(),
        }
    }

    /// Set blend mode
    pub fn with_blend_mode(mut self, blend_mode: BlendMode) -> Self {
        self.blend_mode = blend_mode;
        self
    }

    /// Set z-index
    pub fn with_z_index(mut self, z_index: i32) -> Self {
        self.z_index = z_index;
        self
    }

    /// Set visibility
    pub fn with_visible(mut self, visible: bool) -> Self {
        self.visible = visible;
        self
    }

    /// Set effects
    pub fn with_effects(mut self, effects: Vec<Effect>) -> Self {
        self.effects = effects;
        self
    }

    /// Add a single effect
    pub fn with_effect(mut self, effect: Effect) -> Self {
        self.effects.push(effect);
        self
    }

    /// Load layer content as an image
    pub fn load_image(&self) -> Result<Option<RgbaImage>> {
        if !self.visible {
            return Ok(None);
        }

        match &self.content {
            LayerContent::Image { path } => {
                let img = image::open(path)?;
                Ok(Some(img.to_rgba8()))
            }
            LayerContent::ImageData { data, width, height } => {
                let img = RgbaImage::from_raw(*width, *height, data.clone())
                    .ok_or_else(|| crate::Error::InvalidLayer("Invalid image data".to_string()))?;
                Ok(Some(img))
            }
            LayerContent::SolidColor { .. } => {
                // Solid colors are rendered differently
                Ok(None)
            }
            LayerContent::Text { .. } => {
                // Text is rendered differently
                Ok(None)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_layer_creation() {
        let layer = Layer::image("test.png", Transform::default());
        assert!(layer.visible);
        assert_eq!(layer.z_index, 0);
        assert_eq!(layer.blend_mode, BlendMode::Normal);
    }

    #[test]
    fn test_layer_builder() {
        let layer = Layer::solid_color(Color::red(), Transform::default())
            .with_blend_mode(BlendMode::Multiply)
            .with_z_index(10)
            .with_visible(false);

        assert_eq!(layer.blend_mode, BlendMode::Multiply);
        assert_eq!(layer.z_index, 10);
        assert!(!layer.visible);
    }
}
