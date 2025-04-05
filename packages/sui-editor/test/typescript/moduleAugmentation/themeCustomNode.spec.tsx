/**
 * CustomNode interface for defining custom node properties.
 * @typedef {object} CustomNode
 * @property {string} background - The background color of the custom node.
 * @property {string} color - The text color of the custom node.
 */

/**
 * Extends ThemeOptions and Theme interfaces to include customNode property.
 */
interface CustomNode {
  background: string;
  color: string;
}

declare module '@mui/material/styles' {
  interface ThemeOptions {
    customNode: CustomNode;
  }

  interface Theme {
    customNode: CustomNode;
  }
}

/**
 * Custom theme with customNode properties.
 */
const customTheme = createTheme({
  customNode: {
    background: '#000',
    color: '#fff',
  },
});

/**
 * StyledComponent functional component that styles a div based on theme customNode properties.
 * @param {object} props - The component props.
 * @param {object} props.theme - The theme object containing customNode properties.
 * @returns {JSX.Element} A styled div element.
 */
const StyledComponent = styled('div')(({ theme }) => ({
  background: theme.customNode.background,
  color: theme.customNode.color,
}));

/**
 * Box component styled using theme customNode properties.
 * @example
 * <Box
 *   sx={(theme) => ({
 *     background: theme.customNode.background,
 *     color: theme.customNode.color,
 *   })}
 * />;
 */
<Box
  sx={(theme) => ({
    background: theme.customNode.background,
    color: theme.customNode.color,
  })}
/>;