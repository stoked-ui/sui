import { FileExplorerProps } from '../FileExplorer';
import { FileExplorerBasicProps } from '../FileExplorerBasic';
import { FileElementProps } from '../FileElement';
import { FileProps } from '../File';

export interface FileExplorerComponentsPropsList {
  MuiFileExplorerBasic: FileExplorerBasicProps<any>;
  MuiFileExplorer: FileExplorerProps<any, any>;
  MuiFile: FileProps;
  MuiFileElement: FileElementProps;
}

declare module '@mui/material/styles' {
  interface ComponentsPropsList extends FileExplorerComponentsPropsList {}
}

// disable automatic export
export {};
