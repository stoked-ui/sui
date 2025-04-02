import * as React from 'react';
import {extractEventHandlers} from '@mui/base/utils';
import useForkRef from '@mui/utils/useForkRef';
import {
  UseFileExplorerGridHeadersParameters,
  UseFileExplorerGridHeadersReturnValue,
  UseFileExplorerGridHeadersRootSlotProps,
} from './useFileExplorerGridHeaders.types';
import {useFileExplorerContext} from '../../FileExplorerProvider/useFileExplorerContext';
import {FileExplorerAnyPluginSignature, UseFileMinimalPlugins,} from "../../models";

export const useFileExplorerGridHeaders = <
  TSignatures extends UseFileMinimalPlugins,
  TOptionalSignatures extends FileExplorerAnyPluginSignature[] = [],
>(
  parameters: UseFileExplorerGridHeadersParameters,
): UseFileExplorerGridHeadersReturnValue<TSignatures, TOptionalSignatures> => {
  const {
    instance,
    publicAPI
  } = useFileExplorerContext<TSignatures, TOptionalSignatures>();

  const { id,  rootRef } = parameters;
  const hookRootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkRef(rootRef, hookRootRef)!;

  const getRootProps = <ExternalProps extends Record<string, any> = {}>(
    externalProps: ExternalProps = {} as ExternalProps,
  ): UseFileExplorerGridHeadersRootSlotProps<ExternalProps> => {
    const externalEventHandlers = {
      ...extractEventHandlers(parameters),
      ...extractEventHandlers(externalProps),
    };

    const response: UseFileExplorerGridHeadersRootSlotProps<ExternalProps> = {
      ...externalEventHandlers,
      ref: handleRootRef,
      role: 'file-explorer-view-grid-headers',
      id,
      ...externalProps,
    };

    return response;
  };

  return {
    getRootProps,
    publicAPI,
    instance
  };
};

