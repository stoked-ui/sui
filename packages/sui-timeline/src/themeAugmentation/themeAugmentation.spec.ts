/**
 * Creates a custom theme for the Material-UI Timeline and TimelineAction components.
 * @param {Object} options - The options for customizing the theme.
 */
createTheme({
  components: {
    MuiTimeline: {
      /**
       * Default props for the MuiTimeline component.
       * @property {Object} defaultProps - Default properties for MuiTimeline.
       */
      defaultProps: {
      },
      /**
       * Custom style overrides for the MuiTimeline component.
       * @property {Object} styleOverrides - Custom style overrides for MuiTimeline.
       */
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
      /**
       * Default props for the MuiTimelineAction component.
       * @property {Object} defaultProps - Default properties for MuiTimelineAction.
       */
      defaultProps: {
      },
      /**
       * Custom style overrides for the MuiTimelineAction component.
       * @property {Object} styleOverrides - Custom style overrides for MuiTimelineAction.
       */
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
