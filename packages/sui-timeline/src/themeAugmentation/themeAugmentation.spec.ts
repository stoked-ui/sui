/**
 * Creates a custom theme for Material-UI components.
 *
 * This function creates a new theme object with customized styles for the Timeline and TimelineAction components.
 */

import {createTheme} from '@mui/material/styles';
import {timelineClasses} from '../Timeline';
import {timelineActionClasses} from '../TimelineAction';

/**
 * Create a custom theme for Material-UI components.
 *
 * @returns {object} The created theme object.
 */
function createCustomTheme() {
  /**
   * Create a new theme object with customized styles.
   */
  const theme = createTheme({
    /**
     * Define the default props for the Timeline component.
     */
    components: {
      MuiTimeline: {
        defaultProps: {
          // Add default props here
        },
        styleOverrides: {
          root: {
            backgroundColor: 'red', // Default background color
            [`.${timelineClasses.root}`]: { // Override for timeline classes
              backgroundColor: 'green',
            },
          },
        },
      },
      /**
       * Define the default props for the TimelineAction component.
       */
      MuiTimelineAction: {
        defaultProps: {
          // Add default props here
        },
        styleOverrides: {
          root: {
            backgroundColor: 'red', // Default background color
            [`.${timelineActionClasses.root}`]: { // Override for timeline action classes
              backgroundColor: 'green',
            },
          },
        },
      },
    },
  });

  /**
   * Return the created theme object.
   */
  return theme;
}

// Use the createCustomTheme function to get the custom theme
const customTheme = createCustomTheme();