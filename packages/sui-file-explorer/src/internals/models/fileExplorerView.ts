import {Instruction} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import type {FileExplorerAnyPluginSignature} from './plugin.types';
import type {MergeSignaturesProperty} from './helpers';
import type {FileExplorerCorePluginSignatures} from '../corePlugins';

/**
 * Possible states of a DnD state
 */
export type DndState = 'idle' | 'dragging' | 'preview' | 'parent-of-instruction';

/**
 * Properties for FileMeta component
 */
export interface FileMeta {
  id: string;
  /**
   * Parent ID, null if root file
   */
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
  name?: string;
  dndInstruction: Instruction | null;
  dndState: DndState;
  dndContainer: HTMLElement | null;
  visibleIndex: number;
}

/**
 * Properties for FileExplorerModel component
 */
export interface FileExplorerModel<TValue> {
  /**
   * Name of the model
   */
  name: string;
  /**
   * Value associated with the model
   */
  value: TValue;
  /**
   * Function to update controlled value, returns new value or a function that takes current value as argument.
   */
  setControlledValue: (value: TValue | ((prevValue: TValue) => TValue)) => void;
}

/**
 * Type for FileExplorerInstance component
 */
export type FileExplorerInstance<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TOptionalSignatures extends readonly FileExplorerAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...FileExplorerCorePluginSignatures, ...TSignatures], 'instance'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'instance'>>;

/**
 * Type for FileExplorerPublicAPI component
 */
export type FileExplorerPublicAPI<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TOptionalSignatures extends readonly FileExplorerAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...FileExplorerCorePluginSignatures, ...TSignatures], 'publicAPI'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'instance'>>;

/**
 * Type for FileExplorerExperimentalFeatures component
 */
export type FileExplorerExperimentalFeatures<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TOptionalSignatures extends readonly FileExplorerAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...TSignatures, ...TOptionalSignatures], 'experimentalFeatures'>;