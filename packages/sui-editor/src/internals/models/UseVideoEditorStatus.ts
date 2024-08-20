import { DndState } from "./videoEditor";

export interface UseVideoEditorStatus {
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
