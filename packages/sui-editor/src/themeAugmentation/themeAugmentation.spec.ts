/**
 * Create a custom theme for the MUI Editor component
 * @param {object} options - The options for customizing the theme
 * @param {object} options.components - The components object for defining component-specific styles
 * @param {object} options.components.MuiEditor - The MUI Editor component configuration
 * @param {object} options.components.MuiEditor.defaultProps - The default props for the MUI Editor component
 * @param {object} options.components.MuiEditor.styleOverrides - The style overrides for the MUI Editor component
 * @param {object} options.components.MuiEditor.styleOverrides.root - The root style for the MUI Editor component
 * @param {string} options.components.MuiEditor.styleOverrides.root.backgroundColor - The background color for the root of the MUI Editor component
 * @fires MuiEditor
 */

createTheme({
  components: {
    MuiEditor: {
      defaultProps: {
      },
      styleOverrides: {
        root: {
          backgroundColor: 'red',
          [`.${editorClasses.root}`]: {
            backgroundColor: 'green',
          },
        },
      },
    },
  },
});