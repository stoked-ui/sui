/**
 * Interface for the slots available in EditorView component.
 */
export interface EditorViewSlots {
  /**
   * Element rendered at the root.
   * @default EditorViewRoot
   */
  root?: React.ElementType;
  renderer?: React.ElementType;
  preview?: React.ElementType;
}

/**
 * Interface for the slot props in EditorView component.
 */
export interface EditorViewSlotProps<R extends IMediaFile, Multiple extends boolean | undefined> {
  root?: SlotComponentProps<'div', {}, EditorViewProps<R, Multiple>>;
  renderer?: SlotComponentProps<'canvas', {}, {}>;
  preview?: SlotComponentProps<'div', {}, {}>;
}

/**
 * Base interface for EditorView component props.
 */
export interface EditorViewPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<EditorViewClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
}

/**
 * Interface for EditorView component props.
 */
export interface EditorViewProps<R extends IMediaFile, Multiple extends boolean | undefined>
  extends EditorViewPropsBase {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: EditorViewSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: EditorViewSlotProps<R, Multiple>;

  children?: React.ReactNode;

  viewButtons?: React.ReactElement[];
  viewButtonAppear?: number;
  viewButtonEnter?: number;
  viewButtonExit?: number;

  editorId: string;
}
