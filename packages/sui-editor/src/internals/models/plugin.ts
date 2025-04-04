/**
 * The EditorPluginOptions interface defines the options that can be passed to an editor plugin.
 *
 * @template TSignature The type of the plugin signature, which extends EditorAnyPluginSignature.
 */
export interface EditorPluginOptions<TSignature extends EditorAnyPluginSignature> {
  /**
   * The instance of the plugin, which is used to access the plugin's internal state and methods.
   */
  instance: EditorUsedInstance<TSignature>;

  /**
   * The parameters that are passed to the editor plugin, which include defaultized values for some properties.
   */
  params: EditorUsedDefaultizedParams<TSignature>;

  /**
   * The current state of the editor plugin, which is updated by the plugins' methods.
   */
  state: EditorUsedState<TSignature>;

  /**
   * The slots that are used by the editor plugin, which include the slot props and content.
   */
  slots: TSignature['slots'];

  /**
   * The properties that can be passed to the slots, such as React element types.
   */
  slotProps: TSignature['slotProps'];

  /**
   * The experimental features that are enabled for this editor plugin.
   */
  experimentalFeatures: EditorUsedExperimentalFeatures<TSignature>;

  /**
   * The models that are used by the editor plugin, which include default values for some properties.
   */
  models: EditorUsedModels<TSignature>;

  /**
   * A function that updates the state of the editor plugin.
   */
  setState: React.Dispatch<React.SetStateAction<EditorUsedState<TSignature>>>;

  /**
   * The content slot enriched by the plugin, which is used to render the video player.
   */
  contentRef?: React.RefCallback<HTMLElement> | null;

  /**
   * The root slot enriched by the plugin, which is used to render the container for the video player.
   */
  rootRef?: React.RefCallback<HTMLDivElement> | null;
}

/**
 * The EditorPlugin interface defines the structure of an editor plugin, which includes its methods and properties.
 *
 * @template TSignature The type of the plugin signature, which extends EditorAnyPluginSignature.
 */
export type EditorPlugin<TSignature extends EditorAnyPluginSignature> = {
  /**
   * A function that returns the response from the editor plugin, which includes the enriched slots and state.
   */
  (options: EditorPluginOptions<TSignature>): EditorResponse<TSignature>;

  /**
   * An optional method that returns the defaultized parameters for some properties.
   *
   * @param params The used parameters.
   */
  getDefaultizedParams?: (
    params: EditorUsedDefaultizedParams<TSignature>,
  ) => TSignature['defaultizedParams'];

  /**
   * An optional method that returns the initial state of the editor plugin.
   *
   * @param params The used defaultized parameters.
   */
  getInitialState?: (params: EditorUsedDefaultizedParams<TSignature>) => TSignature['state'];

  /**
   * An optional property that defines the models for this editor plugin.
   */
  models?: EditorModelsInitializer<TSignature>;

  /**
   * A property that includes all properties of the plugin signature, excluding dependencies and optional dependencies.
   */
  params: Record<keyof TSignature['params'], true>;

  /**
   * An optional method that returns a video player item plugin, which is used to render the video player.
   *
   * @param options The video plugin options.
   */
  itemPlugin?: VideoPlugin<any>;
};