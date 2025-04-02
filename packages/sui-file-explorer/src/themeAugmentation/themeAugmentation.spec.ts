import { createTheme } from '@mui/material/styles';
import { fileClasses } from '../File';
import { fileExplorerClasses } from '../FileExplorer';
import { fileExplorerBasicClasses } from '../FileExplorerBasic';
import { fileElementClasses } from '../FileElement';

createTheme({
  components: {
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

