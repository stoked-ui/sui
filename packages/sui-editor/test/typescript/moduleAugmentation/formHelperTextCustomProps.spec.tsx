/**
 * Theme typings should work as expected.
 */
const theme = createTheme({
  components: {
    MuiFormHelperText: {
      variants: [
        {
          props: { variant: 'warning' },
          style: {
            backgroundColor: '#ffa726',
            color: '#ffffff',
          },
        },
      ],
    },
  },
});

/**
 * Represents a form control with helper text in a warning variant.
 * @returns {JSX.Element}
 * @example
 * <FormControl>
 *    <FormHelperText variant="warning">This is warning helper text</FormHelperText>
 * </FormControl>
 * @example
 * <FormControl>
 *    {/* @ts-expect-error unknown variant */}
 *    <FormHelperText variant="checked">This is example helper text</FormHelperText>
 * </FormControl>
 */
<FormControl>
  <FormHelperText variant="warning">This is warning helper text</FormHelperText>
</FormControl>;

<FormControl>
  {/* @ts-expect-error unknown variant */}
  <FormHelperText variant="checked">This is example helper text</FormHelperText>
</FormControl>;