/**
 * UseFileStatus Hook
 *
 * This hook provides an interface to access and manage the file status.
 *
 * @interface UseFileStatus
 */
export interface UseFileStatus {
  /**
   * Flag indicating whether the folder can be expanded or not
   */
  expandable: boolean;

  /**
   * Whether the folder is currently expanded or not
   */
  expanded: boolean;

  /**
   * Flag indicating whether a file has focus or not
   */
  focused: boolean;

  /**
   * Flag indicating whether a file is selected or not
   */
  selected: boolean;

  /**
   * Flag indicating whether the folder can be disabled or not
   */
  disabled: boolean;

  /**
   * Index of the visible file in the grid
   */
  visibleIndex: number;

  /**
   * Whether the dnd container is enabled or not
   */
  grid: boolean;

  /**
   * Current DndState object
   */
  dndState: DndState;

  /**
   * Container for drag and drop operations
   */
  dndContainer: any;

  /**
   * Instruction provided during drag and drop operations
   */
  dndInstruction: any;
}