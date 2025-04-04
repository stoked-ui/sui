/**
 * This module is for testing Material-UI component's color overrides.
 */

import * as React from 'react';
import { CircularProgress, LinearProgress } from '@mui/material';

declare module '@mui/material/CircularProgress' {
  /**
   * Defines the customCircularColor property for the CircularProgressProps interface.
   */
  interface CircularProgressPropsColorOverrides {
    /**
     * Custom color for the circular progress bar.
     *
     * @type {string}
     */
    customCircularColor: true;
  }
}

declare module '@mui/material/LinearProgress' {
  /**
   * Defines the customLinearColor property for the LinearProgressProps interface.
   */
  interface LinearProgressPropsColorOverrides {
    /**
     * Custom color for the linear progress bar.
     *
     * @type {string}
     */
    customLinearColor: true;
  }
}

<CircularProgress color="customCircularColor" />;

// @ts-expect-error unknown color
<CircularProgress color="foo" />;

<LinearProgress color="customLinearColor" />;

// @ts-expect-error unknown color
<LinearProgress color="foo" />;