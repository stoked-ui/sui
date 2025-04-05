import * as React from 'react';
import TextField from '@mui/material/TextField';
import { createTheme } from '@mui/material/styles';

/**
 * Update the TextField's extendable props options
 */
declare module '@mui/material/TextField' {
  /**
   * TextField color overrides
   */
  interface TextFieldPropsColorOverrides {
    customPalette: true;
  }
  /**
   * TextField size overrides
   */
  interface TextFieldPropsSizeOverrides {
    extraLarge: true;
  }
}
declare module '@mui/material/FormControl' {
  /**
   * FormControl color overrides
   */
  interface FormControlPropsColorOverrides {
    customPalette: true;
  }
  /**
   * FormControl size overrides
   */
  interface FormControlPropsSizeOverrides {
    extraLarge: true;
  }
}
declare module '@mui/material/InputBase' {
  /**
   * InputBase size overrides
   */
  interface InputBasePropsSizeOverrides {
    extraLarge: true;
  }
}
declare module '@mui/material/styles' {
  /**
   * Custom palette settings
   */
  interface Palette {
    customPalette: Palette['primary'];
  }
  /**
   * Custom palette options
   */
  interface PaletteOptions {
    customPalette: PaletteOptions['primary'];
  }
}

/**
 * Theme typings should work as expected
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
 * Custom Color TextField component
 * @returns {JSX.Element}
 * @param {TextFieldPropsColorOverrides} props.color - Custom color palette
 */
<TextField color="customPalette" size="extraLarge">
  Custom Color TextField
</TextField>;

/**
 * Custom Size TextField component
 * @returns {JSX.Element}
 * @param {TextFieldPropsSizeOverrides} props.variant - Custom size variant
 */
<TextField variant="filled" size="extraLarge">
  Custom Size TextField
</TextField>;