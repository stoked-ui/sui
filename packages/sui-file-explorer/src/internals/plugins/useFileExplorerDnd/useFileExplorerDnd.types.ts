/**
 * This file exports various types and interfaces related to the File Explorer DnD plugin.
 */

import type {BaseEventPayload, DragLocation} from "@atlaskit/pragmatic-drag-and-drop/types";
import type {Instruction} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { FileBase } from "../../../models";
import {DndState} from '../../models/fileExplorerView';
import {FileExplorerPluginSignature} from "../../models/plugin.types";
import {FileExplorerDndContextValue} from "./FileExplorerDndContext";
import type {
  UseFileExplorerFilesSignature
} from "../useFileExplorerFiles/useFileExplorerFiles.types";

/**
 * Represents the state of a DnD item.
 */
export type DndItemState = {
  /**
   * The current state of the DnD.
   */
  dndState: DndState,
  /**
   * The container element for the DnD.
   */
  dndContainer: HTMLElement | null,
  /**
   * The instruction object for the DnD.
   */
  dndInstruction: any | null
}

/**
 * Represents a payload for an Element Drag event.
 */
export type ElementDragPayload = {
  /**
   * The element being dragged.
   */
  element: HTMLElement ,
  /**
   * The drag handle element.
   */
  dragHandle: Element | null,
  /**
   * Additional data associated with the drag.
   */
  data: Record<string, unknown>
}

/**
 * Represents a type for an Element Drag event.
 */
export type ElementDragType = {
  /**
   * The type of the drag.
   */
  type: 'element';
  /**
   * The origin of the drag.
   */
  startedFrom: 'internal';
  /**
   * The payload associated with the drag.
   */
  payload: ElementDragPayload;
}

/**
 * Represents data for an internal drop operation.
 */
export type DropInternalData = {
  /**
   * Data about the dropped item.
   */
  dropped: {
    /**
     * The file being dropped.
     */
    item: FileBase;
    /**
     * The drag payload associated with the dropped item.
     */
    dnd: ElementDragPayload;
  },
  /**
   * Data about the target of the drop operation.
   */
  target: {
    /**
     * The file being targeted.
     */
    item: FileBase;
    /**
     * The drag location associated with the target.
     */
    dnd: DragLocation;
  },
  /**
   * The instruction object for the drop operation.
   */
  instruction: Instruction;
}

/**
 * Represents a mode for a DnD trash operation.
 */
export type DndTrashMode = 'remove' | 'collect-remove-restore' | 'collect-restore' | 'collect';

/**
 * Interface for the instance of the UseFileListItems hook.
 */
export interface UseFileListItemsInstance {
  /**
   * A function that returns the configuration for the DnD plugin.
   */
  dndConfig: () => {
    /**
     * Whether the internal DnD is enabled.
     */
    dndInternal?: true;
    /**
     * Whether the external DnD is enabled.
     */
    dndExternal?: true;
    /**
     * An array of file types for the DnD plugin to handle.
     */
    dndFileTypes?: string[];
    /**
     * Whether the trash feature is enabled.
     */
    dndTrash?: true;
  } | undefined;
  /**
   * A function that returns whether the DnD is enabled.
   */
  dndEnabled: () => boolean;
  /**
   * A function that returns whether the internal DnD is enabled.
   */
  dndInternalEnabled: () => boolean;
  /**
   * A function that returns whether the external DnD is enabled.
   */
  dndExternalEnabled: () => boolean;
  /**
   * A function that returns an array of file types for the external DnD plugin to handle.
   */
  dndExternalFileTypes: () =>  string[];
  /**
   * A function that returns whether the trash feature is enabled.
   */
  dndTrash: () => true | undefined;
  /**
   * A function that returns the context value for the DnD plugin.
   */
  getDndContext: FileExplorerDndContextValue<FileBase>
  /**
   * A function that handles an internal drag event.
   */
  dropInternal: (event: BaseEventPayload<ElementDragType>) => void;
  /**
   * A function that creates children for a list of files.
   */
  createChildren: (files: FileBase[], targetId: string | null) => void;
  /**
   * A function that creates a child item for a file.
   */
  createChild: (item: FileBase, targetId: string | null) => void;
  /**
   * A function that removes an item from the list.
   */
  removeItem: (id: string) => void;
}

/**
 * Interface for the parameters of the UseFileExplorerDnd hook.
 */
export interface UseFileExplorerDndParameters {
  /**
   * Whether the internal DnD is enabled.
   */
  dndInternal?: true;
  /**
   * Whether the external DnD is enabled.
   */
  dndExternal?: true;
  /**
   * An array of file types for the DnD plugin to handle.
   */
  dndFileTypes?: string[];
  /**
   * Whether the trash feature is enabled.
   */
  dndTrash?: true;
}

/**
 * Interface for the signature of the UseFileExplorerFiles hook.
 */
export type UseFileExplorerFilesSignature = {
  // ...
}