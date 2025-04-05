/**
 * Interface for defining gradient colors in the palette options.
 * @typedef {object} GradientPaletteOptions
 * @property {string} default - Default gradient color.
 */

/**
 * @description Styled button component with custom gradient styling.
 * @param {Object} props - Component props.
 * @property {Object} props.theme - Theme object.
 * @returns {JSX.Element} React button element.
 * @example
 * <StyledComponent />
 */
const StyledComponent = styled('button')(({ theme }) => ({
  background: theme.vars.palette.gradient.default,
}));

/**
 * @description Styled button component with custom gradient styling (error demonstration).
 * @param {Object} props - Component props.
 * @property {Object} props.theme - Theme object.
 */
const StyledComponent2 = styled('button')(({ theme }) => ({
  // @ts-expect-error `default2` is not defined
  background: theme.vars.palette.gradient.default2,
}));

/**
 * Custom theme extension with color schemes and gradient palettes.
 */
const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        gradient: {
          default: '',
        },
      },
    },
    dark: {
      palette: {
        gradient: {
          default: '',
        },
      },
    },
  },
});

theme.getCssVar('palette-gradient-default');
