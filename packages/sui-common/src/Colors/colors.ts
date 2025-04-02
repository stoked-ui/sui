/**
 * Utility function to extract RGB and alpha from a color string.
 * 
 * @param {string} color - The input color string
 * @returns {{ r: number; g: number; b: number; alpha?: number }} An object containing the extracted RGB values and optional alpha value
 */
function parseColorWithAlpha(color) {
  /**
   * Determine the color type based on its format.
   */
  let rgbColor;
  let alpha;

  if (color.startsWith('#')) {
    rgbColor = hexToRgb(color);
  } else if (color.startsWith('hsl')) {
    rgbColor = hslToRgb(color);
  } else if (color.startsWith('rgb')) {
    rgbColor = color;
  } else {
    /**
     * Throw an error for unsupported color formats.
     */
    throw new Error('Unsupported color format');
  }

  const alphaMatch = color.match(/rgba?\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
  if (alphaMatch) {
    /**
     * Extract the alpha value from the color string.
     */
    alpha = parseFloat(alphaMatch[1]);
  }

  const matches = rgbColor.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!matches) {
    /**
     * Throw an error for invalid RGB color formats.
     */
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
 * Composes two colors together, taking into account the alpha channel.
 * 
 * @param {string} baseColor - The base color string
 * @param {string} overlay - The overlay color string
 * @returns {string} A hex color string representing the blended result
 */
export function compositeColors(baseColor, overlay) {
  /**
   * Use alpha from the second color if present, else return color2 directly.
   */
  const rgb1 = parseColorWithAlpha(baseColor);
  const rgb2 = parseColorWithAlpha(overlay);

  const alpha = rgb2.alpha ?? 1;

  if (alpha === 1) {
    /**
     * Return the result as a hex color.
     */
    return rgbToHex(`rgb(${rgb2.r}, ${rgb2.g}, ${rgb2.b})`);
  }

  /**
   * Composite each channel disregarding alpha from color1.
   */
  const r = Math.round(rgb1.r * (1 - alpha) + rgb2.r * alpha);
  const g = Math.round(rgb1.g * (1 - alpha) + rgb2.g * alpha);
  const b = Math.round(rgb1.b * (1 - alpha) + rgb2.b * alpha);

  /**
   * Return the result as a hex color.
   */
  return rgbToHex(`rgb(${r}, ${g}, ${b})`);
}