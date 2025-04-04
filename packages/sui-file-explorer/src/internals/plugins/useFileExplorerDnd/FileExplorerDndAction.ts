/**
 * FileExplorerDndAction represents a drag-and-drop action in the file explorer.
 *
 * @template R
 */
export type FileExplorerDndAction<R extends FileBase> =
  /**
   * Instruction action to move an item from one location to another.
   */
  | {
    /**
     * The type of action.
     */
    type: 'instruction';
    /**
     * The instruction being executed.
     */
    instruction: Instruction;
    /**
     * A unique identifier for the action.
     */
    id: string;
    /**
     * The ID of the target location.
     */
    targetId: string;
  } |
  /**
   * Create a new child item and add it to the list.
   */
  | {
    type: 'create-child';
    /**
     * A unique identifier for the action.
     */
    id: string;
    /**
     * The file being created as a new child item.
     */
    item: R;
    /**
     * The ID of the target location, or null if it's not applicable.
     */
    targetId: string | null;
  } |
  /**
   * Create multiple child items and add them to the list.
   */
  | {
    type: 'create-children';
    /**
     * An array of files being created as new child items.
     */
    items: R[];
    /**
     * A unique identifier for the action.
     */
    id: string;
    /**
     * The ID of the target location, or null if it's not applicable.
     */
    targetId: string | null;
  } |
  /**
   * Update the state of the list with new items.
   */
  | {
    type: 'set-state';
    /**
     * An array of files to update the state with.
     */
    items: R[];
  } |
  /**
   * Remove an item from the list.
   */
  | {
    type: 'remove';
    /**
     * A unique identifier for the action.
     */
    id: string;
  }