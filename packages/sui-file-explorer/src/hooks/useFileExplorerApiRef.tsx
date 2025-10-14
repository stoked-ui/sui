/**
 * Hook that instantiates a FileExplorerApiRef.
 * @template TSignatures - The type of FileExplorerAnyPluginSignature array.
 * @returns {React.MutableRefObject<FileExplorerPublicAPI<TSignatures> | undefined>} A mutable ref object for FileExplorerPublicAPI.
 * @example
 * const fileExplorerApiRef = useFileExplorerApiRef();
 */
export const useFileExplorerApiRef = <
  TSignatures extends readonly FileExplorerAnyPluginSignature[] = FileExplorerPluginSignatures,
>() =>
  React.useRef(undefined) as React.MutableRefObject<FileExplorerPublicAPI<TSignatures> | undefined>;