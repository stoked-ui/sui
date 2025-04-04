/**
 * Extracts plugin parameters from props.
 *
 * @param {ExtractPluginParamsFromPropsParameters<TSignatures, TProps>} params
 * @returns {ExtractPluginParamsFromPropsReturnValue<TSignatures, TProps>}
 */
export const extractPluginParamsFromProps = <
  TSignatures extends readonly FileExplorerPluginSignature<any>[],
  TProps extends Partial<UseFileExplorerBaseProps<TSignatures>>,
>({
  props: {
    slots,
    slotProps,
    apiRef,
    experimentalFeatures,
    ...props,
  },
  plugins,
}: ExtractPluginParamsFromPropsParameters<
  TSignatures,
  TProps
>) {
  /**
   * Type alias for plugin parameters.
   */
  type PluginParams = MergeSignaturesProperty<TSignatures, 'params'>;

  /**
   * Object to store parameters lookup for each plugin.
   */
  const paramsLookup: Record<keyof PluginParams, true> = {};

  plugins.forEach((plugin) => {
    Object.assign(paramsLookup, plugin.params);
  });

  /**
   * Object to store defaultized plugin parameters.
   */
  const pluginParams: PluginParams = {};

  /**
   * Object to store forwarded props.
   */
  const forwardedProps: Omit<TProps, keyof PluginParams> = {};

  Object.keys(props).forEach((propName) => {
    const prop = props[propName as keyof typeof props] as any;

    if (paramsLookup[propName as keyof PluginParams]) {
      pluginParams[propName as keyof PluginParams] = prop;
    } else {
      forwardedProps[propName as keyof typeof forwardedProps] = prop;
    }
  });

  /**
   * Reduce plugins to get defaultized parameters.
   */
  const defaultizedPluginParams: MergeSignaturesProperty<TSignatures, 'defaultizedParams'> =
    plugins.reduce(
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
}