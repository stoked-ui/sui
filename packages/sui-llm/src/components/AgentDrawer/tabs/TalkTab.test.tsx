import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TalkTab from './TalkTab';

describe('TalkTab', () => {
  test('renders idle state', () => {
    const onToggleVoice = jest.fn();
    render(
      <TalkTab
        voiceState="idle"
        onToggleVoice={onToggleVoice}
        voiceLogs={[]}
      />
    );

    expect(screen.getByTestId('talk-tab')).toBeInTheDocument();
    expect(screen.getByTestId('talk-mic-button')).toBeInTheDocument();
  });

  test('click mic button calls onToggleVoice', () => {
    const onToggleVoice = jest.fn();
    render(
      <TalkTab
        voiceState="idle"
        onToggleVoice={onToggleVoice}
        voiceLogs={[]}
      />
    );

    const micButton = screen.getByTestId('talk-mic-button');
    fireEvent.click(micButton);
    expect(onToggleVoice).toHaveBeenCalled();
  });

  test('renders voice logs', () => {
    const voiceLogs = ['Listening...', 'Processing...', 'Speaking...'];
    render(
      <TalkTab
        voiceState="listening"
        onToggleVoice={() => {}}
        voiceLogs={voiceLogs}
      />
    );

    voiceLogs.forEach((log, index) => {
      expect(screen.getByTestId(`talk-log-${index}`)).toBeInTheDocument();
    });
  });
});
