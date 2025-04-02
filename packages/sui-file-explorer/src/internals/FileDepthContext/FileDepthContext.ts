import * as React from 'react';
import {FileId} from '../../models';

export const FileDepthContext = React.createContext<
  number | ((id: FileId) => number)
>(() => -1);

if (process.env.NODE_ENV !== 'production') {
  FileDepthContext.displayName = 'FileDepthContext';
}

