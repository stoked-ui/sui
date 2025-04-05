/** 
 * Represents the state of drag and drop functionality.
 */
export type DndState = 'idle' | 'dragging' | 'preview' | 'parent-of-instruction';

/**
 * Represents the metadata of a file in the file explorer.
 */
export interface FileMeta {
  id: string;
  parentId: string | null;
  expandable: boolean;
  disabled: boolean;
  /**
   * Depth of the file in the file explorer.
   * Only defined for `FileExplorer` and `FileExplorerPro`.
   */
  depth?: number;
  /**
   * Name of the file.
   * Only defined for `FileExplorer` and `FileExplorerPro`.
   */
  name?: string;
  dndInstruction: Instruction | null;
  dndState: DndState;
  dndContainer: HTMLElement | null;
  visibleIndex: number;
}

/**
 * Represents the model of a file explorer with a generic value type.
 */
export interface FileExplorerModel<TValue> {
  name: string;
  value: TValue;
  /**
   * Function to set controlled value.
   * @param {TValue | ((prevValue: TValue) => TValue)} value - The new value or a function to update the value.
   */
  setControlledValue: (value: TValue | ((prevValue: TValue) => TValue)) => void;
}

/**
 * Represents an instance of a file explorer with specified plugin signatures.
 */
export type FileExplorerInstance<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TOptionalSignatures extends readonly FileExplorerAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...FileExplorerCorePluginSignatures, ...TSignatures], 'instance'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'instance'>>;

/**
 * Represents the public API of a file explorer with specified plugin signatures.
 */
export type FileExplorerPublicAPI<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TOptionalSignatures extends readonly FileExplorerAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...FileExplorerCorePluginSignatures, ...TSignatures], 'publicAPI'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'instance'>>;

/**
 * Represents the experimental features of a file explorer with specified plugin signatures.
 */
export type FileExplorerExperimentalFeatures<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TOptionalSignatures extends readonly FileExplorerAnyPluginSignature[] = [],
> = MergeSignaturesProperty<[...TSignatures, ...TOptionalSignatures], 'experimentalFeatures'>;