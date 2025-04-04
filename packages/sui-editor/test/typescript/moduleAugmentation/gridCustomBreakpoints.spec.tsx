import * as React from 'react';
import Grid from '@mui/material/Grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';

/**
 * Custom breakpoint overrides for MUI themes.
 */
declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    /**
     * Override for xs (extra small) breakpoint.
     */
    xs: false;

    /**
     * Override for sm (small) breakpoint.
     */
    sm: false;

    /**
     * Override for md (medium) breakpoint.
     */
    md: false;

    /**
     * Override for lg (large) breakpoint.
     */
    lg: false;

    /**
     * Override for xl (extra large) breakpoint.
     */
    xl: false;

    /**
     * Override for mobile devices.
     */
    mobile: true;

    /**
     * Override for tablet devices.
     */
    tablet: true;

    /**
     * Override for laptop devices.
     */
    laptop: true;

    /**
     * Override for desktop devices.
     */
    desktop: true;
  }
}

/**
 * Create a custom theme with breakpoints set to override MUI's default settings.
 */
const theme = createTheme({
  /**
   * Custom breakpoint values.
   */
  breakpoints: {
    values: {
      mobile: 0,
      tablet: 640,
      laptop: 1024,
      desktop: 1280,
    },
  },
});

/**
 * Wrap the Grid component with the ThemeProvider to apply the custom theme.
 */
<ThemeProvider theme={theme}>
  <Grid item mobile={1} tablet={2} laptop={3} desktop={4} />
</ThemeProvider>;

/**
 * Attempt to render a Grid component with an unknown 'desk' breakpoint,
 * which should throw an error due to TypeScript's type checking.
 *
 * @ts-expect-error unknown desk
 */
<ThemeProvider theme={theme}>
  <Grid item mobile={1} tablet={2} laptop={3} desk={4} />
</ThemeProvider>;