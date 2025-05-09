/**
 * Interface for file status properties used in file explorer view.
 */
export interface UseFileStatus {
  /**
   * Indicates if the file is expandable.
   */
  expandable: boolean;
  /**
   * Indicates if the file is expanded.
   */
  expanded: boolean;
  /**
   * Indicates if the file is focused.
   */
  focused: boolean;
  /**
   * Indicates if the file is selected.
   */
  selected: boolean;
  /**
   * Indicates if the file is disabled.
   */
  disabled: boolean;
  /**
   * The visible index of the file.
   */
  visibleIndex: number;
  /**
   * Indicates if the file is displayed in a grid.
   */
  grid: boolean;
  /**
   * The drag and drop state of the file.
   */
  dndState: DndState;
  /**
   * The drag and drop container of the file.
   */
  dndContainer: any;
  /**
   * The drag and drop instruction of the file.
   */
  dndInstruction: any;
}
