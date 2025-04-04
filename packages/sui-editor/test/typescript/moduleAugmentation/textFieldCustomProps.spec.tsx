import * as React from 'react';
import TextField from '@mui/material/TextField';
import { createTheme } from '@mui/material/styles';

/**
 * Update the TextField's extendable props options.
 */
declare module '@mui/material/TextField' {
  interface TextFieldPropsColorOverrides {
    /**
     * Custom color overrides for the TextField component.
     *
     * @type {boolean}
     * @since 8.0.0
     */
    customPalette: true;
  }
  interface TextFieldPropsSizeOverrides {
    /**
     * Extra large size override for the TextField component.
     *
     * @type {boolean}
     * @since 8.0.0
     */
    extraLarge: true;
  }
}

/**
 * Update the FormControl's extendable props options.
 */
declare module '@mui/material/FormControl' {
  interface FormControlPropsColorOverrides {
    /**
     * Custom color overrides for the FormControl component.
     *
     * @type {boolean}
     * @since 8.0.0
     */
    customPalette: true;
  }
  interface FormControlPropsSizeOverrides {
    /**
     * Extra large size override for the FormControl component.
     *
     * @type {boolean}
     * @since 8.0.0
     */
    extraLarge: true;
  }
}

/**
 * Update the InputBase's extendable props options.
 */
declare module '@mui/material/InputBase' {
  interface InputBasePropsSizeOverrides {
    /**
     * Extra large size override for the InputBase component.
     *
     * @type {boolean}
     * @since 8.0.0
     */
    extraLarge: true;
  }
}

/**
 * Update the theme to include custom palette and overrides for various components.
 */
declare module '@mui/material/styles' {
  interface Palette {
    /**
     * Custom color palette with a primary color.
     *
     * @type {Palette['primary']}
     */
    customPalette: Palette['primary'];
  }
  interface PaletteOptions {
    /**
     * Options for the custom color palette.
     *
     * @type {PaletteOptions['primary']}
     */
    customPalette: PaletteOptions['primary'];
  }
}

/**
 * Create a theme with custom components and colors.
 */
const theme = createTheme({
  components: {
    MuiOutlinedInput: {
      variants: [
        {
          props: { size: 'extraLarge' },
          style: {
            padding: '30px 15px',
            fontSize: 40,
          },
        },
      ],
    },
  },
  palette: {
    customPalette: {
      main: 'blue',
    },
  },
});

/**
 * Example usage of the custom color TextField.
 */
<TextField color="customPalette" size="extraLarge">
  Custom Color TextField
</TextField>;

/**
 * Example usage of the extra large size TextField.
 */
<TextField variant="filled" size="extraLarge">
  Custom Size TextField
</TextField>;