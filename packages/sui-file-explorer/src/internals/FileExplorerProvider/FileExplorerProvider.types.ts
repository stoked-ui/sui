/**
 * File Explorer Provider Props
 *
 * @template TSignatures - An array of file explorer plugin signatures.
 * @description Props for the FileExplorerProvider component.
 */
export interface FileExplorerProviderProps<TSignatures extends readonly FileExplorerAnyPluginSignature[]> {
  /**
   * The context value provided by the parent provider or initial state.
   */
  value: FileExplorerContextValue<TSignatures>;
  /**
   * The children to be rendered under the FileExplorerProvider.
   */
  children: React.ReactNode;
}