import * as React from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { createTheme } from '@mui/material/styles';

/**
 * Theme typings should work as expected.
 */
const theme = createTheme({
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
 * Example usage of Tabs component with success indicator color.
 * 
 * @returns {JSX.Element}
 * @example
 * <Tabs indicatorColor="success">
 *   <Tab label="Item One" />
 *   <Tab label="Item Two" />
 * </Tabs>
 */
<Tabs indicatorColor="success">
  <Tab label="Item One" />
  <Tab label="Item Two" />
</Tabs>;

/**
 * Example usage of Tabs component with error indicator color.
 * 
 * @returns {JSX.Element}
 * @example
 * // @ts-expect-error unknown indicatorColor
 * <Tabs indicatorColor="error">
 *   <Tab label="Item One" />
 *   <Tab label="Item Two" />
 * </Tabs>
 */
<Tabs indicatorColor="error">
  <Tab label="Item One" />
  <Tab label="Item Two" />
</Tabs>;