import * as React from 'react';
import {FileExplorerAnyPluginSignature} from '../models';
import {FileExplorerContext} from './FileExplorerContext';
import {FileExplorerContextValue} from './FileExplorerProvider.types';

/**
 * Hook to access the File Explorer context.
 *
 * This hook is used to inject the file explorer context into a component,
 * allowing it to use plugins and options. If no context is found, an error
 * is thrown.
 *
 * @param {Object} [options={}] - Optional plugin signatures to pass to the context.
 * @returns {FileExplorerContextValue<TSignatures, TOptionalSignatures>} The file explorer context.
 */
export const useFileExplorerContext = <
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TOptionalSignatures extends readonly FileExplorerAnyPluginSignature[] = [],
>() => {
  const context = React.useContext(FileExplorerContext) as FileExplorerContextValue<
    TSignatures,
    TOptionalSignatures
  >;

  if (context == null) {
    throw new Error(
      [
        'SUI X: Could not find the FileExplorer View context.',
        'It looks like you rendered your component outside of a FileExplorerBasic or FileExplorer parent component.',
        'This can also happen if you are bundling multiple versions of the FileExplorer View.',
      ].join('\n'),
    );
  }

  return context;
};