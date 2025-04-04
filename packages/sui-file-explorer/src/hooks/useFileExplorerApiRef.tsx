/**
 * Hook that instantiates a [[FileExplorerApiRef]].
 *
 * @param {TSignatures} [TSignatures extends readonly FileExplorerAnyPluginSignature[] = FileExplorerPluginSignatures]
 *   The type of plugin signatures to use. Defaults to the built-in `FileExplorerPluginSignatures`.
 */
export const useFileExplorerApiRef = <
  TSignatures extends readonly FileExplorerAnyPluginSignature[] = FileExplorerPluginSignatures,
>() => {
  /**
   * The ref to store the instantiated API reference.
   *
   * @type {React.MutableRefObject<FileExplorerPublicAPI<TSignatures> | undefined>}
   */
  const apiRef = React.useRef(undefined);

  return apiRef;
};