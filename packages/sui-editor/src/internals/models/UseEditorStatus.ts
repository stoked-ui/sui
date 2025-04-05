/**
 * Interface for editor status used in the editor component.
 * @typedef {Object} UseEditorStatus
 * @property {boolean} expandable - Indicates if the editor is expandable.
 * @property {boolean} expanded - Indicates if the editor is expanded.
 * @property {boolean} focused - Indicates if the editor is focused.
 * @property {boolean} selected - Indicates if the editor is selected.
 * @property {boolean} disabled - Indicates if the editor is disabled.
 * @property {number} visibleIndex - The index of the editor in the visible list.
 * @property {boolean} grid - Indicates if the editor is in grid mode.
 * @property {DndState} dndState - The drag and drop state of the editor.
 * @property {any} dndContainer - The container for drag and drop functionality.
 * @property {any} dndInstruction - The drag and drop instruction for the editor.
 */ 

import { DndState } from "./editor";

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
