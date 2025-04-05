/**
 * Interface for Editor plugin options.
 * @template TSignature - Type of Editor plugin signature.
 */
export interface EditorPluginOptions<TSignature extends EditorAnyPluginSignature> {
  instance: EditorUsedInstance<TSignature>; // Editor instance.
  params: EditorUsedDefaultizedParams<TSignature>; // Defaultized params.
  state: EditorUsedState<TSignature>; // State of the Editor.
  slots: TSignature['slots']; // Slots available in the Editor.
  slotProps: TSignature['slotProps']; // Props for slots.
  experimentalFeatures: EditorUsedExperimentalFeatures<TSignature>; // Experimental features.
  models: EditorUsedModels<TSignature>; // Models used.
  setState: React.Dispatch<React.SetStateAction<EditorUsedState<TSignature>>>;
  rootRef: React.RefObject<HTMLDivElement>; // Reference to the root element.
  plugins: EditorPlugin<EditorAnyPluginSignature>[]; // List of Editor plugins.
}

/**
 * Type for initializing Editor models.
 * @template TSignature - Type of Editor plugin signature.
 */
type EditorModelsInitializer<TSignature extends EditorAnyPluginSignature> = {
  [TControlled in keyof TSignature['models']]: {
    getDefaultValue: (
      params: TSignature['defaultizedParams'],
    ) => Exclude<TSignature['defaultizedParams'][TControlled], undefined>;
  };
};

/**
 * Type for Editor responses.
 * @template TSignature - Type of Editor plugin signature.
 */
type EditorResponse<TSignature extends EditorAnyPluginSignature> = {
  getRootProps?: <TOther extends EventHandlers = {}>(
    otherHandlers: TOther,
  ) => React.HTMLAttributes<HTMLDivElement>;
} & OptionalIfEmpty<'publicAPI', TSignature['publicAPI']> &
  OptionalIfEmpty<'instance', TSignature['instance']> &
  OptionalIfEmpty<'contextValue', TSignature['contextValue']>;

/**
 * Type for Editor plugin signature.
 * @template T - Type defining various properties of Editor plugin.
 */
export type EditorPluginSignature<T extends {
  params?: {};
  defaultizedParams?: {};
  instance?: {};
  publicAPI?: {};
  events?: { [key in keyof T['events']]: EditorEventLookupElement };
  state?: {};
  contextValue?: {};
  slots?: { [key in keyof T['slots']]: React.ElementType };
  slotProps?: { [key in keyof T['slotProps']]: {} | (() => {}) };
  modelNames?: keyof T['defaultizedParams'];
  experimentalFeatures?: string;
  dependencies?: readonly EditorAnyPluginSignature[];
  optionalDependencies?: readonly EditorAnyPluginSignature[];
}> = {
  params: T extends { params: {} } ? T['params'] : {};
  defaultizedParams: T extends { defaultizedParams: {} } ? T['defaultizedParams'] : {};
  // Other properties of Editor plugin signature...
};

/**
 * Type for required Editor plugins.
 * @template TSignature - Type of Editor plugin signature.
 */
type EditorRequiredPlugins<TSignature extends EditorAnyPluginSignature> = [
  ...EditorCorePluginSignatures,
  ...TSignature['dependencies'],
];

/**
 * Editor plugin property with dependencies.
 * @template TSignature - Type of Editor plugin signature.
 * @template TProperty - Type of plugin property.
 */
type PluginPropertyWithDependencies<
  TSignature extends EditorAnyPluginSignature,
  TProperty extends keyof EditorAnyPluginSignature,
> = TSignature[TProperty] &
  MergeSignaturesProperty<EditorRequiredPlugins<TSignature>, TProperty> &
  Partial<MergeSignaturesProperty<TSignature['optionalDependencies'], TProperty>>;

/**
 * Type for Editor used params.
 * @template TSignature - Type of Editor plugin signature.
 */
export type EditorUsedParams<TSignature extends EditorAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'params'>;

/**
 * Type for Editor used defaultized params.
 * @template TSignature - Type of Editor plugin signature.
 */
type EditorUsedDefaultizedParams<TSignature extends EditorAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'defaultizedParams'>;

/**
 * Type for Editor used instance.
 * @template TSignature - Type of Editor plugin signature.
 */
export type EditorUsedInstance<TSignature extends EditorAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'instance'> & {
  /**
   * Private property only defined in TypeScript to be able to access the plugin signature from the
   * instance object.
   */
  $$signature: TSignature;
};

/**
 * Type for Editor used state.
 * @template TSignature - Type of Editor plugin signature.
 */
type EditorUsedState<TSignature extends EditorAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'state'>;

/**
 * Type for Editor used experimental features.
 * @template TSignature - Type of Editor plugin signature.
 */
type EditorUsedExperimentalFeatures<TSignature extends EditorAnyPluginSignature> =
  EditorExperimentalFeatures<[TSignature, ...TSignature['dependencies']]>;

/**
 * Type for removing 'setValue' from Editor models.
 * @template Models - Record of Editor models.
 */
type RemoveSetValue<Models extends Record<string, EditorModel<any>>> = {
  [K in keyof Models]: Omit<Models[K], 'setValue'>;
};

/**
 * Type for Editor used models.
 * @template TSignature - Type of Editor plugin signature.
 */
export type EditorUsedModels<TSignature extends EditorAnyPluginSignature> =
  TSignature['models'] &
  RemoveSetValue<MergeSignaturesProperty<EditorRequiredPlugins<TSignature>, 'models'>>;

/**
 * Type for Editor used events.
 * @template TSignature - Type of Editor plugin signature.
 */
export type EditorUsedEvents<TSignature extends EditorAnyPluginSignature> =
  TSignature['events'] & MergeSignaturesProperty<EditorRequiredPlugins<TSignature>, 'events'>;

/**
 * Interface for Video plugin options.
 * @template TProps - Type for Video plugin props.
 */
export interface VideoPluginOptions<TProps extends {}> extends VideoPluginResponse {
  props: TProps; // Props for the Video plugin.
}

/**
 * Interface for Video plugin response.
 */
export interface VideoPluginResponse {
  contentRef?: React.RefCallback<HTMLElement> | null; // Root of the 'content' slot.
  rootRef?: React.RefCallback<HTMLDivElement> | null; // Ref of the 'root' slot.
}

/**
 * Type for Video plugin.
 * @template TProps - Type for Video plugin props.
 */
export type VideoPlugin<TProps extends {}> = (
  options: VideoPluginOptions<TProps>,
) => VideoPluginResponse;

/**
 * Type for Editor plugin.
 * @template TSignature - Type of Editor plugin signature.
 */
export type EditorPlugin<TSignature extends EditorAnyPluginSignature> = {
  (options: EditorPluginOptions<TSignature>): EditorResponse<TSignature>; // Editor plugin function.
  getDefaultizedParams?: (
    params: EditorUsedParams<TSignature>,
  ) => TSignature['defaultizedParams']; // Get defaultized params.
  getInitialState?: (params: EditorUsedDefaultizedParams<TSignature>) => TSignature['state']; // Get initial state.
  models?: EditorModelsInitializer<TSignature>; // Editor models initializer.
  params: Record<keyof TSignature['params'], true>; // Parameters for Editor plugin.
  itemPlugin?: VideoPlugin<any>; // Item plugin for the Editor.
};