/**
 * Defines the possible actions for file explorer drag and drop functionality.
 * @typedef {object} FileExplorerDndAction
 * @property {'instruction'} type - Indicates the action type as 'instruction'.
 * @property {Instruction} instruction - The instruction associated with the action.
 * @property {string} id - The ID of the action.
 * @property {string} targetId - The target ID of the action.
 * @typedef {object} R - Represents a generic type for file items.
 */

/**
 * Represents an action of type 'instruction' for file explorer drag and drop.
 * @typedef {object} InstructionAction
 * @property {'instruction'} type - Indicates the action type as 'instruction'.
 * @property {Instruction} instruction - The instruction associated with the action.
 * @property {string} id - The ID of the action.
 * @property {string} targetId - The target ID of the action.
 */

/**
 * Represents an action of type 'create-child' for file explorer drag and drop.
 * @typedef {object} CreateChildAction
 * @property {'create-child'} type - Indicates the action type as 'create-child'.
 * @property {string} id - The ID of the action.
 * @property {R} item - The file item to create.
 * @property {string | null} targetId - The target ID for the action.
 */

/**
 * Represents an action of type 'create-children' for file explorer drag and drop.
 * @typedef {object} CreateChildrenAction
 * @property {'create-children'} type - Indicates the action type as 'create-children'.
 * @property {R[]} items - The file items to create.
 * @property {string} id - The ID of the action.
 * @property {string | null} targetId - The target ID for the action.
 */

/**
 * Represents an action of type 'set-state' for file explorer drag and drop.
 * @typedef {object} SetStateAction
 * @property {'set-state'} type - Indicates the action type as 'set-state'.
 * @property {R[]} items - The file items to set state.
 */

/**
 * Represents an action of type 'remove' for file explorer drag and drop.
 * @typedef {object} RemoveAction
 * @property {'remove'} type - Indicates the action type as 'remove'.
 * @property {string} id - The ID of the action.
 */

import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { FileBase } from "../../../models";

/**
 * Represents a set of actions for file explorer drag and drop functionality.
 * @template R - Represents a generic type for file items.
 * @type {FileExplorerDndAction<R>}
 */
export type FileExplorerDndAction<R extends FileBase> =
  | InstructionAction
  | CreateChildAction
  | CreateChildrenAction
  | SetStateAction
  | RemoveAction;