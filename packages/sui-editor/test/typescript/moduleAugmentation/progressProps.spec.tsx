/**
 * @typedef {Object} CircularProgressPropsColorOverrides
 * @property {boolean} customCircularColor - Indicates custom circular color
 */

/**
 * @typedef {Object} LinearProgressPropsColorOverrides
 * @property {boolean} customLinearColor - Indicates custom linear color
 */

import * as React from 'react';
import { CircularProgress, LinearProgress } from '@mui/material';

/**
 * Example usage:
 * <CircularProgress color="customCircularColor" />
 */
<CircularProgress color="customCircularColor" />;

// @ts-expect-error unknown color
<CircularProgress color="foo" />;

/**
 * Example usage:
 * <LinearProgress color="customLinearColor" />
 */
<LinearProgress color="customLinearColor" />;

// @ts-expect-error unknown color
<LinearProgress color="foo" />;