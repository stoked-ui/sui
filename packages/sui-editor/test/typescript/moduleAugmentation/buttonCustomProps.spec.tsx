/**
 * Update the Button's extendable props options
 */
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    dashed: true;
    contained: false;
  }
  interface ButtonPropsColorOverrides {
    success: true;
  }
  interface ButtonPropsSizeOverrides {
    extraLarge: true;
  }
}

/**
 * Theme typings should work as expected
 */
const theme = createTheme({
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: 'dashed' },
          style: {
            border: `2px dashed grey`,
          },
        },
        {
          props: { size: 'extraLarge' },
          style: {
            fontSize: 26,
          },
        },
      ],
    },
  },
});

/**
 * Example usage:
 * <Button variant="dashed" color="success" size="extraLarge">
 *    Custom
 * </Button>;
 */
<Button variant="dashed" color="success" size="extraLarge">
  Custom
</Button>;

// @ts-expect-error The contained variant was disabled
/**
 * Example usage:
 * <Button variant="contained" color="primary">
 *    Invalid
 * </Button>;
 */
<Button variant="contained" color="primary">
  Invalid
</Button>;