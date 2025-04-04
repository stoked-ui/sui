/**
 * Creates a custom theme for the MuiEditor component.
 *
 * @see editorClasses
 */
import { createTheme } from '@mui/material/styles';
import { editorClasses } from '../Editor';

createTheme({
  /**
   * The components to be included in this theme.
   *
   * @type {object}
   */
  components: {
    MuiEditor: {
      /**
       * The default props for the MuiEditor component.
       *
       * @type {object}
       */
      defaultProps: {
        // Add properties and usage as needed
      },
      /**
       * Custom style overrides for the MuiEditor component.
       *
       * @type {object}
       */
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