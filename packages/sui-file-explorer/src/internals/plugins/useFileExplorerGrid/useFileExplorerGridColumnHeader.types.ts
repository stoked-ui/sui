/**
 * Interface for defining parameters for UseFileExplorerGridHeaders
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
  /**
   * Reference to the root HTMLDivElement element.
   */
  rootRef?: React.Ref<HTMLDivElement>;
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
}

/**
 * Own props for the UseFileExplorerGridHeadersIconContainerSlot component
 */
export interface UseFileExplorerGridHeadersIconContainerSlotOwnProps {
  ref: React.RefObject<HTMLDivElement>;
  iconName?: 'collapseIcon' | 'expandIcon' | 'endIcon' | 'icon';
  sx?: SxProps;
}

/**
 * Props for the UseFileExplorerGridHeadersIconContainerSlot component
 */
export type UseFileExplorerGridHeadersIconContainerSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersIconContainerSlotOwnProps;

/**
 * Own props for the UseFileExplorerGridHeadersColumnSlot component
 */
export interface UseFileExplorerGridHeadersColumnSlotOwnProps {
  ref: React.RefObject<HTMLDivElement>;
}

/**
 * Props for the UseFileExplorerGridHeadersColumnSlot component
 */
export type UseFileExplorerGridHeadersColumnSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersColumnSlotOwnProps;

/**
 * Own props for the UseFileExplorerGridHeadersLabelSlot component
 */
export interface UseFileExplorerGridHeadersLabelSlotOwnProps {
  children: React.ReactNode;
}

/**
 * Props for the UseFileExplorerGridHeadersLabelSlot component
 */
export type UseFileExplorerGridHeadersLabelSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersLabelSlotOwnProps;

/**
 * Own props for the UseFileExplorerGridHeadersGroupTransitionSlot component
 */
export interface UseFileExplorerGridHeadersGroupTransitionSlotOwnProps {
  unmountOnExit: boolean;
  in?: boolean;
  component: 'div';
  role: 'group';
  children: React.ReactNode;
  /**
   * Only defined when the `indentationAtItemLevel` experimental feature is enabled.
   */
  indentationAtItemLevel?: true;
}

/**
 * Props for the UseFileExplorerGridHeadersGroupTransitionSlot component
 */
export type UseFileExplorerGridHeadersGroupTransitionSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersGroupTransitionSlotOwnProps;

/**
 * Return value interface for UseFileExplorerGridColumnHeader
 */
export interface UseFileExplorerGridColumnHeaderReturnValue<
  TSignatures extends UseFileMinimalPlugins = UseFileMinimalPlugins,
> {

  /**
   * Function to get column props.
   * @param {ExternalProps} externalProps Additional props for the column slot
   * @returns {UseFileExplorerGridHeadersColumnSlotProps<ExternalProps>} Props for the column slot
   */
  getColumnProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileExplorerGridHeadersColumnSlotProps<ExternalProps>;

  /**
   * Resolver for the label slot's props.
   * @param {ExternalProps} externalProps Additional props for the label slot
   * @returns {UseFileExplorerGridHeadersLabelSlotProps<ExternalProps>} Props for the label slot
   */
  getLabelProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileExplorerGridHeadersLabelSlotProps<ExternalProps>;

  /**
   * Resolver for the iconContainer slot's props.
   * @param {ExternalProps} externalProps Additional props for the iconContainer slot
   * @returns {UseFileExplorerGridHeadersIconContainerSlotProps<ExternalProps>} Props for the iconContainer slot
   */
  getIconContainerProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileExplorerGridHeadersIconContainerSlotProps<ExternalProps>;

  /**
   * Resolver for the GroupTransition slot's props.
   * @param {ExternalProps} externalProps Additional props for the GroupTransition slot
   * @returns {UseFileExplorerGridHeadersGroupTransitionSlotProps<ExternalProps>} Props for the GroupTransition slot
   */
  getGroupTransitionProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileExplorerGridHeadersGroupTransitionSlotProps<ExternalProps>;

  /**
   * A reference to the component's root DOM element.
   */
  instance: FileExplorerInstance<TSignatures>;
  status: UseFileExplorerGridColumnHeaderStatus | null;
}