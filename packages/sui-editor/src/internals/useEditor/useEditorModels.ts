import * as React from 'react';
import {
  ConvertSignaturesIntoPlugins, EditorAnyPluginSignature, MergeSignaturesProperty,
} from '../models';
import {EditorCorePluginSignatures} from '../corePlugins';

/**
 * Implements the same behavior as `useControlled` but for several models.
 * The controlled models are never stored in the state, and the state is only updated if the model
 * is not controlled.
 * 
 * @param {readonly EditorAnyPluginSignature[]} TSignatures - Array of editor plugin signatures
 * @param {Object} plugins - Plugins to be used in the editor
 * @param {Object} props - Defaultized parameters for the editor plugins
 * @returns {Object} - Returns an object
 */
export const useEditorModels = <TSignatures extends readonly EditorAnyPluginSignature[]>(
  plugins: ConvertSignaturesIntoPlugins<readonly [...EditorCorePluginSignatures, ...TSignatures]>,
  props: MergeSignaturesProperty<TSignatures, 'defaultizedParams'>,
) => {
  type DefaultizedParams = MergeSignaturesProperty<TSignatures, 'defaultizedParams'>;

  /**
   * @property {Object} modelsRef - Reference to models
   * @property {Function} modelsRef[modelName].getDefaultValue - Function to get default value for a model
   * @property {boolean} modelsRef[modelName].isControlled - Flag indicating if the model is controlled
   */
  const modelsRef = React.useRef<{
    [modelName: string]: {
      getDefaultValue: (params: DefaultizedParams) => any;
      isControlled: boolean;
    };
  }>({});

  return {};
};