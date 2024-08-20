import { createTheme } from '@mui/material/styles';
import { editorClasses } from '../Button';

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
