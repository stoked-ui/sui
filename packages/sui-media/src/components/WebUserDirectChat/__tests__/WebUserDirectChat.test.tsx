import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { WebUserDirectChat } from '../WebUserDirectChat';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('WebUserDirectChat', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders a chat shell with the initial support prompt', () => {
    render(<WebUserDirectChat provider="telegram" />);

    expect(screen.getByText('Chat with support')).toBeInTheDocument();
    expect(screen.getByText(/Hi, what do you need help with today/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what do you need help with/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('accepts custom header content', () => {
    render(
      <WebUserDirectChat
        provider="telegram"
        title="Priority support"
        headerText="We usually reply the same business day."
      />,
    );

    expect(screen.getByText('Priority support')).toBeInTheDocument();
    expect(screen.getByText('We usually reply the same business day.')).toBeInTheDocument();
  });

  it('uses step-specific composer settings so only the issue step is multiline', async () => {
    const user = userEvent.setup();
    render(<WebUserDirectChat provider="telegram" />);

    expect(screen.getByLabelText(/what do you need help with/i).tagName).toBe('TEXTAREA');

    await user.type(screen.getByLabelText(/what do you need help with/i), 'Need help');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/what should we call you/i).tagName).toBe('INPUT');
      expect(screen.getByLabelText(/what should we call you/i)).toHaveAttribute(
        'autocomplete',
        'name',
      );
    });

    await user.type(screen.getByLabelText(/what should we call you/i), 'Jane');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/where should we reply/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/where should we reply/i)).toHaveAttribute(
        'autocomplete',
        'email',
      );
    });
  });

  it('moves through the issue, name, and email prompts like a chat', async () => {
    const user = userEvent.setup();
    render(<WebUserDirectChat provider="telegram" />);

    await user.type(
      screen.getByLabelText(/what do you need help with/i),
      'Need help with an integration',
    );
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText('Need help with an integration')).toBeInTheDocument();
      expect(screen.getByLabelText(/what should we call you/i)).toBeInTheDocument();
      expect(screen.getByText(/Got it. What should we call you/i)).toBeInTheDocument();
    });
  });

  it('blocks invalid email addresses in the final step', async () => {
    const user = userEvent.setup();
    render(<WebUserDirectChat provider="telegram" />);

    await user.type(screen.getByLabelText(/what do you need help with/i), 'Need help');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await user.type(screen.getByLabelText(/what should we call you/i), 'Jane');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await user.type(screen.getByLabelText(/where should we reply/i), 'not-an-email');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address so we can reply.'),
      ).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('submits the collected conversation details and shows success on 200', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ status: 'sent' }) });

    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(<WebUserDirectChat provider="telegram" onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/what do you need help with/i), 'Need help with project');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await user.type(screen.getByLabelText(/what should we call you/i), 'Jane Doe');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await user.type(screen.getByLabelText(/where should we reply/i), 'jane@example.com');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/We have your message and will follow up shortly/i),
      ).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Need help with project',
        provider: 'telegram',
      }),
    });
    expect(onSuccess).toHaveBeenCalled();
  });

  it('shows retry controls when the API request fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Server error' }),
    });

    const user = userEvent.setup();
    render(<WebUserDirectChat provider="telegram" />);

    await user.type(screen.getByLabelText(/what do you need help with/i), 'Help');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await user.type(screen.getByLabelText(/what should we call you/i), 'Jane');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await user.type(screen.getByLabelText(/where should we reply/i), 'jane@example.com');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/We could not send that just now. Server error/i),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry send/i })).toBeInTheDocument();
    });
  });

  it('skips asking for name and email when they are prefilled', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ status: 'sent' }) });

    const user = userEvent.setup();
    render(
      <WebUserDirectChat
        provider="telegram"
        initialName="Jane Doe"
        initialEmail="jane@example.com"
      />,
    );

    await user.type(screen.getByLabelText(/what do you need help with/i), 'Need pricing help');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'jane@example.com',
          message: 'Need pricing help',
          provider: 'telegram',
        }),
      });
    });
  });

  it('syncs prefilled user details that arrive before the chat starts', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ status: 'sent' }) });

    const user = userEvent.setup();
    const { rerender } = render(<WebUserDirectChat provider="telegram" />);

    rerender(
      <WebUserDirectChat
        provider="telegram"
        initialName="Jane Doe"
        initialEmail="jane@example.com"
      />,
    );

    await user.type(screen.getByLabelText(/what do you need help with/i), 'Need account help');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'jane@example.com',
          message: 'Need account help',
          provider: 'telegram',
        }),
      });
    });
  });
});
