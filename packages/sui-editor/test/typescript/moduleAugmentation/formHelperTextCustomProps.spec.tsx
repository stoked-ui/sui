/**
 * Theme configuration for Material-UI
 */
const theme = createTheme({
  /**
   * Customizations for the FormHelperText component
   */
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