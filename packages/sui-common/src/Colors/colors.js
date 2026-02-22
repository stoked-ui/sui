"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compositeColors = compositeColors;
const styles_1 = require("@mui/material/styles");
function parseColorWithAlpha(color) {
    let rgbColor;
    let alpha;
    if (color.startsWith('#')) {
        rgbColor = (0, styles_1.hexToRgb)(color);
    }
    else if (color.startsWith('hsl')) {
        rgbColor = (0, styles_1.hslToRgb)(color);
    }
    else if (color.startsWith('rgb')) {
        rgbColor = color;
    }
    else {
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
function compositeColors(baseColor, overlay) {
    const rgb1 = parseColorWithAlpha(baseColor);
    const rgb2 = parseColorWithAlpha(overlay);
    const alpha = rgb2.alpha ?? 1;
    if (alpha === 1) {
        return (0, styles_1.rgbToHex)(`rgb(${rgb2.r}, ${rgb2.g}, ${rgb2.b})`);
    }
    const r = Math.round(rgb1.r * (1 - alpha) + rgb2.r * alpha);
    const g = Math.round(rgb1.g * (1 - alpha) + rgb2.g * alpha);
    const b = Math.round(rgb1.b * (1 - alpha) + rgb2.b * alpha);
    return (0, styles_1.rgbToHex)(`rgb(${r}, ${g}, ${b})`);
}
//# sourceMappingURL=colors.js.map