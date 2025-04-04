/**
 * Demonstrates the usage of Material-UI's Tabs component with a custom theme.
 */

import * as React from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { createTheme } from '@mui/material/styles';

/**
 * Module augmentation to override the default indicator color in Tabs.
 */
declare module '@mui/material/Tabs' {
  interface TabsPropsIndicatorColorOverrides {
    /**
     * Overrides the default indicator color of the Tabs component.
     */
    success: true;
  }
}

// Create a custom theme for the Material-UI components
const theme = createTheme({
  /**
   * Customizes the style of the MuiTabs component.
   */
  components: {
    MuiTabs: {
      variants: [
        {
          props: { indicatorColor: 'success' },
          style: {
            backgroundColor: '#e70000',
          },
        },
      ],
    },
  },
});

/**
 * Renders a Tabs component with the custom theme and success indicator color.
 */
function App() {
  return (
    <Tabs indicatorColor="success">
      <Tab label="Item One" />
      <Tab label="Item Two" />
    </Tabs>
  );
}

// @ts-expect-error unknown indicatorColor
/**
 * Demonstrates how to override the default indicator color of the Tabs component.
 */
function ErrorTabs() {
  return (
    <Tabs indicatorColor="error">
      <Tab label="Item One" />
      <Tab label="Item Two" />
    </Tabs>
  );
}