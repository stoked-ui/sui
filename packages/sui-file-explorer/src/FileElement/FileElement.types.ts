/**
 * Interface defining the slots available for FileElement component.
 */
export interface FileElementSlots {
  root?: React.ElementType;
  /**
   * The icon used to collapse the item.
   */
  collapseIcon?: React.ElementType;
  /**
   * The icon used to expand the item.
   */
  expandIcon?: React.ElementType;
  /**
   * The icon displayed next to an end item.
   */
  endIcon?: React.ElementType;
  /**
   * The icon to display next to the tree item's label.
   */
  icon?: React.ElementType;
  /**
   * The component that animates the appearance / disappearance of the item's children.
   * @default FileElement2Group
   */
  groupTransition?: React.ElementType;
}

/**
 * Type defining the props for each slot in FileElement component.
 */
export interface FileElementSlotProps {
  root?: SlotComponentProps<'div', {}, {}>;
  collapseIcon?: SlotComponentProps<'svg', {}, {}>;
  expandIcon?: SlotComponentProps<'svg', {}, {}>;
  endIcon?: SlotComponentProps<'svg', {}, {}>;
  icon?: SlotComponentProps<'svg', {}, {}>;
  groupTransition?: SlotComponentPropsFromProps<TransitionProps, {}, {}>;
}

/**
 * Props for the FileElement component.
 */
export interface FileElementProps
  extends Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<FileElementClasses>;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: FileElementSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: FileElementSlotProps;
  /**
   * The component used to render the content of the item.
   * @default TreeItemContent
   */
  ContentComponent?: React.JSXElementConstructor<FileElementContentProps>;
  /**
   * Props applied to ContentComponent.
   */
  ContentProps?: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> };
  /**
   * If `true`, the item is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * The tree item label.
   */
  name?: string;
  /**
   * The tree item label.
   */
  label?: React.ReactNode;
  /**
   * The id of the item.
   */
  id?: FileId;

  onFocus?: null;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  /**
   * Callback fired when a key of the keyboard is pressed on the item.
   */
  onKeyDown?: MuiCancellableEventHandler<React.KeyboardEvent<HTMLLIElement>>;
}

/**
 * State interface for FileElement component.
 */
export interface FileElementOwnerState extends FileElementProps {
  expanded: boolean;
  focused: boolean;
  selected: boolean;
  disabled: boolean;
  indentationAtItemLevel: boolean;
}

/**
 * Plugins required for FileElement component to work correctly.
 */
export type FileElementMinimalPlugins = readonly [
  UseFileExplorerIconsSignature,
  UseFileExplorerSelectionSignature,
  UseFileExplorerFilesSignature,
  UseFileExplorerFocusSignature,
  UseFileExplorerExpansionSignature,
  UseFileExplorerKeyboardNavigationSignature,
];

/**
 * Optional plugins that FileElement component can use if present.
 */
export type FileElementOptionalPlugins = readonly [];
*/