import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SocialLinks from '../SocialLinks';

const theme = createTheme();

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('SocialLinks', () => {
  describe('rendering', () => {
    it('renders 13 fields with no props', () => {
      renderWithTheme(<SocialLinks />);
      expect(screen.getByTestId('social-links-root')).toBeInTheDocument();
      const fields = screen.getAllByTestId(/^social-link-field-/);
      expect(fields).toHaveLength(13);
    });

    it('renders filtered platforms in correct order', () => {
      renderWithTheme(<SocialLinks platforms={['instagram', 'x']} />);
      const fields = screen.getAllByTestId(/^social-link-field-/);
      expect(fields).toHaveLength(2);
      expect(fields[0]).toHaveAttribute('data-testid', 'social-link-field-instagram');
      expect(fields[1]).toHaveAttribute('data-testid', 'social-link-field-x');
    });

    it('renders 0 fields with empty platforms array', () => {
      renderWithTheme(<SocialLinks platforms={[]} />);
      expect(screen.getByTestId('social-links-root')).toBeInTheDocument();
      expect(screen.queryByTestId(/^social-link-field-/)).not.toBeInTheDocument();
    });

    it('filters out invalid platform keys', () => {
      renderWithTheme(
        <SocialLinks platforms={['instagram', 'nonexistent' as any]} />
      );
      const fields = screen.getAllByTestId(/^social-link-field-/);
      expect(fields).toHaveLength(1);
      expect(fields[0]).toHaveAttribute('data-testid', 'social-link-field-instagram');
    });
  });

  describe('disabled and readOnly', () => {
    it('disables all inputs when disabled is true', () => {
      renderWithTheme(<SocialLinks disabled platforms={['instagram', 'x']} />);
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });

    it('makes all inputs readOnly when readOnly is true', () => {
      renderWithTheme(<SocialLinks readOnly platforms={['instagram', 'x']} />);
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('readonly');
      });
    });
  });

  describe('uncontrolled mode', () => {
    it('shows defaultValue in inputs', () => {
      renderWithTheme(
        <SocialLinks
          defaultValue={{ instagram: 'initial' }}
          platforms={['instagram']}
        />
      );
      const input = screen.getByPlaceholderText('username');
      expect(input).toHaveValue('initial');
    });

    it('updates input on change and fires onChange', () => {
      const onChange = jest.fn();
      renderWithTheme(
        <SocialLinks
          defaultValue={{ instagram: 'initial' }}
          onChange={onChange}
          platforms={['instagram']}
        />
      );
      const input = screen.getByPlaceholderText('username');
      fireEvent.change(input, { target: { value: 'updated' } });
      expect(input).toHaveValue('updated');
      expect(onChange).toHaveBeenCalledWith({ instagram: 'updated' });
    });

    it('removes key from values when cleared', () => {
      const onChange = jest.fn();
      renderWithTheme(
        <SocialLinks
          defaultValue={{ instagram: 'user' }}
          onChange={onChange}
          platforms={['instagram']}
        />
      );
      const input = screen.getByPlaceholderText('username');
      fireEvent.change(input, { target: { value: '' } });
      expect(onChange).toHaveBeenCalledWith({});
    });
  });

  describe('controlled mode', () => {
    it('reflects value prop', () => {
      renderWithTheme(
        <SocialLinks
          value={{ x: 'hello' }}
          platforms={['x']}
        />
      );
      const input = screen.getByPlaceholderText('username');
      expect(input).toHaveValue('hello');
    });

    it('updates when value prop changes', () => {
      const { rerender } = renderWithTheme(
        <SocialLinks value={{ x: 'hello' }} platforms={['x']} />
      );
      rerender(
        <ThemeProvider theme={theme}>
          <SocialLinks value={{ x: 'world' }} platforms={['x']} />
        </ThemeProvider>
      );
      const input = screen.getByPlaceholderText('username');
      expect(input).toHaveValue('world');
    });

    it('calls onChange but does not update input without prop change', () => {
      const onChange = jest.fn();
      renderWithTheme(
        <SocialLinks
          value={{ instagram: 'original' }}
          onChange={onChange}
          platforms={['instagram']}
        />
      );
      const input = screen.getByPlaceholderText('username');
      fireEvent.change(input, { target: { value: 'changed' } });
      expect(onChange).toHaveBeenCalledWith({ instagram: 'changed' });
      // Input still shows old value (controlled)
      expect(input).toHaveValue('original');
    });

    it('onChange receives merged values', () => {
      const onChange = jest.fn();
      renderWithTheme(
        <SocialLinks
          value={{ instagram: 'user1', x: 'user2' }}
          onChange={onChange}
          platforms={['instagram', 'x']}
        />
      );
      const instagramInput = screen.getByTestId('social-link-field-instagram').querySelector('input')!;
      fireEvent.change(instagramInput, { target: { value: 'newuser' } });
      expect(onChange).toHaveBeenCalledWith({ instagram: 'newuser', x: 'user2' });
    });

    it('removes key when clearing field', () => {
      const onChange = jest.fn();
      renderWithTheme(
        <SocialLinks
          value={{ instagram: 'user' }}
          onChange={onChange}
          platforms={['instagram']}
        />
      );
      const input = screen.getByPlaceholderText('username');
      fireEvent.change(input, { target: { value: '' } });
      expect(onChange).toHaveBeenCalledWith({});
    });
  });
});
