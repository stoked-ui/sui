import * as React from 'react';
import Button from '@mui/material/Button';
import { createTheme } from '@mui/material/styles';

/**
 * Updates the Button's extendable props options.
 * 
 * This module declaration extends the ButtonPropsVariantOverrides,
 * ButtonPropsColorOverrides, and ButtonPropsSizeOverrides interfaces to add new variants.
 */
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    /**
     * Override the variant prop to create a dashed button.
     */
    dashed: true;
    /**
     * Disable the contained variant.
     */
    contained: false;
  }
  interface ButtonPropsColorOverrides {
    /**
     * Override the color prop to display success buttons.
     */
    success: true;
  }
  interface ButtonPropsSizeOverrides {
    /**
     * Override the size prop to create an extra large button.
     */
    extraLarge: true;
  }
}

/**
 * Creates a custom theme for Material UI components.
 * 
 * This theme extends the default theme with custom variants and styles for the MuiButton component.
 */
const theme = createTheme({
  /**
   * Customize the MuiButton component's variants.
   */
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: 'dashed' },
          style: {
            border: `2px dashed grey`,
          },
        },
        {
          props: { size: 'extraLarge' },
          style: {
            fontSize: 26,
          },
        },
      ],
    },
  },
});

/**
 * Renders a custom button with the new variant.
 */
<Button variant="dashed" color="success" size="extraLarge">
  Custom
</Button>;

/**
 * Demonstrates that the contained variant was disabled due to the previous declaration.
 */
// @ts-expect-error The contained variant was disabled
<Button variant="contained" color="primary">
  Invalid
</Button>;