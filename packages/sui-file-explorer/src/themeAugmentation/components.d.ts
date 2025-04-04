/**
 * @module FileExplorerComponents
 * @description Provides file explorer components for MUI Material Design.
 *
 * This interface defines the available file explorer components, their properties,
 * and usage. It also extends the @mui/material/styles component interface to include
 * these components.
 */

import { ComponentsOverrides, ComponentsProps, ComponentsVariants } from '@mui/material/styles';

/**
 * @interface FileExplorerComponents<Theme = unknown>
 * @description Provides file explorer components for MUI Material Design.
 *
 * @param {unknown} [theme] - The theme object for the components.
 */
export interface FileExplorerComponents<Theme = unknown> {
  /**
   * @property MuiFileExplorerBasic
   * @description The default props and styles for the MuiFileExplorerBasic component.
   */
  MuiFileExplorerBasic?: {
    defaultProps?: ComponentsProps['MuiFileExplorerBasic'];
    /**
     * @see {@link https://material-ui.com/customization/styles/#muiFileExplorerBasic-override-style}
     */
    styleOverrides?: ComponentsOverrides<Theme>['MuiFileExplorerBasic'];
    /**
     * @see {@link https://material-ui.com/customization/variants/#MuiFileExplorerBasic-variants}
     */
    variants?: ComponentsVariants<Theme>['MuiFileExplorerBasic'];
  };

  /**
   * @property MuiFileExplorer
   * @description The default props and styles for the MuiFileExplorer component.
   */
  MuiFileExplorer?: {
    defaultProps?: ComponentsProps['MuiFileExplorer'];
    /**
     * @see {@link https://material-ui.com/customization/styles/#muiFileExplorer-override-style}
     */
    styleOverrides?: ComponentsOverrides<Theme>['MuiFileExplorer'];
    /**
     * @see {@link https://material-ui.com/customization/variants/#MuiFileExplorer-variants}
     */
    variants?: ComponentsVariants<Theme>['MuiFileExplorer'];
  };

  /**
   * @property MuiFileElement
   * @description The default props and styles for the MuiFileElement component.
   */
  MuiFileElement?: {
    defaultProps?: ComponentsProps['MuiFileElement'];
    /**
     * @see {@link https://material-ui.com/customization/styles/#muiFileElement-override-style}
     */
    styleOverrides?: ComponentsOverrides<Theme>['MuiFileElement'];
    /**
     * @see {@link https://material-ui.com/customization/variants/#MuiFileElement-variants}
     */
    variants?: ComponentsVariants<Theme>['MuiFileElement'];
  };

  /**
   * @property MuiFile
   * @description The default props and styles for the MuiFile component.
   */
  MuiFile?: {
    defaultProps?: ComponentsProps['MuiFile'];
    /**
     * @see {@link https://material-ui.com/customization/styles/#muiFile-override-style}
     */
    styleOverrides?: ComponentsOverrides<Theme>['MuiFile'];
    /**
     * @see {@link https://material-ui.com/customization/variants/#MuiFile-variants}
     */
    variants?: ComponentsVariants<Theme>['MuiFile'];
  };

}

/**
 * @interface Components
 * @description Extends the FileExplorerComponents interface.
 *
 * @extends {FileExplorerComponents<unknown>}
 */
declare module '@mui/material/styles' {
  /**
   * @interface FileExplorerComponents<Theme = unknown>
   */
  interface Components<Theme = unknown> extends FileExplorerComponents<Theme> {}
}