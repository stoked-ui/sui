import { Interpolation } from '@mui/system';
import { createTheme, styled } from '@mui/material/styles';

/**
 * Extends the Mixins interface from Material-UI styles with a customMixin property.
 */
declare module '@mui/material/styles' {
  interface Mixins {
    customMixin: Interpolation<{}>;
  }
}

// ensure MixinsOptions work
const theme = createTheme({ mixins: { customMixin: { paddingLeft: 2 } } });

/**
 * A styled div component that applies the customMixin from the theme.
 * 
 * @param {Object} props - The props object containing the theme.
 * @returns {JSX.Element} The styled div component.
 */
const Example = styled('div')(({ theme: t }) => t.mixins.customMixin);