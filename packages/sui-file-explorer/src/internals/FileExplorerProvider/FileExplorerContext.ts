/**
 * @ignore - internal component.
 */
export const FileExplorerContext = React.createContext<FileExplorerContextValue<any> | null>(null);

if (process.env.NODE_ENV !== 'production') {
  FileExplorerContext.displayName = 'FileExplorerContext';
}
*/