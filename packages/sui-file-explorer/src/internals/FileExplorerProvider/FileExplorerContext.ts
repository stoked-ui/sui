import * as React from 'react';
import { FileExplorerContextValue } from './FileExplorerProvider.types';

/**
 * @ignore - internal component.
 */
export const FileExplorerContext = React.createContext<FileExplorerContextValue<any, []> | null>(null);

if (process.env.NODE_ENV !== 'production') {
  FileExplorerContext.displayName = 'FileExplorerContext';
}
