/**
 * Example of customizing the color of an MUI AppBar component.
 */

import * as React from 'react';
import { AppBar } from '@mui/material';

/**
 * Declares a new property on the AppBarProps interface to override the color.
 */
declare module '@mui/material/AppBar' {
  /**
   * Properties that can be overridden on the AppBar component.
   */
  interface AppBarPropsColorOverrides {
    /**
     * Custom color for the AppBar component.
     */
    customAppBarColor: true;
  }
}

/**
 * Creates an AppBar component with a custom color.
 */
<AppBar color="customAppBarColor" />;

// @ts-expect-error unknown color
/**
 * Attempt to use an invalid color on the AppBar component, intended to trigger a TypeScript error.
 */
<AppBar color="foo" />;