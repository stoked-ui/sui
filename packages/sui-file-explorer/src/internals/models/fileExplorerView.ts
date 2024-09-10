import {Instruction} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import type {FileExplorerAnyPluginSignature} from './plugin.types';
import type {MergeSignaturesProperty} from './helpers';
import type {FileExplorerCorePluginSignatures} from '../corePlugins';

export type DndState = 'idle' | 'dragging' | 'preview' | 'parent-of-instruction';

export interface FileMeta {
  id: string;
  idAttribute: string | undefined;
  parentId: string | null;
  expandable: boolean;
  disabled: boolean;
  /**
   * Only defined for `FileExplorer` and `FileExplorerPro`.
   */
  depth?: number;
  /**
   * Only defined for `FileExplorer` and `FileExplorerPro`.
   */
  label?: string;
  dndInstruction: Instruction | null;
  dndState: DndState;
  dndContainer: HTMLElement | null;
}

export interface FileExplorerModel<TValue> {
  name: string;
  value: TValue;
  setControlledValue: (value: TValue | ((prevValue: TValue) => TValue)) => void;
}

export type FileExplorerInstance<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TOptionalSignatures extends readonly FileExplorerAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...FileExplorerCorePluginSignatures, ...TSignatures], 'instance'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'instance'>>;

export type FileExplorerPublicAPI<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TOptionalSignatures extends readonly FileExplorerAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...FileExplorerCorePluginSignatures, ...TSignatures], 'publicAPI'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'instance'>>;

export type FileExplorerExperimentalFeatures<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TOptionalSignatures extends readonly FileExplorerAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...TSignatures, ...TOptionalSignatures], 'experimentalFeatures'>;
