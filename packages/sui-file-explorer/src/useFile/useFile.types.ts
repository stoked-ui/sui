/**
 * Interface for defining parameters used in file-related operations.
 */
export interface UseFileParameters {
  /**
   * The id attribute of the item. If not provided, it will be generated.
   */
  id?: string;
  /**
   * If `true`, the item is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * The label of the item.
   */
  rootRef?: React.Ref<HTMLLIElement>;
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  mediaType?: MediaType;
  type?: string;
  size?: number;
  lastModified?: number;
  name?: string;
}

/**
 * Interface for defining properties of the root slot of a file item.
 */
export interface UseFileRootSlotOwnProps {
  role: 'fileexploreritem';
  tabIndex: 0 | -1;
  id: string;
  'aria-expanded': React.AriaAttributes['aria-expanded'];
  'aria-selected': React.AriaAttributes['aria-selected'];
  'aria-disabled': React.AriaAttributes['aria-disabled'];
  onFocus: MuiCancellableEventHandler<React.FocusEvent<HTMLElement>>;
  onBlur: MuiCancellableEventHandler<React.FocusEvent<HTMLElement>>;
  onKeyDown: MuiCancellableEventHandler<React.KeyboardEvent<HTMLElement>>;
  ref: React.RefCallback<HTMLLIElement>;
  /**
   * Only defined when the `indentationAtItemLevel` experimental feature is enabled.
   */
  style?: React.CSSProperties;
}

/**
 * Type for combining external props with own props for the root slot of a file item.
 */
export type UseFileRootSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileRootSlotOwnProps;

/**
 * Interface for defining properties of the content slot of a file item.
 */
export interface UseFileContentSlotOwnProps {
  onClick: MuiCancellableEventHandler<React.MouseEvent>;
  onMouseDown: MuiCancellableEventHandler<React.MouseEvent>;
  ref: React.RefCallback<HTMLDivElement> | null;
  status: UseFileStatus;
  /**
   * Only defined when the `indentationAtItemLevel` experimental feature is enabled.
   */
  indentationAtItemLevel?: true;
}

/**
 * Type for combining external props with own props for the content slot of a file item.
 */
export type UseFileContentSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileContentSlotOwnProps;

/**
 * Interface for defining properties of the icon container slot of a file item.
 */
export interface UseFileIconContainerSlotOwnProps {
  onClick: MuiCancellableEventHandler<React.MouseEvent>;
}

/**
 * Type for combining external props with own props for the icon container slot of a file item.
 */
export type UseFileIconContainerSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileIconContainerSlotOwnProps;

/**
 * Interface for defining properties of the label slot of a file item.
 */
export interface UseFileLabelSlotOwnProps {
  children: React.ReactNode;
}

/**
 * Type for combining external props with own props for the label slot of a file item.
 */
export type UseFileLabelSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileLabelSlotOwnProps;

/**
 * Interface for defining properties of the checkbox slot of a file item.
 */
export interface UseFileCheckboxSlotOwnProps {
  visible: boolean;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  disabled: boolean;
  ref: React.RefObject<HTMLButtonElement>;
  tabIndex: -1;
}

/**
 * Type for combining external props with own props for the checkbox slot of a file item.
 */
export type UseFileCheckboxSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileCheckboxSlotOwnProps;

/**
 * Interface for defining properties of the group transition slot of a file item.
 */
export interface UseFileGroupTransitionSlotOwnProps {
  unmountOnExit: boolean;
  in: boolean;
  component: 'ul';
  role: 'group';
  children: React.ReactNode;
  /**
   * Only defined when the `indentationAtItemLevel` experimental feature is enabled.
   */
  indentationAtItemLevel?: true;
}

/**
 * Type for combining external props with own props for the group transition slot of a file item.
 */
export type UseFileGroupTransitionSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileGroupTransitionSlotOwnProps;

/**
 * Interface for defining the return value of file-related operations.
 */
export interface UseFileReturnValue<
  TSignatures extends UseFileMinimalPlugins,
  TOptionalSignatures extends UseFileOptionalPlugins,
> {
  /**
   * Resolver for the root slot's props.
   * @param {ExternalProps} externalProps Additional props for the root slot
   * @returns {UseFileRootSlotProps<ExternalProps>} Props that should be spread on the root slot
   */
  getRootProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileRootSlotProps<ExternalProps>;
  /**
   * Resolver for the content slot's props.
   * @param {ExternalProps} externalProps Additional props for the content slot
   * @returns {UseFileContentSlotProps<ExternalProps>} Props that should be spread on the content slot
   */
  getContentProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileContentSlotProps<ExternalProps>;
  /**
   * Resolver for the label slot's props.
   * @param {ExternalProps} externalProps Additional props for the label slot
   * @returns {UseFileLabelSlotProps<ExternalProps>} Props that should be spread on the label slot
   */
  getLabelProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileLabelSlotProps<ExternalProps>;
  /**
   * Resolver for the checkbox slot's props.
   * @param {ExternalProps} externalProps Additional props for the checkbox slot
   * @returns {UseFileCheckboxSlotProps<ExternalProps>} Props that should be spread on the checkbox slot
   */
  getCheckboxProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileCheckboxSlotProps<ExternalProps>;
  /**
   * Resolver for the iconContainer slot's props.
   * @param {ExternalProps} externalProps Additional props for the iconContainer slot
   * @returns {UseFileIconContainerSlotProps<ExternalProps>} Props that should be spread on the iconContainer slot
   */
  getIconContainerProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileIconContainerSlotProps<ExternalProps>;
  /**
   * Resolver for the GroupTransition slot's props.
   * @param {ExternalProps} externalProps Additional props for the GroupTransition slot
   * @returns {UseFileGroupTransitionSlotProps<ExternalProps>} Props that should be spread on the GroupTransition slot
   */
  getGroupTransitionProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileGroupTransitionSlotProps<ExternalProps>;
  /**
   * A ref to the component's root DOM element.
   */
  rootRef: React.RefCallback<HTMLLIElement> | null;
  /**
   * Current status of the item.
   */
  status: UseFileStatus;
  /**
   * The object that allows FileExplorer View manipulation.
   */
  publicAPI: FileExplorerPublicAPI<TSignatures, TOptionalSignatures>;
}