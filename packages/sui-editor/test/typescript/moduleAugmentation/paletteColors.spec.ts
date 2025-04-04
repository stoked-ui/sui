/**
 * Customizes the MUI theme with a custom color palette.
 */
import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  /**
   * The theme object, which contains all of the MUI's styles and settings.
   */
  interface Theme {
    /**
     * An object that defines the default color scheme for the application.
     */
    status: {
      /**
       * The color of the danger state. This value is set to a specific CSS property.
       */
      danger: React.CSSProperties['color'];
    };
  }

  /**
   * An interface that represents a palette of colors, which can be used throughout the application.
   */
  interface Palette {
    /**
     * A reference to the primary palette, which contains common colors like white and black.
     */
    neutral: Palette['primary'];
  }

  /**
   * An interface that defines options for customizing a palette.
   */
  interface PaletteOptions {
    /**
     * A reference to the primary palette's settings, which can be overridden.
     */
    neutral: PaletteOptions['primary'];
  }

  /**
   * An interface that represents a color in the palette, which may have an optional darker variant.
   */
  interface PaletteColor {
    /**
     * An optional string value representing the darker variant of this color.
     */
    darker?: string;
  }

  /**
   * A simple interface for colors in the palette, with an optional darker variant.
   */
  interface SimplePaletteColorOptions {
    /**
     * An optional string value representing the darker variant of this color.
     */
    darker?: string;
  }

  /**
   * An interface that defines options for customizing the theme's styles.
   */
  interface ThemeOptions {
    /**
     * An object that defines the default colors and settings for the application.
     */
    status: {
      /**
       * The color of the danger state, set to a specific CSS property.
       */
      danger: React.CSSProperties['color'];
    };
  }
}

/**
 * A custom theme that overrides some of MUI's built-in styles with our own.
 */
declare module '@mui/material/Button' {
  /**
   * An interface that defines overrides for the Button component's colors.
   */
  interface ButtonPropsColorOverrides {
    /**
     * A boolean value that indicates whether to use the neutral color scheme.
     */
    neutral: true;
  }
}

const theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    primary: {
      main: '#0971f1',
      darker: '#053e85',
    },
    neutral: {
      main: '#5c6ac4',
    },
  },
});