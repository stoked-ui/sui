//! Blending modes for layer composition

use serde::{Deserialize, Serialize};

/// Blending modes determine how layers combine
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BlendMode {
    /// Standard alpha blending (default)
    Normal,

    /// Multiply colors (darkening)
    Multiply,

    /// Screen colors (lightening)
    Screen,

    /// Overlay blend
    Overlay,

    /// Add colors together
    Add,

    /// Subtract colors
    Subtract,

    /// Use lighter of the two
    Lighten,

    /// Use darker of the two
    Darken,
}

impl BlendMode {
    /// Blend two RGBA colors using this blend mode
    pub fn blend(&self, bottom: [u8; 4], top: [u8; 4]) -> [u8; 4] {
        // Convert to float [0.0, 1.0]
        let b = [
            bottom[0] as f32 / 255.0,
            bottom[1] as f32 / 255.0,
            bottom[2] as f32 / 255.0,
            bottom[3] as f32 / 255.0,
        ];
        let t = [
            top[0] as f32 / 255.0,
            top[1] as f32 / 255.0,
            top[2] as f32 / 255.0,
            top[3] as f32 / 255.0,
        ];

        // Apply blend function
        let result = match self {
            BlendMode::Normal => self.blend_normal(b, t),
            BlendMode::Multiply => self.blend_multiply(b, t),
            BlendMode::Screen => self.blend_screen(b, t),
            BlendMode::Overlay => self.blend_overlay(b, t),
            BlendMode::Add => self.blend_add(b, t),
            BlendMode::Subtract => self.blend_subtract(b, t),
            BlendMode::Lighten => self.blend_lighten(b, t),
            BlendMode::Darken => self.blend_darken(b, t),
        };

        // Convert back to u8
        [
            (result[0] * 255.0) as u8,
            (result[1] * 255.0) as u8,
            (result[2] * 255.0) as u8,
            (result[3] * 255.0) as u8,
        ]
    }

    fn blend_normal(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        // Standard alpha compositing
        let alpha = t[3] + b[3] * (1.0 - t[3]);
        if alpha == 0.0 {
            return [0.0, 0.0, 0.0, 0.0];
        }

        [
            (t[0] * t[3] + b[0] * b[3] * (1.0 - t[3])) / alpha,
            (t[1] * t[3] + b[1] * b[3] * (1.0 - t[3])) / alpha,
            (t[2] * t[3] + b[2] * b[3] * (1.0 - t[3])) / alpha,
            alpha,
        ]
    }

    fn blend_multiply(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        let alpha = t[3];
        [
            b[0] * t[0],
            b[1] * t[1],
            b[2] * t[2],
            self.blend_normal(b, t)[3],
        ]
        .into_iter()
        .enumerate()
        .map(|(i, v)| if i < 3 { v * alpha + b[i] * (1.0 - alpha) } else { v })
        .collect::<Vec<_>>()
        .try_into()
        .unwrap()
    }

    fn blend_screen(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        let alpha = t[3];
        [
            1.0 - (1.0 - b[0]) * (1.0 - t[0]),
            1.0 - (1.0 - b[1]) * (1.0 - t[1]),
            1.0 - (1.0 - b[2]) * (1.0 - t[2]),
            self.blend_normal(b, t)[3],
        ]
        .into_iter()
        .enumerate()
        .map(|(i, v)| if i < 3 { v * alpha + b[i] * (1.0 - alpha) } else { v })
        .collect::<Vec<_>>()
        .try_into()
        .unwrap()
    }

    fn blend_overlay(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        let overlay = |base: f32, top: f32| -> f32 {
            if base < 0.5 {
                2.0 * base * top
            } else {
                1.0 - 2.0 * (1.0 - base) * (1.0 - top)
            }
        };

        let alpha = t[3];
        [
            overlay(b[0], t[0]),
            overlay(b[1], t[1]),
            overlay(b[2], t[2]),
            self.blend_normal(b, t)[3],
        ]
        .into_iter()
        .enumerate()
        .map(|(i, v)| if i < 3 { v * alpha + b[i] * (1.0 - alpha) } else { v })
        .collect::<Vec<_>>()
        .try_into()
        .unwrap()
    }

    fn blend_add(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        [
            (b[0] + t[0]).min(1.0),
            (b[1] + t[1]).min(1.0),
            (b[2] + t[2]).min(1.0),
            self.blend_normal(b, t)[3],
        ]
    }

    fn blend_subtract(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        [
            (b[0] - t[0]).max(0.0),
            (b[1] - t[1]).max(0.0),
            (b[2] - t[2]).max(0.0),
            self.blend_normal(b, t)[3],
        ]
    }

    fn blend_lighten(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        [
            b[0].max(t[0]),
            b[1].max(t[1]),
            b[2].max(t[2]),
            self.blend_normal(b, t)[3],
        ]
    }

    fn blend_darken(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        [
            b[0].min(t[0]),
            b[1].min(t[1]),
            b[2].min(t[2]),
            self.blend_normal(b, t)[3],
        ]
    }
}

impl Default for BlendMode {
    fn default() -> Self {
        BlendMode::Normal
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normal_blend() {
        let bottom = [255, 0, 0, 255]; // Red
        let top = [0, 255, 0, 128]; // Semi-transparent green

        let result = BlendMode::Normal.blend(bottom, top);

        // Should be a mix of red and green
        assert!(result[0] > 0); // Has some red
        assert!(result[1] > 0); // Has some green
    }

    #[test]
    fn test_multiply_blend() {
        let bottom = [255, 255, 255, 255]; // White
        let top = [128, 128, 128, 255]; // Gray

        let result = BlendMode::Multiply.blend(bottom, top);

        // Multiply darkens
        assert!(result[0] < 255);
        assert!(result[1] < 255);
        assert!(result[2] < 255);
    }
}
