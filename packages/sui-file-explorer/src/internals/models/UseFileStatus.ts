import { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { DndState } from "./fileExplorerView";

export interface UseFileStatus {
  expandable: boolean;
  expanded: boolean;
  focused: boolean;
  selected: boolean;
  disabled: boolean;
  visibleIndex: number;
  grid: boolean;
  dndState: DndState;
  dndContainer: any;
  dndInstruction: Instruction | null;
}
