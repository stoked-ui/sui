/**
 * Interface for defining parameters used in the UseFileExplorerGridHeaders hook.
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

/**
 * Interface for defining props specific to the root slot in UseFileExplorerGridHeaders.
 */
export interface UseFileExplorerGridHeadersRootSlotOwnProps {
  role: 'file-explorer-view-grid-headers';
  id: string;
  ref: React.RefCallback<HTMLDivElement>;
  /**
   * Only defined when the `indentationAtItemLevel` experimental feature is enabled.
   */
  style?: React.CSSProperties;
}

/**
 * Type for combining external props with UseFileExplorerGridHeadersRootSlotOwnProps.
 */
export type UseFileExplorerGridHeadersRootSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersRootSlotOwnProps;

/**
 * Interface for defining props specific to the group transition slot in UseFileExplorerGridHeaders.
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

/**
 * Type for combining external props with UseFileExplorerGridHeadersGroupTransitionSlotOwnProps.
 */
export type UseFileExplorerGridHeadersGroupTransitionSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersGroupTransitionSlotOwnProps;

/**
 * Interface for defining the return value of UseFileExplorerGridHeaders hook.
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

  instance: FileExplorerInstance<TSignatures, TOptionalSignatures>;

  /**
   * The object that allows FileExplorer View manipulation.
   */
  publicAPI: FileExplorerPublicAPI<TSignatures, TOptionalSignatures>;
}
