import type {EditorAnyPluginSignature} from './plugin';
import type {MergeSignaturesProperty} from './helpers';
import type {EditorCorePluginSignatures} from '../corePlugins';

export type DndState = 'idle' | 'dragging' | 'preview' | 'parent-of-instruction';

export interface EditorMeta {
  id: string;
  idAttribute: string | undefined;
  parentId: string | null;
  expandable: boolean;
  disabled: boolean;
  /**
   * Only defined for `Editor` and `EditorPro`.
   */
  depth?: number;
  /**
   * Only defined for `Editor` and `EditorPro`.
   */
  label?: string;
}

export interface EditorModel<TValue> {
  name: string;
  value: TValue;
  setControlledValue: (value: TValue | ((prevValue: TValue) => TValue)) => void;
}

export type EditorInstance<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TOptionalSignatures extends readonly EditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...EditorCorePluginSignatures, ...TSignatures], 'instance'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'instance'>>;

export type EditorPublicAPI<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TOptionalSignatures extends readonly EditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...EditorCorePluginSignatures, ...TSignatures], 'publicAPI'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'instance'>>;

export type EditorExperimentalFeatures<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TOptionalSignatures extends readonly EditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...TSignatures, ...TOptionalSignatures], 'experimentalFeatures'>;
