import * as React from 'react';
import {
  ConvertSignaturesIntoPlugins, EditorAnyPluginSignature, MergeSignaturesProperty,
} from '../models';
import {EditorCorePluginSignatures} from '../corePlugins';

/**
 * Implements the same behavior as `useControlled` but for several models.
 * The controlled models are never stored in the state, and the state is only updated if the model
 * is not controlled.
 */
export const useEditorModels = <TSignatures extends readonly EditorAnyPluginSignature[]>(
  plugins: ConvertSignaturesIntoPlugins<readonly [...EditorCorePluginSignatures, ...TSignatures]>,
  props: MergeSignaturesProperty<TSignatures, 'defaultizedParams'>,
) => {
  type DefaultizedParams = MergeSignaturesProperty<TSignatures, 'defaultizedParams'>;

  const modelsRef = React.useRef<{
    [modelName: string]: {
      getDefaultValue: (params: DefaultizedParams) => any;
      isControlled: boolean;
    };
  }>({});

  return {};
};
