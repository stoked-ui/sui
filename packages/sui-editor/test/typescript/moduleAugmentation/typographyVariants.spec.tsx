import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

/**
 * Extends Typography variants to include 'poster' variant with custom styles.
 */
declare module '@mui/material/styles' {
  interface TypographyVariants {
    poster: React.CSSProperties;
  }

  /**
   * Allows configuration of Typography variants using `createTheme`.
   */
  interface TypographyVariantsOptions {
    poster?: React.CSSProperties;
  }
}

/**
 * Updates the Typography component's variant prop options.
 */
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    poster: true;
    h3: false;
  }
}

const theme = createTheme({
  typography: {
    poster: {
      color: 'red',
    },
    // Disable h3 variant
    h3: undefined,
  },
});

/**
 * Displays a Typography component with the 'poster' variant.
 * @returns {JSX.Element} A Typography component with 'poster' variant.
 */
<Typography variant="poster">poster</Typography>;

/* This variant is no longer supported */
// @ts-expect-error
/**
 * Displays a Typography component with 'h3' variant (no longer supported).
 */
<Typography variant="h3">h3</Typography>;