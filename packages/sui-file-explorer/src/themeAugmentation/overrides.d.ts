import { FileExplorerClassKey } from '../FileExplorer';
import { FileExplorerBasicClassKey } from '../FileExplorerBasic';
import { FileElementClassKey } from '../FileElement';
import { FileClassKey } from '../File';

/**
 * Mapping of Material-UI file explorer component names to their corresponding class keys.
 *
 * @enum {string}
 */
export interface FileExplorerComponentNameToClassKey {
  /**
   * Class key for the basic MuiFileExplorerBasic component.
   *
   * @see FileExplorerBasic
   */
  MuiFileExplorerBasic: FileExplorerBasicClassKey;

  /**
   * Class key for the Material-UI file explorer component.
   *
   * @see FileExplorer
   */
  MuiFileExplorer: FileExplorerClassKey;

  /**
   * Class key for the individual file element in a material-ui file explorer.
   *
   * @see FileElement
   */
  MuiFileElement: FileElementClassKey;

  /**
   * Class key for the Material-UI file component.
   *
   * @see File
   */
  MuiFile: FileClassKey;
}

declare module '@mui/material/styles' {
  /**
   * Extension of the ComponentNameToClassKey interface with the added properties from the FileExplorerComponentNameToClassKey interface.
   *
   * @extends {ComponentNameToClassKey}
   */
  interface ComponentNameToClassKey extends FileExplorerComponentNameToClassKey {}
}

// disable automatic export
export {};