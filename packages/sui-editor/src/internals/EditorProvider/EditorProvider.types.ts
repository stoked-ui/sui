/**
 * Type definition for a function that runs video plugins
 * 
 * @typedef {function} VideoPluginsRunner
 * @param {object} props - The props object for the function
 * @returns {object} Required VideoPluginResponse object
 */
export type VideoPluginsRunner = <TProps extends {}>(
  props: TProps,
) => Required<VideoPluginResponse>;

/**
 * Interface for the editor context value
 * 
 * @typedef {object} EditorContextValue
 * @property {EditorInstance} instance - The editor instance
 * @property {EditorPublicAPI} publicAPI - The public API for the editor
 * @property {React.RefObject<HTMLDivElement>} rootRef - Reference to the root HTML div element
 * @property {VideoPluginsRunner} runItemPlugins - Function to run video plugins
 */
export type EditorContextValue<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TOptionalSignatures extends readonly EditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<TSignatures, 'contextValue'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'contextValue'>> & {
    instance: EditorInstance<TSignatures, TOptionalSignatures>;
    publicAPI: EditorPublicAPI<TSignatures, TOptionalSignatures>;
    rootRef: React.RefObject<HTMLDivElement>;
    runItemPlugins: VideoPluginsRunner;
  };

/**
 * Props interface for the EditorProvider component
 * 
 * @typedef {object} EditorProviderProps
 * @property {EditorContextValue} value - The value for the editor context
 * @property {React.ReactNode} children - The children components to be rendered
 */
export interface EditorProviderProps<TSignatures extends readonly EditorAnyPluginSignature[]> {
  value: EditorContextValue<TSignatures>;
  children: React.ReactNode;
}
