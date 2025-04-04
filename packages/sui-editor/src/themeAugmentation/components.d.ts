/**
 * Extends the Material-UI components with custom editor-specific components.
 */
export interface EditorComponents<Theme = unknown> {
  /**
   * MuiEditor component properties.
   */
  MuiEditor?: {
    /**
     * Default props for MuiEditor component.
     */
    defaultProps?: ComponentsProps['MuiEditor'];

    /**
     * Custom style overrides for MuiEditor component.
     */
    styleOverrides?: ComponentsOverrides<Theme>['MuiEditor'];

    /**
     * Supported variants for MuiEditor component.
     */
    variants?: ComponentsVariants<Theme>['MuiEditor'];
  };
}

/**
 * Extends the Material-UI styles module with custom editor components.
 */
declare module '@mui/material/styles' {
  interface Components<Theme = unknown> extends EditorComponents<Theme> {}
}