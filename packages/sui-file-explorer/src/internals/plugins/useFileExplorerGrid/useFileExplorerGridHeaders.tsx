/**
 * @module useFileExplorerGridHeaders
 *
 * The `useFileExplorerGridHeaders` hook is used to manage the grid headers of a file explorer.
 *
 * It returns an object with three properties:
 *   - `getRootProps`: A function that returns the root slot props for the grid headers.
 *   - `publicAPI`: An object that provides access to the public API of the file explorer.
 *   - `instance`: The instance of the file explorer.
 */

export const useFileExplorerGridHeaders = <
  TSignatures extends UseFileMinimalPlugins,
  TOptionalSignatures extends FileExplorerAnyPluginSignature[] = [],
>(
  /**
   * @param parameters
   *   An object containing the following properties:
   *     - `id`: The ID of the grid headers.
   *     - `rootRef`: A reference to the root element of the grid headers.
   */
  parameters: UseFileExplorerGridHeadersParameters,
): UseFileExplorerGridHeadersReturnValue<TSignatures, TOptionalSignatures> => {
  const {
    instance,
    publicAPI
  } = useFileExplorerContext<TSignatures, TOptionalSignatures>();

  /**
   * The hook root reference.
   */
  const { id,  rootRef } = parameters;
  const hookRootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkRef(rootRef, hookRootRef)!;

  /**
   * Returns the root slot props for the grid headers.
   *
   * @param externalProps
   *   An object containing additional props to be merged with the default props.
   */
  const getRootProps = <ExternalProps extends Record<string, any> = {}>(
    externalProps: ExternalProps = {} as ExternalProps,
  ): UseFileExplorerGridHeadersRootSlotProps<ExternalProps> => {
    /**
     * The event handlers for the grid headers.
     */
    const externalEventHandlers = {
      ...extractEventHandlers(parameters),
      ...extractEventHandlers(externalProps),
    };

    /**
     * The response object containing the root slot props.
     */
    const response: UseFileExplorerGridHeadersRootSlotProps<ExternalProps> = {
      ...externalEventHandlers,
      ref: handleRootRef,
      role: 'file-explorer-view-grid-headers',
      id,
      ...externalProps,
    };

    return response;
  };

  /**
   * The hook returns an object with three properties.
   */
  return {
    getRootProps,
    publicAPI,
    instance
  };
};