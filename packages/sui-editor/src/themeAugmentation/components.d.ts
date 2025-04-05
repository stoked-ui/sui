/**
 * Interface for customizing editor components in Material-UI.
 * 
 * @template Theme - The theme type for the editor components
 */
export interface EditorComponents<Theme = unknown> {
  MuiEditor?: {
    /**
     * Default props for the MuiEditor component.
     */
    defaultProps?: ComponentsProps['MuiEditor'];
    /**
     * Custom style overrides for the MuiEditor component.
     */
    styleOverrides?: ComponentsOverrides<Theme>['MuiEditor'];
    /**
     * Variants for the MuiEditor component.
     */
    variants?: ComponentsVariants<Theme>['MuiEditor'];
  };
}

/**
 * Extends the Components interface in Material-UI to include the custom editor components.
 */
declare module '@mui/material/styles' {
  interface Components<Theme = unknown> extends EditorComponents<Theme> {}
}