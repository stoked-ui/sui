import {DropIndicator} from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/tree-item";
import {
  attachInstruction, extractInstruction
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import * as React from "react";

/**
 * Context for FileExplorer DnD item.
 *
 * Provides access to the DropIndicator, attachInstruction and extractInstruction
 * functions used in the file explorer drag and drop functionality.
 */
export type TFileListItemContext = {
  /**
   * The DropIndicator component.
   */
  DropIndicator: typeof DropIndicator;
  /**
   * The attachInstruction function.
   */
  attachInstruction: typeof attachInstruction;
  /**
   * The extractInstruction function.
   */
  extractInstruction: typeof extractInstruction;
};

/**
 * FileExplorer DndItemContext is a React Context that provides the necessary
 * functionality for the file explorer drag and drop component.
 *
 * It wraps around the DropIndicator, attachInstruction and extractInstruction
 * functions to create an easy-to-use API for handling the drag and drop events.
 */
export const FileExplorerDndItemContext = React.createContext<TFileListItemContext>({
  DropIndicator,
  attachInstruction,
  extractInstruction,
});