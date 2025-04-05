/**
 * Extracts plugin parameters from props based on plugin signatures.
 * @template TSignatures - Type of editor plugin signatures.
 * @template TProps - Type of editor base props.
 * @param {Object} params - Parameters for extracting plugin params.
 * @param {ConvertSignaturesIntoPlugins<readonly [...EditorCorePluginSignatures, ...TSignatures]>} params.plugins - Converted editor plugins.
 * @param {TProps} params.props - Editor base props.
 * @param {() => string} params.idFunc - Function to generate unique IDs.
 * @returns {ExtractPluginParamsFromPropsReturnValue<TSignatures, TProps>} Extracted plugin parameters and forwarded props.
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
  type PluginParams = MergeSignaturesProperty<TSignatures, 'params'>;


  const paramsLookup = {} as Record<keyof PluginParams, true>;
  plugins.forEach((plugin) => {
    if (plugin?.params) {
      Object.assign(paramsLookup, plugin.params);
    }
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