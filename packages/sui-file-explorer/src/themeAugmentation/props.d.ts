/**
 * File Explorer Components Props List
 *
 * A list of props for the different components in the file explorer.
 */

export interface FileExplorerComponentsPropsList {
  /**
   * Props for the MuiFileExplorerBasic component.
   *
   * @see {@link https://material-ui.com/api/file-explorer-basic/}
   */
  MuiFileExplorerBasic: FileExplorerBasicProps<any>;

  /**
   * Props for the MuiFileExplorer component.
   *
   * @see {@link https://material-ui.com/api/file-explorer/}
   */
  MuiFileExplorer: FileExplorerProps<any>;

  /**
   * Default props for the File component.
   *
   * @see {@link https://material-ui.com/api/file/}
   */
  MuiFile: FileProps;

  /**
   * Props for the MuiFileElement component.
   *
   * @see {@link https://material-ui.com/api/file-element/}
   */
  MuiFileElement: FileElementProps;
}

/**
 * Extend the components props list with the file explorer components props.
 *
 * This is done to make it easier for users to access and use the file explorer components.
 */
declare module '@mui/material/styles' {
  interface ComponentsPropsList extends FileExplorerComponentsPropsList {}
}

// disable automatic export
export {};