/**
 * Interface mapping editor component names to editor class keys.
 */
export interface EditorComponentNameToClassKey {
  MuiEditor: EditorClassKey;
}

/**
 * Extends the Material-UI styles ComponentNameToClassKey interface with EditorComponentNameToClassKey.
 */
declare module '@mui/material/styles' {
  interface ComponentNameToClassKey extends EditorComponentNameToClassKey {}
}

// disable automatic export
export {};