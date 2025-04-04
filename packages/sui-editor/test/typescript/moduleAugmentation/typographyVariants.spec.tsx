/**
 * Importing necessary dependencies from React and Material-UI.
 */
import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

/**
 * Declaring a new interface for the `TypographyVariants` object in the `@mui/material/styles` module.
 *
 * @interface TypographyVariants
 *   @description The typography variant options.
 *   @property {React.CSSProperties} poster The color property of the poster variant.
 */
declare module '@mui/material/styles' {
  interface TypographyVariants {
    /**
     * @param {string} value The color property value.
     * @returns {string} The resulting CSS style string.
     */
    poster: React.CSSProperties;
  }

  /**
   * Declaring an interface for the `TypographyVariantsOptions` object in the `@mui/material/styles` module.
   *
   * @interface TypographyVariantsOptions
   *   @description The options for configuring the typography variant prop.
   *   @property {React.CSSProperties} [poster] Optional property for setting the poster variant color.
   */
  interface TypographyVariantsOptions {
    /**
     * @param {React.CSSProperties} value The poster variant color style object.
     * @returns {React.CSSProperties | undefined} The resulting CSS style string or undefined if no poster variant is set.
     */
    poster?: React.CSSProperties;
  }
}

/**
 * Declaring a new interface for the `TypographyPropsVariantOverrides` object in the `@mui/material/Typography` module.
 *
 * @interface TypographyPropsVariantOverrides
 *   @description The overrides for configuring the typography variant prop on individual components.
 *   @property {boolean} poster Whether to include the poster variant or not.
 *   @property {boolean} h3 Whether to include the h3 variant or not.
 */
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    /**
     * @param {boolean} value The poster variant property value.
     * @returns {void}
     */
    poster: true;
    /**
     * @param {boolean} value The h3 variant property value.
     * @returns {void}
     */
    h3: false;
  }
}

/**
 * Creating a new theme using the `createTheme` function from Material-UI.
 *
 * @constant
 * @type {object}
 *   @description The created theme object.
 */
const theme = createTheme({
  /**
   * @description The typography configuration options for the theme.
   *   @property {React.CSSProperties} poster The color property of the poster variant.
   *   @property {(undefined | React.CSSProperties)} h3 The h3 variant option. If set to undefined, it will be disabled.
   */
  typography: {
    /**
     * @param {string} value The color property value.
     * @returns {string} The resulting CSS style string.
     */
    poster: {
      /**
       * @param {string} value The color property value.
       * @returns {string} The resulting CSS style string.
       */
      color: 'red',
    },
    /**
     * Disabling the h3 variant by setting its option to undefined.
     */
    h3: undefined,
  },
});

/**
 * Rendering a Typography component with the poster variant set.
 *
 * @param {object} props The component props.
 *   @description The `Typography` component.
 *   @param {string} props.variant The typography variant. Defaults to 'poster'.
 *   @param {React.ReactNode} props.children The child content of the component.
 */
<Typography variant="poster">poster</Typography>;

/**
 * Demonstrating the usage of a deprecated variant by commenting it out.
 *
 * @deprecated This variant is no longer supported and will be removed in future versions.
 *   @description Rendering a Typography component with the h3 variant set, which is now disabled due to deprecation.
 */
/* This variant is no longer supported */
// @ts-expect-error
<Typography variant="h3">h3</Typography>;