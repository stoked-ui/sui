/**
 * Video Plugins Runner type definition
 * 
 * @description A function that takes props and returns a VideoPluginResponse object.
 * @param TProps - The type of the props object.
 * @returns Required<VideoPluginResponse> - The result of calling the video plugin runner with the provided props.
 */
export type VideoPluginsRunner = <TProps extends {}>(
  props: TProps,
) => Required<VideoPluginResponse>;

/**
 * EditorContextValue type definition
 * 
 * @description A value that represents the context of an editor, including instance, publicAPI, rootRef, and runItemPlugins.
 * @param TSignatures - The types of the signatures used in the editor context.
 * @param TOptionalSignatures - An optional array of signatures for the editor context.
 */
export type EditorContextValue<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TOptionalSignatures extends readonly EditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<TSignatures, 'contextValue'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'contextValue'>> & {
    /**
     * The instance of the editor.
     */
    instance: EditorInstance<TSignatures, TOptionalSignatures>;
    /**
     * The public API of the editor.
     */
    publicAPI: EditorPublicAPI<TSignatures, TOptionalSignatures>;
    /**
     * A reference to the root element of the editor.
     */
    rootRef: React.RefObject<HTMLDivElement>;
    /**
     * A function that runs item plugins for the video plugin runner.
     */
    runItemPlugins: VideoPluginsRunner;
  };

/**
 * EditorProviderProps type definition
 * 
 * @description Props for the EditorProvider component, including the value and children of the editor context.
 * @param TSignatures - The types of the signatures used in the editor context.
 */
export interface EditorProviderProps<TSignatures extends readonly EditorAnyPluginSignature[]> {
  /**
   * The value of the editor context.
   */
  value: EditorContextValue<TSignatures>;
  /**
   * The children of the EditorProvider component.
   */
  children: React.ReactNode;
}