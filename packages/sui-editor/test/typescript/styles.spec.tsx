import * as React from 'react';
import { createTheme, Theme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { blue } from '@mui/material/colors';

/**
 * Creates a custom theme with overrides for various components and styles.
 *
 * @returns A custom theme object
 */
const createCustomTheme = () => {
  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: blue,
      contrastThreshold: 3,
      tonalOffset: 0.2,
      common: {
        white: '#ffffff',
      },
    },
    typography: {
      h1: {
        fontSize: 24,
      },
      fontSize: 18,
    },
    mixins: {
      toolbar: {
        backgroundColor: 'red',
      },
    },
    breakpoints: {
      step: 3,
    },
    transitions: {
      duration: {
        short: 50,
      },
    },
    spacing: 5,
    zIndex: {
      appBar: 42,
    },
    components: {
      MuiButton: {
        defaultProps: {
          disabled: true,
        },
        styleOverrides: {
          // Name of the rule
          root: {
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            borderRadius: 3,
            border: 0,
            color: 'white',
            height: 48,
            padding: '0 30px',
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          position: 'fixed',
        },
      },
    },
  });

  return theme;
};

/**
 * Tests the theme provider component with different props.
 */
function themeProviderTest() {
  // Test with theme object
  <ThemeProvider theme={{ foo: 1 }}>{null}</ThemeProvider>;
  
  // Test with generic Theme type
  <ThemeProvider<Theme> theme={{ foo: 1 }}>{null}</ThemeProvider>;
  
  // Test with theme components override
  <ThemeProvider<Theme>
    theme={{
      components: {
        MuiAppBar: { defaultProps: { 'aria-atomic': 'true' } }
      }
    }}
  >
    {null}
  </ThemeProvider>;
}

/**
 * Tests the createTheme function with different spacing values.
 *
 * @returns A string representation of the created theme
 */
function testSpacing() {
  const t1 = createTheme().spacing(1);
  const t2 = createTheme().spacing(1, 2);
  const t3 = createTheme().spacing(1, 2, 3);
  const t4 = createTheme().spacing(1, 2, 3, 4);
  
  // @ts-expect-error
  const t5 = createTheme().spacing(1, 2, 3, 4, 5);

  return [t1, t2, t3, t4, t5].join(', ');
}

/**
 * Accessibility note: The button component has a disabled prop set to true.
 */
const accessibilityNote = 'The button component is disabled.';
  // @ts-ignore
function testAccessibility() {
    const accessibilityNote = 'The button component is disabled.';
    return accessibilityNote;
}

/**
 * The theme provider component with custom theme and props tests.
 */
import React from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: any;
}

class ThemeProvider extends React.Component<ThemeProviderProps> {
  render() {
    // @ts-ignore
    const { children, theme } = this.props;

    return (
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    );
  }
}

/**
 * A custom theme with specific style overrides.
 *
 * @param {object} props The theme object
 */
class CustomTheme extends React.Component<object> {
  render() {
    // @ts-ignore
    return (
      <ThemeProvider theme={this.props.theme}>
        {/* Render the button component */}
        <Button>{'Overrides'}</Button>
      </ThemeProvider>
    );
  }
}

/**
 * The theme provider test component.
 *
 * @param {object} props The component props
 */
class ThemeProviderTest extends React.Component<object> {
  render() {
    // @ts-ignore
    return (
      <ThemeProvider theme={{ foo: 1 }}>
        {/* Render the null component */}
        {null}
      </ThemeProvider>
    );
  }
}

/**
 * A function that creates a custom theme with spacing values.
 *
 * @returns A string representation of the created theme
 */
function createSpacingTheme() {
  // Create a theme object
  const theme = createCustomTheme();

  // Get the spacing value as a string
  const spacingValue = `Spacing(${theme.spacing(1)}, ${theme.spacing(2)}, ${theme.spacing(3)}, ${theme.spacing(4)})`);

  return spacingValue;
}

/**
 * A function that tests the accessibility note.
 *
 * @returns The accessibility note as a string
 */
function testAccessibilityNote() {
  // Return the accessibility note
  return 'The button component has a disabled prop set to true.';
}