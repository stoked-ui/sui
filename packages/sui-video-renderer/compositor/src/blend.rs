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

    /// Soft light blend (gentler overlay)
    #[serde(rename = "softLight")]
    SoftLight,

    /// Hard light blend (overlay with layers swapped)
    #[serde(rename = "hardLight")]
    HardLight,

    /// Color dodge (brightening)
    #[serde(rename = "colorDodge")]
    ColorDodge,

    /// Color burn (darkening)
    #[serde(rename = "colorBurn")]
    ColorBurn,

    /// Difference (absolute difference)
    #[serde(rename = "difference")]
    Difference,

    /// Exclusion (inverted difference)
    #[serde(rename = "exclusion")]
    Exclusion,

    /// Hue blend (preserve hue of top layer)
    #[serde(rename = "hue")]
    Hue,

    /// Saturation blend (preserve saturation of top layer)
    #[serde(rename = "saturation")]
    Saturation,

    /// Color blend (preserve hue and saturation of top layer)
    #[serde(rename = "color")]
    Color,

    /// Luminosity blend (preserve luminosity of top layer)
    #[serde(rename = "luminosity")]
    Luminosity,
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
            BlendMode::SoftLight => self.blend_soft_light(b, t),
            BlendMode::HardLight => self.blend_hard_light(b, t),
            BlendMode::ColorDodge => self.blend_color_dodge(b, t),
            BlendMode::ColorBurn => self.blend_color_burn(b, t),
            BlendMode::Difference => self.blend_difference(b, t),
            BlendMode::Exclusion => self.blend_exclusion(b, t),
            BlendMode::Hue => self.blend_hue(b, t),
            BlendMode::Saturation => self.blend_saturation(b, t),
            BlendMode::Color => self.blend_color(b, t),
            BlendMode::Luminosity => self.blend_luminosity(b, t),
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

    fn blend_soft_light(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        let soft_light = |base: f32, top: f32| -> f32 {
            if top < 0.5 {
                2.0 * base * top + base * base * (1.0 - 2.0 * top)
            } else {
                2.0 * base * (1.0 - top) + base.sqrt() * (2.0 * top - 1.0)
            }
        };

        let alpha = t[3];
        [
            soft_light(b[0], t[0]),
            soft_light(b[1], t[1]),
            soft_light(b[2], t[2]),
            self.blend_normal(b, t)[3],
        ]
        .into_iter()
        .enumerate()
        .map(|(i, v)| if i < 3 { v * alpha + b[i] * (1.0 - alpha) } else { v })
        .collect::<Vec<_>>()
        .try_into()
        .unwrap()
    }

    fn blend_hard_light(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        let hard_light = |base: f32, top: f32| -> f32 {
            if top < 0.5 {
                2.0 * base * top
            } else {
                1.0 - 2.0 * (1.0 - base) * (1.0 - top)
            }
        };

        let alpha = t[3];
        [
            hard_light(b[0], t[0]),
            hard_light(b[1], t[1]),
            hard_light(b[2], t[2]),
            self.blend_normal(b, t)[3],
        ]
        .into_iter()
        .enumerate()
        .map(|(i, v)| if i < 3 { v * alpha + b[i] * (1.0 - alpha) } else { v })
        .collect::<Vec<_>>()
        .try_into()
        .unwrap()
    }

    fn blend_color_dodge(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        let color_dodge = |base: f32, top: f32| -> f32 {
            if top >= 1.0 {
                1.0
            } else {
                (base / (1.0 - top)).min(1.0)
            }
        };

        let alpha = t[3];
        [
            color_dodge(b[0], t[0]),
            color_dodge(b[1], t[1]),
            color_dodge(b[2], t[2]),
            self.blend_normal(b, t)[3],
        ]
        .into_iter()
        .enumerate()
        .map(|(i, v)| if i < 3 { v * alpha + b[i] * (1.0 - alpha) } else { v })
        .collect::<Vec<_>>()
        .try_into()
        .unwrap()
    }

    fn blend_color_burn(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        let color_burn = |base: f32, top: f32| -> f32 {
            if top <= 0.0 {
                0.0
            } else {
                (1.0 - (1.0 - base) / top).max(0.0)
            }
        };

        let alpha = t[3];
        [
            color_burn(b[0], t[0]),
            color_burn(b[1], t[1]),
            color_burn(b[2], t[2]),
            self.blend_normal(b, t)[3],
        ]
        .into_iter()
        .enumerate()
        .map(|(i, v)| if i < 3 { v * alpha + b[i] * (1.0 - alpha) } else { v })
        .collect::<Vec<_>>()
        .try_into()
        .unwrap()
    }

    fn blend_difference(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        let alpha = t[3];
        [
            (b[0] - t[0]).abs(),
            (b[1] - t[1]).abs(),
            (b[2] - t[2]).abs(),
            self.blend_normal(b, t)[3],
        ]
        .into_iter()
        .enumerate()
        .map(|(i, v)| if i < 3 { v * alpha + b[i] * (1.0 - alpha) } else { v })
        .collect::<Vec<_>>()
        .try_into()
        .unwrap()
    }

    fn blend_exclusion(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        let alpha = t[3];
        [
            b[0] + t[0] - 2.0 * b[0] * t[0],
            b[1] + t[1] - 2.0 * b[1] * t[1],
            b[2] + t[2] - 2.0 * b[2] * t[2],
            self.blend_normal(b, t)[3],
        ]
        .into_iter()
        .enumerate()
        .map(|(i, v)| if i < 3 { v * alpha + b[i] * (1.0 - alpha) } else { v })
        .collect::<Vec<_>>()
        .try_into()
        .unwrap()
    }

    fn blend_hue(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        let (h_top, _, _) = Self::rgb_to_hsl(t[0], t[1], t[2]);
        let (_, s_base, l_base) = Self::rgb_to_hsl(b[0], b[1], b[2]);
        let (r, g, bl) = Self::hsl_to_rgb(h_top, s_base, l_base);

        let alpha = t[3];
        [r, g, bl, self.blend_normal(b, t)[3]]
            .into_iter()
            .enumerate()
            .map(|(i, v)| if i < 3 { v * alpha + b[i] * (1.0 - alpha) } else { v })
            .collect::<Vec<_>>()
            .try_into()
            .unwrap()
    }

    fn blend_saturation(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        let (h_base, _, l_base) = Self::rgb_to_hsl(b[0], b[1], b[2]);
        let (_, s_top, _) = Self::rgb_to_hsl(t[0], t[1], t[2]);
        let (r, g, bl) = Self::hsl_to_rgb(h_base, s_top, l_base);

        let alpha = t[3];
        [r, g, bl, self.blend_normal(b, t)[3]]
            .into_iter()
            .enumerate()
            .map(|(i, v)| if i < 3 { v * alpha + b[i] * (1.0 - alpha) } else { v })
            .collect::<Vec<_>>()
            .try_into()
            .unwrap()
    }

    fn blend_color(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        let (h_top, s_top, _) = Self::rgb_to_hsl(t[0], t[1], t[2]);
        let (_, _, l_base) = Self::rgb_to_hsl(b[0], b[1], b[2]);
        let (r, g, bl) = Self::hsl_to_rgb(h_top, s_top, l_base);

        let alpha = t[3];
        [r, g, bl, self.blend_normal(b, t)[3]]
            .into_iter()
            .enumerate()
            .map(|(i, v)| if i < 3 { v * alpha + b[i] * (1.0 - alpha) } else { v })
            .collect::<Vec<_>>()
            .try_into()
            .unwrap()
    }

    fn blend_luminosity(&self, b: [f32; 4], t: [f32; 4]) -> [f32; 4] {
        let (h_base, s_base, _) = Self::rgb_to_hsl(b[0], b[1], b[2]);
        let (_, _, l_top) = Self::rgb_to_hsl(t[0], t[1], t[2]);
        let (r, g, bl) = Self::hsl_to_rgb(h_base, s_base, l_top);

        let alpha = t[3];
        [r, g, bl, self.blend_normal(b, t)[3]]
            .into_iter()
            .enumerate()
            .map(|(i, v)| if i < 3 { v * alpha + b[i] * (1.0 - alpha) } else { v })
            .collect::<Vec<_>>()
            .try_into()
            .unwrap()
    }

    // HSL conversion helpers for color-based blend modes
    fn rgb_to_hsl(r: f32, g: f32, b: f32) -> (f32, f32, f32) {
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

    fn hsl_to_rgb(h: f32, s: f32, l: f32) -> (f32, f32, f32) {
        if s == 0.0 {
            return (l, l, l);
        }

        let h = h / (2.0 * std::f32::consts::PI);

        let q = if l < 0.5 { l * (1.0 + s) } else { l + s - l * s };
        let p = 2.0 * l - q;

        let r = Self::hue_to_rgb(p, q, h + 1.0 / 3.0);
        let g = Self::hue_to_rgb(p, q, h);
        let b = Self::hue_to_rgb(p, q, h - 1.0 / 3.0);

        (r, g, b)
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

    #[test]
    fn test_serde_round_trip() {
        let modes = vec![
            BlendMode::Normal,
            BlendMode::Multiply,
            BlendMode::Screen,
            BlendMode::Overlay,
            BlendMode::Add,
            BlendMode::Subtract,
            BlendMode::Lighten,
            BlendMode::Darken,
            BlendMode::SoftLight,
            BlendMode::HardLight,
            BlendMode::ColorDodge,
            BlendMode::ColorBurn,
            BlendMode::Difference,
            BlendMode::Exclusion,
            BlendMode::Hue,
            BlendMode::Saturation,
            BlendMode::Color,
            BlendMode::Luminosity,
        ];

        for mode in modes {
            let json = serde_json::to_string(&mode).unwrap();
            let deserialized: BlendMode = serde_json::from_str(&json).unwrap();
            assert_eq!(mode, deserialized);
        }
    }

    #[test]
    fn test_color_dodge() {
        let bottom = [128, 128, 128, 255];
        let top = [255, 255, 255, 255];

        let result = BlendMode::ColorDodge.blend(bottom, top);

        // Color dodge with white should produce white
        assert_eq!(result[0], 255);
        assert_eq!(result[1], 255);
        assert_eq!(result[2], 255);
        assert_eq!(result[3], 255);
    }

    #[test]
    fn test_color_burn() {
        let bottom = [128, 128, 128, 255];
        let top = [0, 0, 0, 255];

        let result = BlendMode::ColorBurn.blend(bottom, top);

        // Color burn with black should produce black
        assert_eq!(result[0], 0);
        assert_eq!(result[1], 0);
        assert_eq!(result[2], 0);
        assert_eq!(result[3], 255);
    }

    #[test]
    fn test_difference() {
        let bottom = [100, 150, 200, 255];
        let top = [100, 150, 200, 255];

        let result = BlendMode::Difference.blend(bottom, top);

        // Same colors should produce black
        assert_eq!(result[0], 0);
        assert_eq!(result[1], 0);
        assert_eq!(result[2], 0);
        assert_eq!(result[3], 255);
    }

    #[test]
    fn test_difference_different_colors() {
        let bottom = [200, 100, 50, 255];
        let top = [100, 50, 200, 255];

        let result = BlendMode::Difference.blend(bottom, top);

        // Difference should not be zero
        assert!(result[0] > 0);
        assert!(result[1] > 0);
        assert!(result[2] > 0);
    }

    #[test]
    fn test_exclusion() {
        let bottom = [128, 128, 128, 255];
        let top = [128, 128, 128, 255];

        let result = BlendMode::Exclusion.blend(bottom, top);

        // Exclusion should produce non-trivial output
        assert_ne!(result, bottom);
    }

    #[test]
    fn test_soft_light() {
        let bottom = [128, 128, 128, 255];
        let top = [64, 64, 64, 255];

        let result = BlendMode::SoftLight.blend(bottom, top);

        // Soft light should darken
        assert!(result[0] < 128);
        assert!(result[1] < 128);
        assert!(result[2] < 128);
    }

    #[test]
    fn test_hard_light() {
        let bottom = [128, 128, 128, 255];
        let top = [64, 64, 64, 255];

        let result = BlendMode::HardLight.blend(bottom, top);

        // Hard light should darken
        assert!(result[0] < 128);
        assert!(result[1] < 128);
        assert!(result[2] < 128);
    }

    #[test]
    fn test_hue_blend() {
        let bottom = [0, 0, 255, 255]; // Blue
        let top = [255, 0, 0, 255]; // Red

        let result = BlendMode::Hue.blend(bottom, top);

        // Result should have red's hue
        // Red hue means R > B and R > G
        assert!(result[0] > result[2]);
        assert!(result[0] > result[1]);
    }

    #[test]
    fn test_saturation_blend() {
        let bottom = [100, 100, 100, 255]; // Gray (no saturation)
        let top = [255, 0, 0, 255]; // Red (high saturation)

        let result = BlendMode::Saturation.blend(bottom, top);

        // Result should maintain gray's hue but gain saturation
        // Should not be pure gray anymore
        assert_ne!(result[0], result[1]);
    }

    #[test]
    fn test_color_blend() {
        let bottom = [128, 128, 128, 255]; // Gray
        let top = [255, 0, 0, 255]; // Red

        let result = BlendMode::Color.blend(bottom, top);

        // Result should have red's hue and saturation
        assert!(result[0] > result[1]);
        assert!(result[0] > result[2]);
    }

    #[test]
    fn test_luminosity_blend() {
        let bottom = [64, 64, 64, 255]; // Dark gray
        let top = [200, 200, 200, 255]; // Light gray

        let result = BlendMode::Luminosity.blend(bottom, top);

        // Result should be brighter (adopt top's luminosity)
        assert!(result[0] > 64);
        assert!(result[1] > 64);
        assert!(result[2] > 64);
    }

    #[test]
    fn test_all_new_blend_modes_produce_output() {
        let bottom = [100, 150, 200, 255];
        let top = [200, 100, 50, 255];

        let modes = vec![
            BlendMode::SoftLight,
            BlendMode::HardLight,
            BlendMode::ColorDodge,
            BlendMode::ColorBurn,
            BlendMode::Difference,
            BlendMode::Exclusion,
            BlendMode::Hue,
            BlendMode::Saturation,
            BlendMode::Color,
            BlendMode::Luminosity,
        ];

        for mode in modes {
            let result = mode.blend(bottom, top);

            // Each mode should produce some output (not all zeros)
            let sum = result[0] as u32 + result[1] as u32 + result[2] as u32;
            assert!(sum > 0, "Blend mode {:?} produced all zeros", mode);
        }
    }
}
