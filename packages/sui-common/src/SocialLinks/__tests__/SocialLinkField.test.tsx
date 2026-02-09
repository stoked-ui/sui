import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SocialLinkField from '../SocialLinkField';
import { PLATFORM_REGISTRY } from '../platformRegistry';
import type { SocialPlatformKey } from '../types';

const theme = createTheme();

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('SocialLinkField', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it.each(PLATFORM_REGISTRY.map((p) => [p.key, p.label, p.placeholder] as const))(
    'renders %s field with label "%s" and placeholder "%s"',
    (key, label, placeholder) => {
      const platform = PLATFORM_REGISTRY.find((p) => p.key === key)!;
      renderWithTheme(
        <SocialLinkField platform={platform} value="" onChange={mockOnChange} />
      );

      expect(screen.getByTestId(`social-link-field-${key}`)).toBeInTheDocument();
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    }
  );

  it('renders prefix adornment for Instagram', () => {
    const instagram = PLATFORM_REGISTRY.find((p) => p.key === 'instagram')!;
    renderWithTheme(
      <SocialLinkField platform={instagram} value="" onChange={mockOnChange} />
    );
    expect(screen.getByText('instagram.com/')).toBeInTheDocument();
  });

  it('does not render prefix adornment for YouTube (no prefix)', () => {
    const youtube = PLATFORM_REGISTRY.find((p) => p.key === 'youtube')!;
    renderWithTheme(
      <SocialLinkField platform={youtube} value="" onChange={mockOnChange} />
    );
    expect(screen.queryByText('youtube.com/')).not.toBeInTheDocument();
  });

  it('calls onChange with key and value on input change', () => {
    const instagram = PLATFORM_REGISTRY.find((p) => p.key === 'instagram')!;
    renderWithTheme(
      <SocialLinkField platform={instagram} value="" onChange={mockOnChange} />
    );

    const input = screen.getByPlaceholderText('username');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(mockOnChange).toHaveBeenCalledWith('instagram', 'hello');
  });

  it('renders disabled input when disabled is true', () => {
    const instagram = PLATFORM_REGISTRY.find((p) => p.key === 'instagram')!;
    renderWithTheme(
      <SocialLinkField platform={instagram} value="" onChange={mockOnChange} disabled />
    );

    const input = screen.getByPlaceholderText('username');
    expect(input).toBeDisabled();
  });

  it('renders readOnly input when readOnly is true', () => {
    const instagram = PLATFORM_REGISTRY.find((p) => p.key === 'instagram')!;
    renderWithTheme(
      <SocialLinkField platform={instagram} value="" onChange={mockOnChange} readOnly />
    );

    const input = screen.getByPlaceholderText('username');
    expect(input).toHaveAttribute('readonly');
  });
});
