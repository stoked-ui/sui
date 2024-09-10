import * as React from 'react';
import {FileExplorerAnyPluginSignature} from '../models';
import {FileExplorerContext} from './FileExplorerContext';
import {FileExplorerContextValue} from './FileExplorerProvider.types';

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
