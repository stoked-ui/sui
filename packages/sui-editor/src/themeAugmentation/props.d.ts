/**
 * Interface for defining the props list for Editor components.
 */
export interface EditorComponentsPropsList {
  /**
   * Material-UI Editor component props.
   */
  MuiEditor: EditorProps<any, any>;
}

/**
 * Extends the ComponentsPropsList interface from Material-UI styles with Editor component props.
 */
declare module '@mui/material/styles' {
  interface ComponentsPropsList extends EditorComponentsPropsList {}
}

// disable automatic export
export {};