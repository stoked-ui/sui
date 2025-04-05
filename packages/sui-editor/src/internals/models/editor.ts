/**
 * Defines the possible states for drag and drop functionality.
 */
export type DndState = 'idle' | 'dragging' | 'preview' | 'parent-of-instruction';

/**
 * Represents metadata for the editor.
 */
export interface EditorMeta {
  id: string;
  idAttribute: string | undefined;
  parentId: string | null;
  expandable: boolean;
  disabled: boolean;
  /**
   * Depth of the editor.
   * Only defined for `Editor` and `EditorPro`.
   */
  depth?: number;
  /**
   * Label for the editor.
   * Only defined for `Editor` and `EditorPro`.
   */
  label?: string;
}

/**
 * Represents the model for the editor.
 */
export interface EditorModel<TValue> {
  name: string;
  value: TValue;
  /**
   * Sets the controlled value of the editor.
   * @param {TValue | ((prevValue: TValue) => TValue)} value - The new value or a function to update the value.
   */
  setControlledValue: (value: TValue | ((prevValue: TValue) => TValue)) => void;
}

/**
 * Represents the instance of the editor.
 */
export type EditorInstance<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TOptionalSignatures extends readonly EditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...EditorCorePluginSignatures, ...TSignatures], 'instance'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'instance'>>;

/**
 * Represents the public API of the editor.
 */
export type EditorPublicAPI<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TOptionalSignatures extends readonly EditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...EditorCorePluginSignatures, ...TSignatures], 'publicAPI'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'instance'>>;

/**
 * Represents experimental features of the editor.
 */
export type EditorExperimentalFeatures<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TOptionalSignatures extends readonly EditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...TSignatures, ...TOptionalSignatures], 'experimentalFeatures'>;
