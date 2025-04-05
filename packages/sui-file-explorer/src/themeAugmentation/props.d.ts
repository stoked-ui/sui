/** 
 * Interface for the list of file explorer components and their props.
 * @typedef {Object} FileExplorerComponentsPropsList
 * @property {FileExplorerBasicProps<any>} MuiFileExplorerBasic - Props for the FileExplorerBasic component.
 * @property {FileExplorerProps<any>} MuiFileExplorer - Props for the FileExplorer component.
 * @property {FileProps} MuiFile - Props for the File component.
 * @property {FileElementProps} MuiFileElement - Props for the FileElement component.
 */

import { FileExplorerProps } from '../FileExplorer';
import { FileExplorerBasicProps } from '../FileExplorerBasic';
import { FileElementProps } from '../FileElement';
import { FileProps } from '../File';

/**
 * List of components and their props for the file explorer.
 * @type {FileExplorerComponentsPropsList}
 */
export interface FileExplorerComponentsPropsList {
  MuiFileExplorerBasic: FileExplorerBasicProps<any>;
  MuiFileExplorer: FileExplorerProps<any>;
  MuiFile: FileProps;
  MuiFileElement: FileElementProps;
}

/**
 * Extends the ComponentsPropsList interface from '@mui/material/styles' with the FileExplorerComponentsPropsList.
 */
declare module '@mui/material/styles' {
  interface ComponentsPropsList extends FileExplorerComponentsPropsList {}
}

// disable automatic export
export {};