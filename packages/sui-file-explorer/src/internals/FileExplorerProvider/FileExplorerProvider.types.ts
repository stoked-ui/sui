/**
 * Type definition for a function that runs file plugins.
 * @template TProps - The type of props accepted by the function
 * @param {TProps} props - The props object passed to the function
 * @returns {Required<FilePluginResponse>} - The response object from running file plugins
 */
export type FilePluginsRunner = <TProps extends {}>(
  props: TProps,
) => Required<FilePluginResponse>;

/**
 * Type definition for the context value of a file explorer.
 * @template TSignatures - The type of file explorer plugin signatures
 * @template TOptionalSignatures - The type of optional file explorer plugin signatures
 */
export type FileExplorerContextValue<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TOptionalSignatures extends readonly FileExplorerAnyPluginSignature[] = [],
> = MergeSignaturesProperty<TSignatures, 'contextValue'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'contextValue'>> & {
    instance: FileExplorerInstance<TSignatures, TOptionalSignatures>;
    publicAPI: FileExplorerPublicAPI<TSignatures, TOptionalSignatures>;
    rootRef: React.RefObject<HTMLUListElement>;
    wrapItem: FileWrapper<TSignatures>;
    wrapRoot: FileExplorerRootWrapper<TSignatures>;
    runItemPlugins: FilePluginsRunner;
  };

/**
 * Props interface for the FileExplorerProvider component.
 * @template TSignatures - The type of file explorer plugin signatures
 */
export interface FileExplorerProviderProps<TSignatures extends readonly FileExplorerAnyPluginSignature[]> {
  value: FileExplorerContextValue<TSignatures>; // The context value for the file explorer
  children: React.ReactNode; // The child components to render within the file explorer
}
*/