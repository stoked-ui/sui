/**
 * @typedef {import('@mui/base/utils').EventHandlers} EventHandlers
 * @typedef {import('./helpers').MergeSignaturesProperty} MergeSignaturesProperty
 * @typedef {import('./helpers').OptionalIfEmpty} OptionalIfEmpty
 * @typedef {import('../corePlugins').FileExplorerCorePluginSignatures} FileExplorerCorePluginSignatures
 * @typedef {import('../../models').FileId} FileId
 * @typedef {import('./UseFileStatus').UseFileStatus} UseFileStatus
 * @typedef {import("../../File/File.types").FileProps} FileProps
 * @typedef {import('./plugin.types').FileExplorerAnyPluginSignature} FileExplorerAnyPluginSignature
 */

/**
 * Represents the options for a File Explorer plugin.
 * @template TSignature
 * @property {FileExplorerUsedInstance<TSignature>} instance - The instance of the File Explorer.
 * @property {FileExplorerUsedDefaultizedParams<TSignature>} params - The defaultized parameters.
 * @property {FileExplorerUsedState<TSignature>} state - The state of the File Explorer.
 * @property {TSignature['slots']} slots - The slots of the File Explorer.
 * @property {TSignature['slotProps']} slotProps - The slot props of the File Explorer.
 * @property {FileExplorerUsedExperimentalFeatures<TSignature>} experimentalFeatures - The experimental features used.
 * @property {FileExplorerUsedModels<TSignature>} models - The models used in the File Explorer.
 * @property {React.Dispatch<React.SetStateAction<FileExplorerUsedState<TSignature>>} setState - The state setter function.
 * @property {React.RefObject<HTMLUListElement>} rootRef - The reference to the root element.
 */
export interface FileExplorerPluginOptions<TSignature extends FileExplorerAnyPluginSignature> {
  instance: FileExplorerUsedInstance<TSignature>;
  params: FileExplorerUsedDefaultizedParams<TSignature>;
  state: FileExplorerUsedState<TSignature>;
  slots: TSignature['slots'];
  slotProps: TSignature['slotProps'];
  experimentalFeatures: FileExplorerUsedExperimentalFeatures<TSignature>;
  models: FileExplorerUsedModels<TSignature>;
  setState: React.Dispatch<React.SetStateAction<FileExplorerUsedState<TSignature>>>;
  rootRef: React.RefObject<HTMLUListElement>;
}

/**
 * Represents the response of a File Explorer.
 * @template TSignature
 * @returns {JSX.Element} The root props.
 */
type FileExplorerResponse<TSignature extends FileExplorerAnyPluginSignature> = {
  getRootProps?: <TOther extends EventHandlers = {}>(
    otherHandlers: TOther,
  ) => React.HTMLAttributes<HTMLUListElement>;
} & OptionalIfEmpty<'publicAPI', TSignature['publicAPI']> &
  OptionalIfEmpty<'instance', TSignature['instance']> &
  OptionalIfEmpty<'contextValue', TSignature['contextValue']>;


/**
 * Represents the required plugins for a File Explorer.
 * @template TSignature
 */
type FileExplorerRequiredPlugins<TSignature extends FileExplorerAnyPluginSignature> = [
  ...FileExplorerCorePluginSignatures,
  ...TSignature['dependencies'],
];

/**
 * Represents a property of a plugin with its dependencies.
 * @template TSignature
 * @template TProperty
 */
type PluginPropertyWithDependencies<
  TSignature extends FileExplorerAnyPluginSignature,
  TProperty extends keyof FileExplorerAnyPluginSignature,
> = TSignature[TProperty] &
  MergeSignaturesProperty<FileExplorerRequiredPlugins<TSignature>, TProperty> &
  Partial<MergeSignaturesProperty<TSignature['optionalDependencies'], TProperty>>;

/**
 * Represents the parameters used in a File Explorer plugin.
 * @template TSignature
 */
export type FileExplorerUsedParams<TSignature extends FileExplorerAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'params'>;

/**
 * Represents the defaultized parameters used in a File Explorer plugin.
 * @template TSignature
 */
type FileExplorerUsedDefaultizedParams<TSignature extends FileExplorerAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'defaultizedParams'>;

/**
 * Represents the instance used in a File Explorer plugin.
 * @template TSignature
 */
export type FileExplorerUsedInstance<TSignature extends FileExplorerAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'instance'> & {
    /**
     * Private property only defined in TypeScript to be able to access the plugin signature from
     * the instance object.
     */
    $$signature: TSignature;
  };

/**
 * Represents the state used in a File Explorer plugin.
 * @template TSignature
 */
type FileExplorerUsedState<TSignature extends FileExplorerAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'state'>;

/**
 * Represents the experimental features used in a File Explorer plugin.
 * @template TSignature
 */
type FileExplorerUsedExperimentalFeatures<TSignature extends FileExplorerAnyPluginSignature> =
  FileExplorerExperimentalFeatures<[TSignature, ...TSignature['dependencies']]>;

/**
 * Represents the models used in a File Explorer plugin.
 * @template TSignature
 */
type FileExplorerUsedModels<TSignature extends FileExplorerAnyPluginSignature> =
  TSignature['models'] &
    RemoveSetValue<MergeSignaturesProperty<FileExplorerRequiredPlugins<TSignature>, 'models'>>;

/**
 * Represents the events used in a File Explorer plugin.
 * @template TSignature
 */
export type FileExplorerUsedEvents<TSignature extends FileExplorerAnyPluginSignature> =
  TSignature['events'] & MergeSignaturesProperty<FileExplorerRequiredPlugins<TSignature>, 'events'>;

/**
 * Represents the options for a File Plugin.
 * @template TSignatures
 * @template TProps
 */
export interface FilePluginOptions<TSignatures extends FileExplorerAnyPluginSignature[] = UseMinimalPlugins, TProps extends {} = FileMeta & FileProps> extends FilePluginResponse {
  props: TProps;
  instance: FileExplorerInstance<TSignatures>;
}

/**
 * Represents the response of a File Plugin.
 */
export interface FilePluginResponse {
  /**
   * Root of the `content` slot enriched by the plugin.
   */
  contentRef?: React.RefCallback<HTMLElement> | null;
  /**
   * Ref of the `root` slot enriched by the plugin
   */
  rootRef?: React.RefCallback<HTMLLIElement> | null;

  status?: UseFileStatus | null;
}

/**
 * Represents a File Plugin.
 * @template TSignatures
 * @template TProps
 */
export type FilePlugin<TSignatures extends FileExplorerAnyPluginSignature[] = UseMinimalPlugins, TProps extends {} = FileMeta & FileProps> = (
  options: FilePluginOptions<TSignatures, TProps>,
) => void | FilePluginResponse;

/**
 * Represents a wrapper for a File.
 * @template TSignatures
 */
export type FileWrapper<TSignatures extends readonly FileExplorerAnyPluginSignature[]> = (params: {
  id: FileId;
  children: React.ReactNode;
  instance: FileExplorerInstance<TSignatures>;
}) => React.ReactNode;

/**
 * Represents a wrapper for a File Explorer Root.
 * @template TSignatures
 */
export type FileExplorerRootWrapper<TSignatures extends readonly FileExplorerAnyPluginSignature[]> = (params: {
  children: React.ReactNode;
  instance: FileExplorerInstance<TSignatures>;
}) => React.ReactNode;

/**
 * Represents a File Explorer Plugin.
 * @template TSignature
 */
export type FileExplorerPlugin<TSignature extends FileExplorerAnyPluginSignature> = {
  /**
   * Function to create a File Explorer Plugin.
   * @param {FileExplorerPluginOptions<TSignature>} options - The options for the plugin.
   * @returns {FileExplorerResponse<TSignature>} The response from the plugin.
   */
  (options: FileExplorerPluginOptions<TSignature>): FileExplorerResponse<TSignature>;
  getDefaultizedParams?: (
    params: FileExplorerUsedParams<TSignature>,
  ) => TSignature['defaultizedParams'];
  getInitialState?: (params: FileExplorerUsedDefaultizedParams<TSignature>) => TSignature['state'];
  models?: FileExplorerModelsInitializer<TSignature>;
  params: Record<keyof TSignature['params'], true>;
  itemPlugin?: FilePlugin<any[], any>;
  /**
   * Render function used to add React wrappers around the File.
   * @param {{ nodeId: FileId; children: React.ReactNode; }} params The params of the item.
   * @returns {React.ReactNode} The wrapped item.
   */
  wrapItem?: FileWrapper<[TSignature, ...TSignature['dependencies']]>;
  /**
   * Render function used to add React wrappers around the FileExplorer.
   * @param {{ children: React.ReactNode; }} params The params of the root.
   * @returns {React.ReactNode} The wrapped root.
   */
  wrapRoot?: FileExplorerRootWrapper<[TSignature, ...TSignature['dependencies']]>;
};