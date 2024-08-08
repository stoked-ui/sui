import { ComponentsOverrides, ComponentsProps, ComponentsVariants } from '@mui/material/styles';

export interface FileExplorerComponents<Theme = unknown> {
  MuiFileExplorerBasic?: {
    defaultProps?: ComponentsProps['MuiFileExplorerBasic'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiFileExplorerBasic'];
    variants?: ComponentsVariants<Theme>['MuiFileExplorerBasic'];
  };
  MuiFileExplorer?: {
    defaultProps?: ComponentsProps['MuiFileExplorer'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiFileExplorer'];
    variants?: ComponentsVariants<Theme>['MuiFileExplorer'];
  };
  MuiFileElement?: {
    defaultProps?: ComponentsProps['MuiFileElement'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiFileElement'];
    variants?: ComponentsVariants<Theme>['MuiFileElement'];
  };
  MuiFile?: {
    defaultProps?: ComponentsProps['MuiFile'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiFile'];
    variants?: ComponentsVariants<Theme>['MuiFile'];
  };

}

declare module '@mui/material/styles' {
  interface Components<Theme = unknown> extends FileExplorerComponents<Theme> {}
}
