import { hexToRgb, hslToRgb, rgbToHex } from '@mui/material/styles';

/**
 * Utility function to extract RGB and alpha from a color string.
 * 
 * @param {string} color - The color string to parse, which can be in hex, hsl, or rgb format.
 * @returns {{ r: number; g: number; b: number; alpha?: number }} - An object containing the RGB values and optional alpha value.
 * @throws Will throw an error if the color format is unsupported or if the RGB format is invalid.
 */
function parseColorWithAlpha(color: string): { r: number; g: number; b: number; alpha?: number } {
  let rgbColor: string;
  let alpha: number | undefined;

  if (color.startsWith('#')) {
    rgbColor = hexToRgb(color);
  } else if (color.startsWith('hsl')) {
    rgbColor = hslToRgb(color);
  } else if (color.startsWith('rgb')) {
    rgbColor = color;
  } else {
    throw new Error('Unsupported color format');
  }

  const alphaMatch = color.match(/rgba?\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
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
 * Composes two colors together taking into account the alpha channel of the overlay color.
 * 
 * @param {string} baseColor - The base color in hex, hsl, or rgb format.
 * @param {string} overlay - The overlay color in hex, hsl, or rgba format.
 * @returns {string} - The resulting color as a hex string.
 * 
 * @example
 * const resultColor = compositeColors('#3498db', 'rgba(255, 255, 255, 0.53)');
 * console.log(resultColor); // Output: blended color as a hex string
 */
export function compositeColors(baseColor: string, overlay: string): string {
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