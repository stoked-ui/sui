import * as React from 'react';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import { createTheme, ThemeProvider } from '@mui/material/styles';

/**
 * Customizes the material-ui theme to remove default breakpoints and add custom ones.
 */
declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: false; // removes the `xs` breakpoint
    sm: false;
    md: false;
    lg: false;
    xl: false;
    mobile: true; // adds the `mobile` breakpoint
    tablet: true;
    laptop: true;
    desktop: true;
  }
}

/**
 * Creates a custom theme with customized breakpoints and container properties.
 */
const theme = createTheme({
  breakpoints: {
    values: {
      mobile: 0,
      tablet: 640,
      laptop: 1024,
      desktop: 1280,
    },
  },
  components: {
    MuiContainer: {
      defaultProps: {
        maxWidth: 'laptop',
      },
    },
  },
});

/**
 * A React component that demonstrates the usage of the customized theme.
 */
function MyContainer() {
  return (
    <ThemeProvider theme={theme}>
      hello
      <Container maxWidth="tablet">yooo</Container>
      <Dialog open maxWidth="tablet">
        <div />
      </Dialog>
    </ThemeProvider>
  );
}