import { FileExplorerClassKey } from '../FileExplorer';
import { FileExplorerBasicClassKey } from '../FileExplorerBasic';
import { FileElementClassKey } from '../FileElement';
import { FileClassKey } from '../File';

// prettier-ignore
export interface FileExplorerComponentNameToClassKey {
  MuiFileExplorerBasic: FileExplorerBasicClassKey;
  MuiFileExplorer: FileExplorerClassKey;
  MuiFileElement: FileElementClassKey;
  MuiFile: FileClassKey;
}

declare module '@mui/material/styles' {
  interface ComponentNameToClassKey extends FileExplorerComponentNameToClassKey {}
}

// disable automatic export
export {};
