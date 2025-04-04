import * as React from 'react';
import { createTheme, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

/**
 * Custom node interface representing the custom theme options for Material UI.
 */
interface CustomNode {
  /**
   * Background color of the custom node.
   */
  background: string;
  /**
   * Color of the custom node.
   */
  color: string;
}

declare module '@mui/material/styles' {
  /**
   * Theme options interface with a custom node property.
   */
  interface ThemeOptions {
    /**
     * Custom theme options object.
     */
    customNode: CustomNode;
  }

  /**
   * Theme interface with a custom node property.
   */
  interface Theme {
    /**
     * Custom theme options object.
     */
    customNode: CustomNode;
  }
}

/**
 * Creates a Material UI theme with custom node properties.
 *
 * @returns {Theme} The created theme with custom node properties.
 */
const customTheme = createTheme({
  customNode: {
    background: '#000',
    color: '#fff',
  },
});

/**
 * Styled component that uses the custom node properties from the Material UI theme.
 */
const StyledComponent = styled('div')(({ theme }) => ({
  /**
   * Background color of the styled component based on the custom node property.
   */
  background: theme.customNode.background,
  /**
   * Color of the styled component based on the custom node property.
   */
  color: theme.customNode.color,
}));

/**
 * Box component with custom node properties applied to its styles.
 *
 * @param {Theme} theme The Material UI theme object.
 */
<Box
  sx={(theme) => ({
    /**
     * Background color of the box component based on the custom node property.
     */
    background: theme.customNode.background,
    /**
     * Color of the box component based on the custom node property.
     */
    color: theme.customNode.color,
  })}
/>;