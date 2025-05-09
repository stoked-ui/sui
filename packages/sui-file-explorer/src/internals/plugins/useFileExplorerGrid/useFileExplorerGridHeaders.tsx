/**
 * Custom hook for managing file explorer grid headers.
 * @description This hook provides functionality to manage grid headers in a file explorer.
 * @param {UseFileExplorerGridHeadersParameters} parameters - The parameters for the hook.
 * @returns {UseFileExplorerGridHeadersReturnValue<TSignatures, TOptionalSignatures>} The return object containing functions and values related to grid headers.
 */
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

  /**
   * Gets the root props for the grid headers.
   * @param {Record<string, any>} externalProps - External props for the grid headers.
   * @returns {UseFileExplorerGridHeadersRootSlotProps<ExternalProps>} The root slot props for the grid headers.
   */
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