/**
 * Theme customization for button components.
 */

import { blue, red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

/**
 * Extends the ButtonPropsVariantOverrides interface to include a 'dashed' variant.
 */
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    dashed: true;
  }
}

/**
 * Custom theme configuration for button components.
 */
const theme = createTheme({
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: 'dashed' },
          style: {
            textTransform: 'none',
            border: `2px dashed grey${blue[500]}`,
          },
        },
        {
          props: { variant: 'dashed', color: 'secondary' },
          style: {
            border: `4px dashed ${red[500]}`,
          },
        },
      ],
    },
  },
});
