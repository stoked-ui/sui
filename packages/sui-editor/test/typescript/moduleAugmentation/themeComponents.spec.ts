/**
 * @file
 * Defines a customization theme component for Material UI.
 *
 * This file includes the creation of a custom theme and its components.
 */

import { blue, red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

/**
 * @interface ButtonPropsVariantOverrides
 * @description Overrides for button props variant.
 */
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    /**
     * A variant that creates a dashed border effect.
     */
    dashed: true;
  }
}

const theme = createTheme({
  /**
   * @enum {Object}
   * @description Custom component variants for the MuiButton.
   */
  components: {
    MuiButton: {
      /**
       * @enum {Array<Object>}
       * @description List of button variants that include the dashed variant.
       */
      variants: [
        {
          /**
           * Props for the dashed variant.
           *
           * @see {@link https://material-ui.com/api/button/#props-button-variant}
           */
          props: { variant: 'dashed' },
          /**
           * Styles applied to the dashed variant.
           *
           * @see {@link https://material-ui.com/api/styles/#styles-object}
           */
          style: {
            textTransform: 'none',
            border: `2px dashed grey${blue[500]}`,
          },
        },
        {
          /**
           * Props for the dashed variant with secondary color.
           *
           * @see {@link https://material-ui.com/api/button/#props-button-variant}
           */
          props: { variant: 'dashed', color: 'secondary' },
          /**
           * Styles applied to the dashed variant with secondary color.
           *
           * @see {@link https://material-ui.com/api/styles/#styles-object}
           */
          style: {
            border: `4px dashed ${red[500]}`,
          },
        },
      ],
    },
  },
});