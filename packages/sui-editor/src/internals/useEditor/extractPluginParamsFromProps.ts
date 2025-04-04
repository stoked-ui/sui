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

/**
 * Parameters for extracting plugin parameters from props.
 */
interface ExtractPluginParamsFromPropsParameters<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TProps extends Partial<UseEditorBaseProps<TSignatures>>,
> {
  /**
   * Array of plugins to extract parameters from.
   */
  plugins: ConvertSignaturesIntoPlugins<readonly [...EditorCorePluginSignatures, ...TSignatures]>;

  /**
   * Props to extract plugin parameters from.
   */
  props: TProps;

  /**
   * Function to generate a unique ID for the plugin.
   */
  idFunc: () => string;
}

/**
 * Return type for extracting plugin parameters from props.
 */
interface ExtractPluginParamsFromPropsReturnValue<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TProps extends Partial<UseEditorBaseProps<TSignatures>>,
> extends UseEditorBaseProps<TSignatures> {
  /**
   * Plugin parameters with defaultized values.
   */
  pluginParams: MergeSignaturesProperty<TSignatures, 'defaultizedParams'>;

  /**
   * Forwarded props that are not plugin parameters.
   */
  forwardedProps: Omit<TProps, keyof MergeSignaturesProperty<TSignatures, 'params'>>;
}

/**
 * Extracts plugin parameters from props and returns an object with defaultized plugin parameters.
 *
 * @param params Parameters for extracting plugin parameters from props.
 * @returns Return type for extracting plugin parameters from props.
 */
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
  /**
   * Type alias for plugin parameters.
   */
  type PluginParams = MergeSignaturesProperty<TSignatures, 'params'>;

  /**
   * Lookup table for plugin parameters.
   */
  const paramsLookup = {} as Record<keyof PluginParams, true>;

  plugins.forEach((plugin) => {
    if (plugin?.params) {
      Object.assign(paramsLookup, plugin.params);
    }
  });

  /**
   * Defaultized plugin parameters object.
   */
  const pluginParams = {} as PluginParams;

  /**
   * Forwarded props object.
   */
  const forwardedProps = {} as Omit<TProps, keyof PluginParams>;

  Object.keys(props).forEach((propName) => {
    let prop = props[propName as keyof typeof props] as any;
    if (paramsLookup[propName as keyof PluginParams]) {
      pluginParams[propName as keyof PluginParams] = prop;
    } else {
      forwardedProps[propName as keyof typeof forwardedProps] = prop;
    }
  });

  /**
   * Reduce function to defaultize plugin parameters.
   */
  const defaultizedPluginParams = plugins.reduce(
    (acc, plugin: EditorPlugin<EditorAnyPluginSignature>) => {
      if (plugin?.getDefaultizedParams) {
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