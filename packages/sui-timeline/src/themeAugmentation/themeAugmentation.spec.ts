import {createTheme} from '@mui/material/styles';
import {timelineClasses} from '../Timeline';
import {timelineActionClasses} from '../TimelineAction';

createTheme({
  components: {
    MuiTimeline: {
      defaultProps: {
      },
      styleOverrides: {
        root: {
          backgroundColor: 'red',
          [`.${timelineClasses.root}`]: {
            backgroundColor: 'green',
          },
        },
      },
    },
    MuiTimelineAction: {
      defaultProps: {
      },
      styleOverrides: {
        root: {
          backgroundColor: 'red',
          [`.${timelineActionClasses.root}`]: {
            backgroundColor: 'green',
          },
        },
      },
    },
  },
});

