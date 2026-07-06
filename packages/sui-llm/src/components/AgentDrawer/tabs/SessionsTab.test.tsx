import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SessionsTab from './SessionsTab';
import type { ChatSession } from '../../../types';

const sessions: ChatSession[] = [
  { id: 's1', startedAt: '2024-01-01', active: false, hasTranscript: true },
  { id: 's2', startedAt: '2024-01-02', active: true, hasTranscript: false },
];

describe('SessionsTab', () => {
  test('renders sessions list', () => {
    const onSessionSearchChange = jest.fn();
    const onSearch = jest.fn();

    render(
      <SessionsTab
        sessions={sessions}
        selectedSessionId={null}
        sessionSearch=""
        onSessionSearchChange={onSessionSearchChange}
        onSearch={onSearch}
      />
    );

    expect(screen.getByTestId('sessions-tab')).toBeInTheDocument();
    expect(screen.getByTestId('session-item-s1')).toBeInTheDocument();
    expect(screen.getByTestId('session-item-s2')).toBeInTheDocument();
  });

  test('click session with transcript calls onSelectSession', () => {
    const onSessionSearchChange = jest.fn();
    const onSearch = jest.fn();
    const onSelectSession = jest.fn();

    render(
      <SessionsTab
        sessions={sessions}
        selectedSessionId={null}
        sessionSearch=""
        onSessionSearchChange={onSessionSearchChange}
        onSearch={onSearch}
        onSelectSession={onSelectSession}
      />
    );

    const sessionItem = screen.getByTestId('session-item-s1');
    fireEvent.click(sessionItem);
    expect(onSelectSession).toHaveBeenCalledWith('s1');
  });

  test('renders session details when selectedSessionId is truthy', () => {
    const onSessionSearchChange = jest.fn();
    const onSearch = jest.fn();
    const onBack = jest.fn();

    const transcript = [
      { id: 'm1', role: 'user', content: 'hi', timestamp: '2024-01-01' },
    ];

    render(
      <SessionsTab
        sessions={sessions}
        selectedSessionId="s1"
        transcript={transcript}
        sessionSearch=""
        onSessionSearchChange={onSessionSearchChange}
        onSearch={onSearch}
        onBack={onBack}
      />
    );

    expect(screen.getByTestId('session-msg-m1')).toBeInTheDocument();
    expect(screen.getByTestId('sessions-back')).toBeInTheDocument();

    const backButton = screen.getByTestId('sessions-back');
    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalled();
  });
});