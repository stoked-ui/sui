/**
 * @module FileDepthContext
 */

import * as React from 'react';
import {FileId} from '../../models';

/**
 * Context for determining the depth of a file.
 *
 * The context holds either a number representing the current depth or a function that calculates the depth for a given file ID.
 */
export const FileDepthContext = React.createContext<
  number | ((id: FileId) => number)
>(() => -1);

if (process.env.NODE_ENV !== 'production') {
  /**
   * @typedef {string} DisplayName
   */
  /**
   * The display name of the context in development environment.
   *
   * @type {DisplayName}
   */
  FileDepthContext.displayName = 'FileDepthContext';
}