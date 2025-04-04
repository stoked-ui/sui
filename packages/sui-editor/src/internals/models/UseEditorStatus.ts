/**
 * UseEditorStatus interface defines the state of an editor component.
 *
 * @interface UseEditorStatus
 */
export interface UseEditorStatus {
  /**
   * Whether the editor is expandable.
   */
  expandable: boolean;

  /**
   * Whether the editor is expanded.
   */
  expanded: boolean;

  /**
   * Whether the editor is focused.
   */
  focused: boolean;

  /**
   * Whether the editor is selected.
   */
  selected: boolean;

  /**
   * Whether the editor is disabled.
   */
  disabled: boolean;

  /**
   * The current drag and drop state of the editor.
   */
  dndState: DndState;

  /**
   * The container used for dragging and dropping items.
   */
  dndContainer: any;

  /**
   * The instruction for dragging and dropping items.
   */
  dndInstruction: any;
}