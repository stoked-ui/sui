/**
 * Updates the Chip component's extendable props options.
 */
import * as React from 'react';
import Chip from '@mui/material/Chip';
import { createTheme } from '@mui/material/styles';

/**
 * Extendable properties for @mui/material/Chip
 */
declare module '@mui/material/Chip' {
  /**
   * Variants that can be used with the dashed prop.
   */
  interface ChipPropsVariantOverrides {
    /**
     * Dashed variant styles.
     */
    dashed: true;
    outlined: false;
  }

  /**
   * Colors that can be used with the success prop.
   */
  interface ChipPropsColorOverrides {
    /**
     * Success color for chip.
     */
    success: true;
  }

  /**
   * Sizes that can be used with the extraLarge prop.
   */
  interface ChipPropsSizeOverrides {
    /**
     * Extra large size for chip.
     */
    extraLarge: true;
  }
}

/**
 * Creates a final theme with custom styles for @mui/material/Chip components.
 */
const finalTheme = createTheme({
  components: {
    MuiChip: {
      /**
       * Styles for the chip component's root element.
       *
       * @param ownerState The state of the component.
       * @param theme The current theme.
       */
      styleOverrides: ({ ownerState, theme }) => ({
        ...(ownerState.variant &&
          {
            dashed: {
              border: '1px dashed',
            },
            filled: {
              backgroundColor: ownerState.color === 'success' ? 'lime' : theme.palette.grey[100],
            },
          }[ownerState.variant]),
      }),
      /**
       * Styles for the chip component's label element.
       *
       * @param ownerState The state of the component.
       */
      label: ({ ownerState }) => [
        ownerState.color === 'success' && {
          color: 'lime',
        },
      ],
    },
  },
});

/**
 * Renders a Chip component with dashed variant, success color, and extra large size.
 */
<Chip
  /**
   * The variant of the chip.
   *
   * @default 'filled'
   */
  variant="dashed"
  /**
   * The color of the chip.
   *
   * @default 'inherit'
   */
  color="success"
  /**
   * The size of the chip.
   *
   * @default 'sm'
   */
  size="extraLarge"
  label="Content" />;
};

/**
 * Renders a Chip component with outlined variant, primary color, and default size.
 */
// @ts-expect-error The contained variant was disabled
<Chip variant="outlined" color="primary" label="Content" />;