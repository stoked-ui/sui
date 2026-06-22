import { render, screen } from '@testing-library/react';
import { ProviderBadge, normalizeProviderId, providerLabel } from '../ProviderBadge';

describe('normalizeProviderId', () => {
  it('maps aliases to canonical provider ids', () => {
    expect(normalizeProviderId('claude-code')).toBe('claude');
    expect(normalizeProviderId('anthropic')).toBe('claude');
    expect(normalizeProviderId('gpt-5')).toBe('codex');
    expect(normalizeProviderId('gemini-cli')).toBe('gemini');
    expect(normalizeProviderId('xai')).toBe('grok');
    expect(normalizeProviderId('ollama')).toBe('local');
    expect(normalizeProviderId('')).toBe('unknown');
  });

  it('does not treat substrings like "example" as amp', () => {
    expect(normalizeProviderId('example')).toBe('unknown');
    expect(normalizeProviderId('amp')).toBe('amp');
  });
});

describe('ProviderBadge', () => {
  it('renders the resolved provider label and data-provider', () => {
    render(<ProviderBadge provider="claude-code" />);
    const badge = screen.getByTestId('provider-badge');
    expect(badge).toHaveAttribute('data-provider', 'claude');
    expect(badge).toHaveTextContent(providerLabel('claude-code'));
  });

  it('renders a letter avatar when no logoBaseUrl is provided', () => {
    const { container } = render(<ProviderBadge provider="claude" />);
    expect(container.querySelector('.sui-provider-badge__avatar')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders a logo image when logoBaseUrl is provided', () => {
    render(<ProviderBadge provider="claude" logoBaseUrl="/provider-logos" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/provider-logos/claude.svg');
  });
});
