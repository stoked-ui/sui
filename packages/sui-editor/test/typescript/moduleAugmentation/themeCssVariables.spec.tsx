/**
 * Module for Material UI theme customization
 */

import { styled, experimental_extendTheme as extendTheme } from '@mui/material/styles';
import type {} from '@mui/material/themeCssVarsAugmentation';

/**
 * Extends the Material UI styles module to include custom theme options.
 */
declare module '@mui/material/styles' {
  interface PaletteOptions {
    /**
     * Gradient color option for the default palette.
     */
    gradient: {
      /**
       * Default gradient color.
       */
      default: string;
    };
  }

  interface Palette {
    /**
     * Gradient color option for the default palette.
     */
    gradient: {
      /**
       * Default gradient color.
       */
      default: string;
    };
  }
}

/**
 * Creates a styled button component with a background set to the theme's palette gradient.
 */
const StyledComponent = styled('button')(({ theme }) => ({
  /**
   * Background color of the button, set to the theme's palette gradient by default.
   */
  background: theme.vars.palette.gradient.default,
}));

/**
 * Creates a styled button component with an undefined background color (ts-expect-error).
 */
const StyledComponent2 = styled('button')(({ theme }) => ({
  /**
   * Background color of the button, set to the theme's palette gradient by default. Note:
   * `default2` is not defined in this example.
   */
  background: theme.vars.palette.gradient.default2,
}));

/**
 * Extends the Material UI theme with custom color schemes.
 */
const theme = extendTheme({
  /**
   * Custom color scheme options for light and dark modes.
   */
  colorSchemes: {
    /**
     * Light mode color scheme options.
     */
    light: {
      /**
       * Palette configuration for light mode, including gradient settings.
       */
      palette: {
        /**
         * Gradient color option for the default palette in light mode.
         */
        gradient: {
          /**
           * Default gradient color for light mode.
           */
          default: '',
        },
      },
    },
    /**
     * Dark mode color scheme options.
     */
    dark: {
      /**
       * Palette configuration for dark mode, including gradient settings.
       */
      palette: {
        /**
         * Gradient color option for the default palette in dark mode.
         */
        gradient: {
          /**
           * Default gradient color for dark mode.
           */
          default: '',
        },
      },
    },
  },
});

/**
 * Retrieves a CSS variable from the theme's palette gradient.
 */
theme.getCssVar('palette-gradient-default');