/**
 * Creates a custom theme for MUI File Explorer components.
 *
 * This function takes no parameters and returns the created theme object.
 */
export default function createTheme() {
  // Import required styles from other modules
  import { fileClasses } from '../File';
  import { fileExplorerClasses } from '../FileExplorer';
  import { fileExplorerBasicClasses } from '../FileExplorerBasic';
  import { fileElementClasses } from '../FileElement';

  /**
   * Defines the components that need style overrides.
   *
   * @type {object}
   */
  const components = {
    /**
     * Style override for MuiFileExplorerBasic component.
     *
     * This component is used to display a basic explorer panel.
     *
     * @property {string} defaultExpandedItems - The initial items that are expanded in the file explorer.
     * @property {object} styleOverrides - Custom styles applied to the root element of this component.
     */
    MuiFileExplorerBasic: {
      defaultProps: {
        defaultExpandedItems: ['root'],
      },
      styleOverrides: {
        root: {
          backgroundColor: 'red',
          [`.${fileExplorerBasicClasses.root}`]: {
            backgroundColor: 'green',
          },
        },
      },
    },

    /**
     * Style override for MuiFileExplorer component.
     *
     * This component is used to display a file explorer panel.
     *
     * @property {string} defaultExpandedItems - The initial items that are expanded in the file explorer.
     * @property {object} styleOverrides - Custom styles applied to the root element of this component.
     */
    MuiFileExplorer: {
      defaultProps: {
        defaultExpandedItems: ['root'],
      },
      styleOverrides: {
        root: {
          backgroundColor: 'red',
          [`.${fileExplorerClasses.root}`]: {
            backgroundColor: 'green',
          },
        },
      },
    },

    /**
     * Style override for MuiFileElement component.
     *
     * This component is used to display a file element in the explorer panel.
     *
     * @property {string} id - The ID of the file element.
     * @property {object} styleOverrides - Custom styles applied to the root element of this component.
     */
    MuiFileElement: {
      defaultProps: {
        id: '1',
      },
      styleOverrides: {
        root: {
          backgroundColor: 'red',
          [`.${fileElementClasses.content}`]: {
            backgroundColor: 'green',
          },
        },
      },
    },

    /**
     * Style override for MuiFile component.
     *
     * This component is used to display a file in the explorer panel.
     *
     * @property {string} id - The ID of the file.
     * @property {object} styleOverrides - Custom styles applied to the root element of this component.
     */
    MuiFile: {
      defaultProps: {
        id: '1',
      },
      styleOverrides: {
        root: {
          backgroundColor: 'red',
          [`.${fileClasses.content}`]: {
            backgroundColor: 'green',
          },
        },
      },
    },
  };

  // Create and return the theme object
  return createTheme({
    components,
  });
}