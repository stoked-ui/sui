import type {Instruction} from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { IMediaFile } from '@stoked-ui/media-selector';

export type FileExplorerDndAction<R extends IMediaFile> =
  | {
  type: 'instruction';
  instruction: Instruction;
  itemId: string;
  targetId: string;
} | {
  type: 'create-child';
  itemId: string;
  item: R;
  targetId: string | null;
} | {
  type: 'create-children';
  items: R[];
  itemId: string;
  targetId: string | null;
} | {
  type: 'set-state';
  items: R[];
} | {
  type: 'remove';
  itemId: string;
}
