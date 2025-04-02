import {DropIndicator} from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/tree-item";
import {
  attachInstruction, extractInstruction
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import * as React from "react";

export type TFileListItemContext = {
  DropIndicator: typeof DropIndicator;
  attachInstruction: typeof attachInstruction;
  extractInstruction: typeof extractInstruction;
};

export const FileExplorerDndItemContext = React.createContext<TFileListItemContext>({
  DropIndicator,
  attachInstruction,
  extractInstruction,
});

