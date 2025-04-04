/**
 * Extends the Material UI theme with a custom CSS variable.
 */

import { experimental_extendTheme as extendTheme } from '@mui/material/styles';
import type {} from '@mui/material/themeCssVarsAugmentation';

/**
 * Declares a new CSS variable override for the Material UI theme.
 */
declare module '@mui/material/styles' {
  /**
   * Custom CSS variables that can be overridden in the theme.
   */
  interface ThemeCssVarOverrides {
    'custom-color': true; // Adds a custom CSS variable to the theme
  }
}

/**
 * Extends the Material UI theme with a custom CSS variable.
 */
const theme = extendTheme();

/**
 * Retrieves the value of the custom CSS variable from the theme.
 */
theme.getCssVar('custom-color');