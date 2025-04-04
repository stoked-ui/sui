import * as React from 'react';

/**
 * @interface FileExplorerContext
 * 
 * The File Explorer Context is a React context API used to share state between components in the file explorer.
 * It provides a way to access and update the current directory path, among other properties.
 */
export const FileExplorerContext = React.createContext<FileExplorerContextValue<any> | null>(null);

if (process.env.NODE_ENV !== 'production') {
  /**
   * @constant {string} displayName
   * 
   * The display name of the component in development environment.
   */
  FileExplorerContext.displayName = 'FileExplorerContext';
}