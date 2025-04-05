/**
 * Extends the default MUI theme to include custom palette colors and overrides.
 */

/**
 * Defines additional properties for the status object in the MUI theme.
 * @typedef {Object} StatusProperties
 * @property {string} danger - Color for indicating danger status.
 */

/**
 * Defines a custom neutral color palette based on the primary color palette.
 * @typedef {Palette['primary']} NeutralPalette
 */

/**
 * Defines additional properties for the PaletteColor object.
 * @typedef {Object} CustomPaletteColor
 * @property {string} darker - Darker shade of the color.
 */

/**
 * Defines additional properties for the SimplePaletteColorOptions object.
 * @typedef {Object} CustomSimplePaletteColorOptions
 * @property {string} darker - Darker shade option for the color.
 */

/**
 * Defines additional properties for the ThemeOptions object related to status.
 * @typedef {Object} CustomThemeStatusOptions
 * @property {string} danger - Color for indicating danger status.
 */

/**
 * Extends the ButtonPropsColorOverrides interface in the MUI Button component.
 * @typedef {Object} CustomButtonColorOverrides
 * @property {boolean} neutral - Flag to override button color with neutral palette.
 */

/**
 * Custom MUI theme configuration with custom status colors and palette options.
 */
const theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    primary: {
      main: '#0971f1',
      darker: '#053e85',
    },
    neutral: {
      main: '#5c6ac4',
    },
  },
});