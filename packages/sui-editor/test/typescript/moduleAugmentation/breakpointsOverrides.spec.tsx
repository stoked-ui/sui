/**
 * @description Customizes breakpoints in the Material-UI theme for responsive design.
 */

// Extending BreakpointOverrides interface to add custom breakpoints
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

// Custom theme with specified breakpoints and default component styles
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
 * @description Functional component rendering themed content
 * @returns {JSX.Element} Rendered themed content
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