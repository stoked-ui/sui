/**
 * Extracts plugin parameters from the props object based on the provided plugins and props.
 *
 * @template TSignatures - An array of FileExplorerPluginSignature objects.
 * @template TProps - Partial object of UseFileExplorerBaseProps with TSignatures.
 *
 * @param {ExtractPluginParamsFromPropsParameters<TSignatures, TProps>} parameters - The parameters object containing plugins and props.
 * @returns {ExtractPluginParamsFromPropsReturnValue<TSignatures, TProps>} - The extracted plugin parameters and forwarded props.
 */
export const extractPluginParamsFromProps = <
  TSignatures extends readonly FileExplorerPluginSignature<any>[],
  TProps extends Partial<UseFileExplorerBaseProps<TSignatures>>,
>({
  props: { slots, slotProps, apiRef, experimentalFeatures, ...props },
  plugins,
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
    const prop = props[propName as keyof typeof props] as any;

    if (paramsLookup[propName as keyof PluginParams]) {
      pluginParams[propName as keyof PluginParams] = prop;
    } else {
      forwardedProps[propName as keyof typeof forwardedProps] = prop;
    }
  });

  const defaultizedPluginParams = plugins.reduce(
    (acc, plugin: FileExplorerPlugin<FileExplorerAnyPluginSignature>) => {
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