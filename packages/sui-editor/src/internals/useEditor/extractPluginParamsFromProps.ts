import * as React from 'react';
import {
  ConvertSignaturesIntoPlugins,
  EditorAnyPluginSignature,
  EditorPlugin,
  EditorPluginSignature,
  MergeSignaturesProperty,
} from '../models';
import {UseEditorBaseProps} from './useEditor.types';
import {EditorCorePluginSignatures} from '../corePlugins';

interface ExtractPluginParamsFromPropsParameters<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TProps extends Partial<UseEditorBaseProps<TSignatures>>,
> {
  plugins: ConvertSignaturesIntoPlugins<readonly [...EditorCorePluginSignatures, ...TSignatures]>;
  props: TProps;
  idFunc: () => string;
}

interface ExtractPluginParamsFromPropsReturnValue<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TProps extends Partial<UseEditorBaseProps<TSignatures>>,
> extends UseEditorBaseProps<TSignatures> {
  pluginParams: MergeSignaturesProperty<TSignatures, 'defaultizedParams'>;
  forwardedProps: Omit<TProps, keyof MergeSignaturesProperty<TSignatures, 'params'>>;
}

export const extractPluginParamsFromProps = <
  TSignatures extends readonly EditorPluginSignature<any>[],
  TProps extends Partial<UseEditorBaseProps<TSignatures>>,
>({
  props: { slots, slotProps, apiRef, experimentalFeatures, ...props },
  plugins,
  idFunc
}: ExtractPluginParamsFromPropsParameters<
  TSignatures,
  TProps
>): ExtractPluginParamsFromPropsReturnValue<TSignatures, TProps> => {
  type PluginParams = MergeSignaturesProperty<TSignatures, 'params'>;

  const paramsLookup = {} as Record<keyof PluginParams, true>;
  plugins.forEach((plugin) => {
    Object.assign(paramsLookup, plugin.params);
  });

  const pluginParams = {} as PluginParams;
  const forwardedProps = {} as Omit<TProps, keyof PluginParams>;

  Object.keys(props).forEach((propName) => {
    let prop = props[propName as keyof typeof props] as any;
    if (paramsLookup[propName as keyof PluginParams]) {
      pluginParams[propName as keyof PluginParams] = prop;
    } else {
      forwardedProps[propName as keyof typeof forwardedProps] = prop;
    }
  });

  const defaultizedPluginParams = plugins.reduce(
    (acc, plugin: EditorPlugin<EditorAnyPluginSignature>) => {
      if (plugin.getDefaultizedParams) {
        return plugin.getDefaultizedParams(acc);
      }

      return acc;
    },
    pluginParams,
  ) as unknown as MergeSignaturesProperty<TSignatures, 'defaultizedParams'>;

  return {
    apiRef,
    forwardedProps,
    pluginParams: defaultizedPluginParams,
    slots: slots ?? ({} as any),
    slotProps: slotProps ?? ({} as any),
    experimentalFeatures: experimentalFeatures ?? ({} as any),
  };
};
