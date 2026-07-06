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
});
