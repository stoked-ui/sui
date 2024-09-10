import {DndState} from "./editor";

export interface UseEditorStatus {
  expandable: boolean;
  expanded: boolean;
  focused: boolean;
  selected: boolean;
  disabled: boolean;
  visibleIndex: number;
  grid: boolean;
  dndState: DndState;
  dndContainer: any;
  dndInstruction: any;
}
