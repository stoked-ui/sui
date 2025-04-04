import type {EditorAnyPluginSignature} from './plugin';
import type {MergeSignaturesProperty} from './helpers';
import type {EditorCorePluginSignatures} from '../corePlugins';

/**
 * Represents the state of a drag-and-drop operation in the editor.
 */
export type DndState = 'idle' | 'dragging' | 'preview' | 'parent-of-instruction';

/**
 * Metadata for an editor instance, containing its ID, parent ID, and other properties.
 */
export interface EditorMeta {
  /**
   * Unique identifier for the editor instance.
   */
  id: string;
  
  /**
   * Attribute to use as a unique identifier for the editor instance.
   */
  idAttribute: string | undefined;
  
  /**
   * The ID of the parent instruction, if applicable.
   */
  parentId: string | null;
  
  /**
   * Whether the editor is expandable or not.
   */
  expandable: boolean;
  
  /**
   * Whether the editor is disabled or not.
   */
  disabled: boolean;
  
  /**
   * The depth of the editor instance, only applicable for `Editor` and `EditorPro`.
   */
  depth?: number;
  
  /**
   * A label to display for the editor instance, only applicable for `Editor` and `EditorPro`.
   */
  label?: string;
}

/**
 * Represents a model for an editor instance, containing its name and value.
 */
export interface EditorModel<TValue> {
  /**
   * The name of the editor instance.
   */
  name: string;
  
  /**
   * The current value of the editor instance.
   */
  value: TValue;
  
  /**
   * Updates the controlled value of the editor instance.
   *
   * @param value - The new value to set, or a function that returns the new value.
   */
  setControlledValue: (value: TValue | ((prevValue: TValue) => TValue)) => void;
}

/**
 * Represents an instance of an editor plugin, combining the base plugin with additional properties.
 *
 * @template TSignatures - The types of signatures to include in the instance.
 * @template TOptionalSignatures - The optional signature types to include in the instance (defaults to []).
 */
export type EditorInstance<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TOptionalSignatures extends readonly EditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...EditorCorePluginSignatures, ...TSignatures], 'instance'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'instance'>>;

/**
 * Represents the public API of an editor plugin, combining the base plugin with additional properties.
 *
 * @template TSignatures - The types of signatures to include in the public API.
 * @template TOptionalSignatures - The optional signature types to include in the public API (defaults to []).
 */
export type EditorPublicAPI<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TOptionalSignatures extends readonly EditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...EditorCorePluginSignatures, ...TSignatures], 'publicAPI'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'instance'>>;

/**
 * Represents the experimental features of an editor plugin.
 *
 * @template TSignatures - The types of signatures to include in the experimental features.
 * @template TOptionalSignatures - The optional signature types to include in the experimental features (defaults to []).
 */
export type EditorExperimentalFeatures<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TOptionalSignatures extends readonly EditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...TSignatures, ...TOptionalSignatures], 'experimentalFeatures'>;