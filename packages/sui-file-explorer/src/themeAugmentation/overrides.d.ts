/** Interface for mapping component names to class keys */
export interface FileExplorerComponentNameToClassKey {
  MuiFileExplorerBasic: FileExplorerBasicClassKey; // Class key for FileExplorerBasic component
  MuiFileExplorer: FileExplorerClassKey; // Class key for FileExplorer component
  MuiFileElement: FileElementClassKey; // Class key for FileElement component
  MuiFile: FileClassKey; // Class key for File component
}

/** Extend the ComponentNameToClassKey interface in @mui/material/styles with FileExplorerComponentNameToClassKey */
declare module '@mui/material/styles' {
  interface ComponentNameToClassKey extends FileExplorerComponentNameToClassKey {}
}

// disable automatic export
export {};