import type {Instruction} from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { FileBase} from "../../../models";

export type FileExplorerDndAction<R extends FileBase> =
  | {
  type: 'instruction';
  instruction: Instruction;
  id: string;
  targetId: string;
} | {
  type: 'create-child';
  id: string;
  item: R;
  targetId: string | null;
} | {
  type: 'create-children';
  items: R[];
  id: string;
  targetId: string | null;
} | {
  type: 'set-state';
  items: R[];
} | {
  type: 'remove';
  id: string;
}
