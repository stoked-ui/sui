import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatTab from './ChatTab';
import type { ChatMessage } from '../../../types';

const mockMessages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Hello', timestamp: '2024-01-01T00:00:00Z' },
  { id: '2', role: 'assistant', content: 'Hi there!', timestamp: '2024-01-01T00:00:01Z', agentId: 'hal', agentName: 'Hal' },
];

describe('ChatTab', () => {
  test('renders messages', () => {
    const onChatInputChange = jest.fn();
    const onSend = jest.fn();

    render(
      <ChatTab
        messages={mockMessages}
        chatInput=""
        onChatInputChange={onChatInputChange}
        onSend={onSend}
      />
    );

    expect(screen.getByTestId('chat-tab')).toBeInTheDocument();

    mockMessages.forEach(msg => {
      expect(screen.getByTestId(`chat-message-${msg.id}`)).toBeInTheDocument();
    });
  });

  test('renders typing indicator when pending', () => {
    render(
      <ChatTab
        messages={mockMessages}
        chatInput=""
        onChatInputChange={() => {}}
        onSend={() => {}}
        pending={true}
      />
    );

    expect(screen.getByTestId('chat-typing-indicator')).toBeInTheDocument();
  });

  test('input change calls onChatInputChange', () => {
    const onChatInputChange = jest.fn();

    render(
      <ChatTab
        messages={mockMessages}
        chatInput=""
        onChatInputChange={onChatInputChange}
        onSend={() => {}}
      />
    );

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'New message' } });
    expect(onChatInputChange).toHaveBeenCalledWith('New message');
  });

  test('click send calls onSend', () => {
    const onSend = jest.fn();

    render(
      <ChatTab
        messages={mockMessages}
        chatInput="Hello"
        onChatInputChange={() => {}}
        onSend={onSend}
      />
    );

    const sendButton = screen.getByTestId('chat-send');
    fireEvent.click(sendButton);
    expect(onSend).toHaveBeenCalled();
  });

  test('send button disabled when input empty', () => {
    render(
      <ChatTab
        messages={mockMessages}
        chatInput=""
        onChatInputChange={() => {}}
        onSend={() => {}}
      />
    );

    const sendButton = screen.getByTestId('chat-send');
    expect(sendButton).toBeDisabled();
  });

  test('send button enabled when input has content', () => {
    render(
      <ChatTab
        messages={mockMessages}
        chatInput="Hello"
        onChatInputChange={() => {}}
        onSend={() => {}}
      />
    );

    const sendButton = screen.getByTestId('chat-send');
    expect(sendButton).not.toBeDisabled();
  });

  test('renders message attachments (image + file chip)', () => {
    render(
      <ChatTab
        messages={[
          {
            id: 'a1',
            role: 'user',
            content: 'see files',
            timestamp: '2024-01-01T00:00:00Z',
            attachments: [
              { url: 'https://x/y.png', name: 'y.png', kind: 'image' },
              { url: 'https://x/doc.pdf', name: 'doc.pdf', kind: 'file' },
            ],
          },
        ]}
        chatInput=""
        onChatInputChange={() => {}}
        onSend={() => {}}
      />
    );
    expect(screen.getByAltText('y.png')).toBeInTheDocument();
    expect(screen.getByText('doc.pdf')).toBeInTheDocument();
  });

  test('renders legacy images[] when attachments absent', () => {
    render(
      <ChatTab
        messages={[
          { id: 'l1', role: 'user', content: '', timestamp: '2024-01-01T00:00:00Z', images: ['data:image/png;base64,AAA'] },
        ]}
        chatInput=""
        onChatInputChange={() => {}}
        onSend={() => {}}
      />
    );
    expect(screen.getByAltText('image')).toBeInTheDocument();
  });

  test('copy button calls onCopyMessage override', () => {
    const onCopyMessage = jest.fn();
    render(
      <ChatTab
        messages={mockMessages}
        chatInput=""
        onChatInputChange={() => {}}
        onSend={() => {}}
        onCopyMessage={onCopyMessage}
      />
    );
    fireEvent.click(screen.getAllByTestId('chat-copy')[0]);
    expect(onCopyMessage).toHaveBeenCalledWith(mockMessages[0]);
  });

  test('attach button + file input call onAttachFiles', () => {
    const onAttachFiles = jest.fn();
    render(
      <ChatTab
        messages={mockMessages}
        chatInput=""
        onChatInputChange={() => {}}
        onSend={() => {}}
        onAttachFiles={onAttachFiles}
      />
    );
    expect(screen.getByTestId('chat-attach')).toBeInTheDocument();
    const file = new File(['x'], 'note.txt', { type: 'text/plain' });
    fireEvent.change(screen.getByTestId('chat-file-input'), { target: { files: [file] } });
    expect(onAttachFiles).toHaveBeenCalledTimes(1);
    expect(onAttachFiles.mock.calls[0][0][0]).toBe(file);
  });

  test('no attach button when onAttachFiles omitted', () => {
    render(
      <ChatTab
        messages={mockMessages}
        chatInput=""
        onChatInputChange={() => {}}
        onSend={() => {}}
      />
    );
    expect(screen.queryByTestId('chat-attach')).not.toBeInTheDocument();
  });

  test('staged attachments render with remove control', () => {
    const onRemoveAttachment = jest.fn();
    render(
      <ChatTab
        messages={mockMessages}
        chatInput=""
        onChatInputChange={() => {}}
        onSend={() => {}}
        onAttachFiles={() => {}}
        onRemoveAttachment={onRemoveAttachment}
        stagedAttachments={[{ url: 'blob:1', name: 'a.txt', type: 'text/plain' }]}
      />
    );
    expect(screen.getByTestId('chat-staged')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Remove attachment'));
    expect(onRemoveAttachment).toHaveBeenCalledWith(0);
  });

  test('send enabled with staged attachment even when input empty', () => {
    render(
      <ChatTab
        messages={mockMessages}
        chatInput=""
        onChatInputChange={() => {}}
        onSend={() => {}}
        onAttachFiles={() => {}}
        stagedAttachments={[{ url: 'blob:1', name: 'a.txt', type: 'text/plain' }]}
      />
    );
    expect(screen.getByTestId('chat-send')).not.toBeDisabled();
  });
});
