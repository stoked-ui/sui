/**
 * Context for tracking the depth of a file in the file hierarchy.
 */
export const FileDepthContext = React.createContext<number | ((id: FileId) => number)>(() => -1);

if (process.env.NODE_ENV !== 'production') {
  FileDepthContext.displayName = 'FileDepthContext';
}