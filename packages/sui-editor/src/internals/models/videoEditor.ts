import type { VideoEditorAnyPluginSignature } from './plugin';
import type { MergeSignaturesProperty } from './helpers';
import type { VideoEditorCorePluginSignatures } from '../corePlugins';

export type DndState = 'idle' | 'dragging' | 'preview' | 'parent-of-instruction';

export interface VideoEditorMeta {
  id: string;
  idAttribute: string | undefined;
  parentId: string | null;
  expandable: boolean;
  disabled: boolean;
  /**
   * Only defined for `VideoEditor` and `VideoEditorPro`.
   */
  depth?: number;
  /**
   * Only defined for `VideoEditor` and `VideoEditorPro`.
   */
  label?: string;
}

export interface VideoEditorModel<TValue> {
  name: string;
  value: TValue;
  setControlledValue: (value: TValue | ((prevValue: TValue) => TValue)) => void;
}

export type VideoEditorInstance<
  TSignatures extends readonly VideoEditorAnyPluginSignature[],
  TOptionalSignatures extends readonly VideoEditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...VideoEditorCorePluginSignatures, ...TSignatures], 'instance'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'instance'>>;

export type VideoEditorPublicAPI<
  TSignatures extends readonly VideoEditorAnyPluginSignature[],
  TOptionalSignatures extends readonly VideoEditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...VideoEditorCorePluginSignatures, ...TSignatures], 'publicAPI'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'instance'>>;

export type VideoEditorExperimentalFeatures<
  TSignatures extends readonly VideoEditorAnyPluginSignature[],
  TOptionalSignatures extends readonly VideoEditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...TSignatures, ...TOptionalSignatures], 'experimentalFeatures'>;
