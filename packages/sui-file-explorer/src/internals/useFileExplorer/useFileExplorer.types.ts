import * as React from 'react';
import {EventHandlers} from '@mui/base/utils';
import type {FileExplorerContextValue} from '../FileExplorerProvider';
import {
  ConvertSignaturesIntoPlugins,
  FileExplorerAnyPluginSignature,
  FileExplorerExperimentalFeatures,
  FileExplorerInstance,
  FileExplorerPublicAPI,
  MergeSignaturesProperty,
} from '../models';

export interface UseFileExplorerParameters<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TProps extends Partial<UseFileExplorerBaseProps<TSignatures>>,
> {
  plugins: ConvertSignaturesIntoPlugins<TSignatures>;
  rootRef?: React.Ref<HTMLUListElement> | undefined;
  props: TProps; // Omit<MergeSignaturesProperty<TSignatures, 'params'>, keyof UseFileExplorerBaseParameters<any>>
}

export interface UseFileExplorerBaseProps<TSignatures extends readonly FileExplorerAnyPluginSignature[]> {
  apiRef: React.MutableRefObject<FileExplorerPublicAPI<TSignatures> | undefined> | undefined;
  slots: MergeSignaturesProperty<TSignatures, 'slots'>;
  slotProps: MergeSignaturesProperty<TSignatures, 'slotProps'>;
  experimentalFeatures: FileExplorerExperimentalFeatures<TSignatures>;
}

export interface UseFileExplorerRootSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLUListElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref: React.Ref<HTMLUListElement>;
}

export interface UseFileExplorerReturnValue<TSignatures extends readonly FileExplorerAnyPluginSignature[]> {
  getRootProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseFileExplorerRootSlotProps;
  rootRef: React.RefCallback<HTMLUListElement> | null;
  contextValue: FileExplorerContextValue<TSignatures>;
  instance: FileExplorerInstance<TSignatures>;
}


