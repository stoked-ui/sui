/**
 * Theme configuration for file explorer components
 */
createTheme({
  components: {
    /**
     * Overrides for MuiFileExplorerBasic component
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
     * Overrides for MuiFileExplorer component
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
     * Overrides for MuiFileElement component
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
     * Overrides for MuiFile component
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
  },
});