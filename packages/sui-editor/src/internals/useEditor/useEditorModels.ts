/**
 * Implements the same behavior as `useControlled` but for several models.
 * The controlled models are never stored in the state, and the state is only updated if the model
 * is not controlled.
 */
export const useEditorModels<TSignatures extends readonly EditorAnyPluginSignature[]> = (
  plugins: ConvertSignaturesIntoPlugins<readonly [...EditorCorePluginSignatures, ...TSignatures]>,
  props: MergeSignaturesProperty<TSignatures, 'defaultizedParams'>,
) => {
  /**
   * Type definition for the defaultized parameters.
   */
  type DefaultizedParams = MergeSignaturesProperty<TSignatures, 'defaultizedParams'>;

  /**
   * Reference to the models, where each model is an object with two properties:
   * `getDefaultValue` and `isControlled`.
   *
   * @type {React.RefObject<{[modelName: string]: { getDefaultValue: (params: DefaultizedParams) => any; isControlled: boolean; }}>}
   */
  const modelsRef = React.useRef<{
    [modelName: string]: {
      /**
       * Gets the default value for a given set of parameters.
       *
       * @param {DefaultizedParams} params
       * @returns {*} The default value.
       */
      getDefaultValue: (params: DefaultizedParams) => any;
      /**
       * Indicates whether the model is controlled or not.
       *
       * @type {boolean}
       */
      isControlled: boolean;
    };
  }>({});

  return {};
};