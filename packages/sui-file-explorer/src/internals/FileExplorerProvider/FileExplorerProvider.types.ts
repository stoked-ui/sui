import * as React from 'react';
import {
  FileExplorerAnyPluginSignature,
  FileExplorerInstance,
  FileExplorerPublicAPI,
  FileExplorerRootWrapper,
  FilePluginResponse,
  FileWrapper,
  MergeSignaturesProperty,
} from '../models';

export type FilePluginsRunner = <TProps extends {}>(
  props: TProps,
) => Required<FilePluginResponse>;

export type FileExplorerContextValue<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TOptionalSignatures extends readonly FileExplorerAnyPluginSignature[] = [],
> = MergeSignaturesProperty<TSignatures, 'contextValue'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'contextValue'>> & {
    instance: FileExplorerInstance<TSignatures, TOptionalSignatures>;
    publicAPI: FileExplorerPublicAPI<TSignatures, TOptionalSignatures>;
    rootRef: React.RefObject<HTMLUListElement>;
    wrapItem: FileWrapper<TSignatures>;
    wrapRoot: FileExplorerRootWrapper<TSignatures>;
    runItemPlugins: FilePluginsRunner;
  };

export interface FileExplorerProviderProps<TSignatures extends readonly FileExplorerAnyPluginSignature[]> {
  value: FileExplorerContextValue<TSignatures>;
  children: React.ReactNode;
}

