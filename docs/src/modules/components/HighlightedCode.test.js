import * as React from 'react';
import { expect } from 'chai';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { getDesignTokens } from '@stoked-ui/docs/branding';
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';

describe('HighlightedCode', () => {
  const { render } = createRenderer();

  it('does not crash with default theme', () => {
    expect(() =>
      render(
        <ThemeProvider theme={createTheme()}>
          <HighlightedCode code="" language="javascript" />
        </ThemeProvider>,
      ),
    ).not.to.throw();
  });

  it('does not crash with default theme in dark mode', () => {
    expect(() =>
      render(
        <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
          <HighlightedCode code="" language="javascript" />
        </ThemeProvider>,
      ),
    ).not.to.throw();
  });

  it('does not crash with branding theme', () => {
    expect(() =>
      render(
        <ThemeProvider theme={createTheme(getDesignTokens('light'))}>
          <HighlightedCode code="" language="javascript" />
        </ThemeProvider>,
      ),
    ).not.to.throw();
  });

  it('does not crash with branding theme in dark mode', () => {
    expect(() =>
      render(
        <ThemeProvider theme={createTheme(getDesignTokens('dark'))}>
          <HighlightedCode code="" language="javascript" />
        </ThemeProvider>,
      ),
    ).not.to.throw();
  });
});
