import { createTheme, responsiveFontSizes } from '@mui/material/styles';

/**
 * Extends the TypographyVariants interface to include a custom 'poster' variant.
 */
declare module '@mui/material/styles' {
  interface TypographyVariants {
    poster: React.CSSProperties;
  }

  /**
   * Extends the TypographyVariantsOptions interface to allow configuration using 'createTheme'.
   */
  interface TypographyVariantsOptions {
    poster?: React.CSSProperties;
  }
}

/**
 * Updates the Typography's variant prop options to include 'poster'.
 * Needed for custom variants options in responsiveFontSizes.
 */
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
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
   * Custom variants include 'poster'.
   */
  variants: ['poster'],
});