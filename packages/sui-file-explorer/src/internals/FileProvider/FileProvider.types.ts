import * as React from 'react';
import {FileId} from '../../models';

export interface FileProviderProps {
  children: React.ReactNode;
  id: FileId;
}

