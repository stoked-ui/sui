import { createTheme, responsiveFontSizes } from '@mui/material/styles';

/**
 * Declares the TypographyVariants interface for @mui/material/styles.
 * This interface is used to configure typography variants using the `createTheme` method.
 */
declare module '@mui/material/styles' {
  /**
   * The poster variant of TypographyVariants, which adds CSS properties to the typography component.
   * 
   * @see https://material-ui.com/customization/typography/#poster-variant
   */
  interface TypographyVariants {
    poster: React.CSSProperties;
  }

  /**
   * Options for configuring the poster variant of TypographyVariants.
   * 
   * @see https://material-ui.com/customization/typography/#poster-variants-options
   */
  interface TypographyVariantsOptions {
    /**
     * Custom CSS properties to add to the typography component when using the poster variant.
     * 
     * @default {}
     */
    poster?: React.CSSProperties;
  }
}

/**
 * Declares the TypographyPropsVariantOverrides interface for @mui/material/Typography.
 * This interface is used to configure custom variants options for the Typography component.
 */
declare module '@mui/material/Typography' {
  /**
   * Overrides for the variant prop of TypographyProps, which allows configuring custom variants.
   * 
   * @see https://material-ui.com/customization/typography/#variant-variants
   */
  interface TypographyPropsVariantOverrides {
    /**
     * Whether to include the poster variant in the typography component.
     * 
     * @default false
     */
    poster: true;
  }
}

let theme = createTheme({
  typography: {
    poster: {
      fontSize: '2rem',
      lineHeight: 1,
    },
    h3: {
      fontSize: '2em',
    },
  },
});
theme = responsiveFontSizes(theme, {
  /**
   * The custom variants to include in the responsiveFontSizes function.
   */
  variants: ['poster'],
});