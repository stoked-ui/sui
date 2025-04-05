/**
 * @typedef {Object} BreakpointOverrides
 * @property {boolean} xs - Extra small breakpoint
 * @property {boolean} sm - Small breakpoint
 * @property {boolean} md - Medium breakpoint
 * @property {boolean} lg - Large breakpoint
 * @property {boolean} xl - Extra large breakpoint
 * @property {boolean} mobile - Mobile breakpoint
 * @property {boolean} tablet - Tablet breakpoint
 * @property {boolean} laptop - Laptop breakpoint
 * @property {boolean} desktop - Desktop breakpoint
 */

/**
 * @typedef {Object} ThemeValues
 * @property {number} mobile - Mobile breakpoint value
 * @property {number} tablet - Tablet breakpoint value
 * @property {number} laptop - Laptop breakpoint value
 * @property {number} desktop - Desktop breakpoint value
 */

/**
 * @typedef {Object} ThemeBreakpoints
 * @property {ThemeValues} values - Breakpoint values
 */

/**
 * @typedef {Object} CustomTheme
 * @property {ThemeBreakpoints} breakpoints - Custom breakpoints for the theme
 */

/**
 * Custom breakpoint overrides for material-ui theme
 */
declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: false;
    sm: false;
    md: false;
    lg: false;
    xl: false;
    mobile: true;
    tablet: true;
    laptop: true;
    desktop: true;
  }
}

/**
 * Custom theme with specific breakpoints
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
});

/**
 * Example of using custom breakpoints with Grid component
 * @returns {JSX.Element} JSX Element with Grid component
 * @example
 * <ThemeProvider theme={theme}>
 *   <Grid item mobile={1} tablet={2} laptop={3} desktop={4} />
 * </ThemeProvider>;
 */
<ThemeProvider theme={theme}>
  <Grid item mobile={1} tablet={2} laptop={3} desktop={4} />
</ThemeProvider>;

/**
 * Example of using custom breakpoints with Grid component and an unknown prop
 * @returns {JSX.Element} JSX Element with Grid component
 * @example
 * <ThemeProvider theme={theme}>
 *   {/* @ts-expect-error unknown desk */}
 *   <Grid item mobile={1} tablet={2} laptop={3} desk={4} />
 * </ThemeProvider>;
 */
<ThemeProvider theme={theme}>
  {/* @ts-expect-error unknown desk */}
  <Grid item mobile={1} tablet={2} laptop={3} desk={4} />
</ThemeProvider>;