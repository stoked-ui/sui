/**
 * @namespace UseFileExplorerGridHeaders
 * @description Provides functionality for creating a grid headers component in a file explorer.
 */

export interface UseFileExplorerGridHeadersParameters {
  /**
   * The id attribute of the item. If not provided, it will be generated.
   */
  id: string;
  /**
   * If `true`, the item is disabled.
   * @default false
   */
  visible?: boolean;

  rootRef?: React.Ref<HTMLDivElement>;
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
}

export interface UseFileExplorerGridHeadersRootSlotOwnProps {
  role: 'file-explorer-view-grid-headers';
  id: string;
  ref: React.RefCallback<HTMLDivElement>;
  /**
   * Only defined when the `indentationAtItemLevel` experimental feature is enabled.
   */
  style?: React.CSSProperties;
}

export type UseFileExplorerGridHeadersRootSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersRootSlotOwnProps;

/**
 * @description Options for the group transition slot props.
 */
export interface UseFileExplorerGridHeadersGroupTransitionSlotOwnProps {
  unmountOnExit: boolean;
  in: boolean;
  component: 'div';
  role: 'group';
  children: React.ReactNode;
  /**
   * Only defined when the `indentationAtItemLevel` experimental feature is enabled.
   */
  indentationAtItemLevel?: true;
}

export type UseFileExplorerGridHeadersGroupTransitionSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersGroupTransitionSlotOwnProps;

/**
 * @description Props returned by the useFileExplorerGridHeaders hook.
 * @param TSignatures The types of signatures to expect from plugins.
 * @param TOptionalSignatures Optional signatures for plugin options.
 */
export interface UseFileExplorerGridHeadersReturnValue<
  TSignatures extends UseFileMinimalPlugins = UseFileMinimalPlugins,
  TOptionalSignatures extends FileExplorerAnyPluginSignature[] = [],
> {
  /**
   * Resolver for the root slot's props.
   * @param {ExternalProps} externalProps Additional props for the root slot
   * @returns {UseFileExplorerGridHeadersRootSlotProps<ExternalProps>} Props that should be spread
   *   on the root slot
   */
  getRootProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileExplorerGridHeadersRootSlotProps<ExternalProps>;

  /**
   * The instance of FileExplorer.
   */
  instance: FileExplorerInstance<TSignatures, TOptionalSignatures>;

  /**
   * The public API for the file explorer view manipulation.
   */
  publicAPI: FileExplorerPublicAPI<TSignatures, TOptionalSignatures>;
}