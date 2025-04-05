import * as React from 'react';
import Chip from '@mui/material/Chip';
import { createTheme } from '@mui/material/styles';

/**
 * Extends the Chip component's props options.
 */
declare module '@mui/material/Chip' {
  /**
   * Variant overrides for Chip props.
   */
  interface ChipPropsVariantOverrides {
    dashed: true;
    outlined: false;
  }
  /**
   * Color overrides for Chip props.
   */
  interface ChipPropsColorOverrides {
    success: true;
  }
  /**
   * Size overrides for Chip props.
   */
  interface ChipPropsSizeOverrides {
    extraLarge: true;
  }
}

/**
 * Theme typings should work as expected.
 */
const finalTheme = createTheme({
  components: {
    MuiChip: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
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
        label: ({ ownerState }) => [
          ownerState.color === 'success' && {
            color: 'lime',
          },
        ],
      },
    },
  },
});

/**
 * Example of using the Chip component with custom props.
 * 
 * @example
 * <Chip variant="dashed" color="success" size="extraLarge" label="Content" />;
 * 
 * @example
 * <Chip variant="outlined" color="primary" label="Content" />;
 */
<Chip variant="dashed" color="success" size="extraLarge" label="Content" />;

// @ts-expect-error The contained variant was disabled
<Chip variant="outlined" color="primary" label="Content" />;