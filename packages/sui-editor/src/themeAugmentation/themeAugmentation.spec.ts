import {createTheme} from '@mui/material/styles';
import {editorClasses} from '../Editor';

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

