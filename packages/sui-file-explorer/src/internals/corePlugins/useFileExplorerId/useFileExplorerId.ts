/**
 * File Explorer ID plugin for React.
 *
 * This plugin generates a unique ID for the file explorer component based on the provided params.
 */

import * as React from 'react';
import useId from '@mui/utils/useId';
import {FileExplorerPlugin} from '../../models';
import {UseFileExplorerIdSignature} from './useFileExplorerId.types';

/**
 * File Explorer plugin class.
 *
 * @param {object} params - Plugin configuration object with the id property.
 */
export const useFileExplorerId: FileExplorerPlugin<UseFileExplorerIdSignature> = ({ params }) => {
  /**
   * Generate a unique ID for the file explorer component based on the provided params.
   */
  const fileExplorerId = useId(params.id);

  /**
   * Callback function to generate the file ID attribute.
   *
   * @param {string} id - The file ID to generate an attribute for.
   * @returns {string} The generated file ID attribute.
   */
  const getFileIdAttribute = React.useCallback(
    (id: string) => id ?? `${fileExplorerId}-${id}`,
    [fileExplorerId],
  );

  /**
   * Plugin instance with the getRootProps and getFileIdAttribute functions.
   */
  return {
    /**
     * Returns the root props for the file explorer component.
     *
     * @returns {object} The root props object with the id property set to the fileExplorerId.
     */
    getRootProps: () => ({
      id: fileExplorerId,
    }),
    /**
     * Instance of the plugin with the getFileIdAttribute function.
     */
    instance: {
      getFileIdAttribute,
    },
  };
};

useFileExplorerId.params = {
  id: true,
};