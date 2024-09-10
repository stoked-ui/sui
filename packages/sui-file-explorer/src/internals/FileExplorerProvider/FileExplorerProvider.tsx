import * as React from 'react';
import {FileExplorerProviderProps} from './FileExplorerProvider.types';
import {FileExplorerContext} from './FileExplorerContext';
import {FileExplorerAnyPluginSignature} from '../models';

/**
 * Sets up the contexts for the underlying File components.
 *
 * @ignore - do not document.
 */
export function FileExplorerProvider<TSignatures extends readonly FileExplorerAnyPluginSignature[]>(
  props: FileExplorerProviderProps<TSignatures>,
) {
  const { value, children } = props;

  return (
    <FileExplorerContext.Provider value={value}>
      {value.wrapRoot({ children })}
    </FileExplorerContext.Provider>
  );
}
