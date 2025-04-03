/**
 * @packageDocumentation
 * Color Utility Functions
 *
 * Provides utility functions for working with colors, including parsing and composing color strings.
 */

/**
 * @typedef {Object} ColorString
 * @property {string} type - Type of the color string (hex, rgb, hsl)
 * @property {string|number[]} values - Values of the color string
 */
/**
 * Utility function to extract RGB and alpha from a color string.
 *
 * @param {ColorString} color - Color string to parse
 * @returns {{ r: number; g: number; b: number; alpha?: number }} - Color object with extracted RGB and optional alpha values
 */
function parseColorWithAlpha(color: ColorString): {
  /**
   * Red value of the color
   */
  r: number;
  /**
   * Green value of the color
   */
  g: number;
  /**
   * Blue value of the color
   */
  b: number;
  /**
   * Alpha value of the color (optional)
   */
  alpha?: number;
} {
  let rgbColor: string;
  let alpha: number | undefined;

  if (color.type === 'hex') {
    rgbColor = hexToRgb(color.values[0]);
  } else if (color.type === 'hsl') {
    rgbColor = hslToRgb(color.values[0]);
  } else if (color.type === 'rgb') {
    rgbColor = color.values[0];
  } else {
    throw new Error('Unsupported color format');
  }

  const alphaMatch = color.values[0].match(/rgba?\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
  if (alphaMatch) {
    alpha = parseFloat(alphaMatch[1]);
  }

  const matches = rgbColor.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!matches) {
    throw new Error('Invalid RGB color format');
  }

  return {
    r: parseInt(matches[1], 10),
    g: parseInt(matches[2], 10),
    b: parseInt(matches[3], 10),
    alpha,
  };
}

/**
 * Composites two colors by overlaying one color over the other.
 *
 * @param {ColorString} baseColor - Base color string to composite
 * @param {ColorString} overlay - Overlay color string to composite
 * @returns {string} - Composite color as a hex string
 */
export function compositeColors(
  /**
   * Base color string to composite
   */
  baseColor: ColorString,
  /**
   * Overlay color string to composite
   */
  overlay: ColorString
): string {
  const rgb1 = parseColorWithAlpha(baseColor);
  const rgb2 = parseColorWithAlpha(overlay);

  // Use alpha from the second color if present, else return color2 directly
  const alpha = rgb2.alpha ?? 1;

  if (alpha === 1) {
    return rgbToHex(`rgb(${rgb2.r}, ${rgb2.g}, ${rgb2.b})`);
  }

  // Composite each channel disregarding alpha from color1
  const r = Math.round(rgb1.r * (1 - alpha) + rgb2.r * alpha);
  const g = Math.round(rgb1.g * (1 - alpha) + rgb2.g * alpha);
  const b = Math.round(rgb1.b * (1 - alpha) + rgb2.b * alpha);

  // Return the result as a hex color
  return rgbToHex(`rgb(${r}, ${g}, ${b})`);
}