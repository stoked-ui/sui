/**
 * Defines the File component for rendering file items.
 */
export interface FileProps
  extends Omit<UseFileParameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement | HTMLDivElement>, 'onFocus'> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<FileClasses>;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: FileSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: FileSlotProps;
  /**
   * This prop isn't supported.
   * Use the `onItemFocus` callback on the tree if you need to monitor an item's focus.
   */
  onFocus?: null;
  /**
   * Callback fired when the item root is blurred.
   */
  onBlur?: MuiCancellableEventHandler<React.FocusEvent<HTMLLIElement | HTMLDivElement>>;
  /**
   * Callback fired when a key is pressed on the keyboard and the tree is in focus.
   */
  onKeyDown?: MuiCancellableEventHandler<React.KeyboardEvent<HTMLLIElement | HTMLDivElement>>;

  sx?: SxProps<Theme>;
}

/**
 * Represents the state of the File component owner.
 */
export interface FileOwnerState extends Omit<FileProps, 'disabled'>, UseFileStatus {}

/**
 * Represents the File component.
 * @param {FileProps & React.RefAttributes<HTMLLIElement>} props - The props for the File component.
 * @returns {JSX.Element} The rendered File component.
 */
export type FileComponent = ((
  props: FileProps & React.RefAttributes<HTMLLIElement>,
) => React.JSX.Element) & { propTypes?: any } & any;

/**
 * Represents the slots available for customization in the File component.
 */
export interface FileSlots extends FileIconSlots {
  /**
   * The component that renders the root.
   * @default FileRoot
   */
  root?: React.ElementType;
  /**
   * The component that renders the content of the item.
   * (e.g.: everything related to this item, not to its children).
   * @default FileContent
   */
  content?: React.ElementType;
  /**
   * The component that renders the children of the item.
   * @default FileGroupTransition
   */
  groupTransition?: React.ElementType;
  /**
   * The component that renders the icon.
   * @default FileIconContainer
   */
  iconContainer?: React.ElementType;
  /**
   * The component that renders the item checkbox for selection.
   * @default FileCheckbox
   */
  checkbox?: React.ElementType;
  /**
   * The component that renders the item label.
   * @default FileLabel
   */
  name?: React.ElementType;
}

/**
 * Represents the props available for the slots in the File component.
 */
export interface FileSlotProps extends FileIconSlotProps {
  root?: SlotComponentProps<'li' | 'div', {}, {}>;
  content?: SlotComponentProps<'div', {}, {}>;
  groupTransition?: SlotComponentProps<'div', {}, {}>;
  iconContainer?: SlotComponentProps<'div', {}, {}>;
  checkbox?: SlotComponentProps<'button', {}, {}>;
  name?: SlotComponentProps<'div', {}, {}>;
}