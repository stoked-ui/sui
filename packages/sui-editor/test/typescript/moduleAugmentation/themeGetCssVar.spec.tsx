/**
 * @typedef {Object} ThemeCssVarOverrides
 * @property {'custom-color'} custom-color - Indicates the presence of a custom color in the theme
 */

/**
 * @description Extends the MUI theme with custom CSS variables.
 */

import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

/**
 * @type {}
 * @description Import type augmentation for theme CSS variables.
 */

import type {} from '@mui/material/themeCssVarsAugmentation';

/**
 * @description Extends the MUI theme with custom CSS variables.
 */

declare module '@mui/material/styles' {
  interface ThemeCssVarOverrides {
    'custom-color': true;
  }
}

const theme = extendTheme();

/**
 * Retrieves the CSS variable for the custom color.
 * @returns {string} The CSS variable for the custom color.
 */

theme.getCssVar('custom-color');