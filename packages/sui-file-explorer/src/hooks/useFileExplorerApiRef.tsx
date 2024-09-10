import * as React from 'react';
import {FileExplorerAnyPluginSignature, FileExplorerPublicAPI} from '../internals/models';
import {FileExplorerPluginSignatures} from '../FileExplorer/FileExplorer.plugins';

/**
 * Hook that instantiates a [[FileExplorerApiRef]].
 */
export const useFileExplorerApiRef = <
  TSignatures extends readonly FileExplorerAnyPluginSignature[] = FileExplorerPluginSignatures,
>() =>
  React.useRef(undefined) as React.MutableRefObject<FileExplorerPublicAPI<TSignatures> | undefined>;
