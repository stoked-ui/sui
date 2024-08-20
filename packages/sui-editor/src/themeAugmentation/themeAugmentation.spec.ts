import { createTheme } from '@mui/material/styles';
import { videoEditorClasses } from '../VideoEditor';

createTheme({
  components: {
    MuiVideoEditor: {
      defaultProps: {
      },
      styleOverrides: {
        root: {
          backgroundColor: 'red',
          [`.${videoEditorClasses.root}`]: {
            backgroundColor: 'green',
          },
        },
      },
    },
  },
});
