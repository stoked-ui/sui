import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveSessionCard } from '../InteractiveSessionCard';
import type { MessageModel, SessionModel } from '../../../types';

const session: SessionModel = {
  sessionId: 's1',
  displayStatus: 'working',
  provider: 'claude-code',
  started_at: '2026-01-01T00:00:00Z',
};

describe('InteractiveSessionCard', () => {
  it('renders an empty-state when there are no conversation entries', () => {
    render(<InteractiveSessionCard title="Plan the thing" sessions={[session]} />);
    expect(screen.getByTestId('interactive-session-card')).toBeInTheDocument();
    expect(screen.getByText('Waiting for conversation events.')).toBeInTheDocument();
  });

  it('renders conversation bubbles from session messages', () => {
    const messages = new Map<string, MessageModel[]>([
      [
        's1',
        [
          { message_id: 'm1', message_type: 'user_prompt', content: 'Add a button', created_at: '2026-01-01T00:00:01Z' },
          { message_id: 'm2', message_type: 'agent_response', content: 'Done!', created_at: '2026-01-01T00:00:02Z' },
        ],
      ],
    ]);
    render(<InteractiveSessionCard title="Button work" sessions={[session]} sessionMessages={messages} />);
    expect(screen.getByText('Add a button')).toBeInTheDocument();
    expect(screen.getByText('Done!')).toBeInTheDocument();
    expect(screen.getByText('Prompt')).toBeInTheDocument();
    expect(screen.getByText('Response')).toBeInTheDocument();
  });

  it('invokes onCancel with the engaged session ids', () => {
    const onCancel = jest.fn();
    render(<InteractiveSessionCard title="Plan" sessions={[session]} onCancel={onCancel} />);
    fireEvent.click(screen.getByLabelText('Stop this session'));
    expect(onCancel).toHaveBeenCalledWith(['s1']);
  });
});
