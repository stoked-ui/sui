import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveTaskCard } from '../ActiveTaskCard';
import type { SessionModel, TaskModel } from '../../../types';

const idleSession: SessionModel = {
  sessionId: 's1',
  displayStatus: 'idle',
  state: 'idle',
  provider: 'claude-code',
  started_at: '2026-01-01T00:00:00Z',
  branch: 'task/add-button',
};

const dbTask: TaskModel = {
  status: 'in_progress',
  hashShort: 'abc1234',
  source_prompt: 'Objective: add a button\n- Wire the click handler\n- Style it',
  governance: {
    status: 'write_unlocked',
    acceptance_criteria_items: [
      { id: 'c1', description: 'Button renders', passed: true },
      { id: 'c2', description: 'Click fires handler', passed: null },
    ],
  },
};

describe('ActiveTaskCard', () => {
  it('renders the title, work-type badge, and task number', () => {
    render(<ActiveTaskCard title="Add a button" workType="task" sessions={[idleSession]} dbTask={dbTask} />);
    const card = screen.getByTestId('active-task-card');
    expect(card).toHaveAttribute('data-worktype', 'task');
    expect(screen.getByText('Add a button')).toBeInTheDocument();
    expect(screen.getByText('Task')).toBeInTheDocument();
    expect(screen.getByText('abc1234')).toBeInTheDocument();
  });

  it('renders the governance task-stage strip and acceptance criteria', () => {
    render(<ActiveTaskCard title="Add a button" workType="task" sessions={[idleSession]} dbTask={dbTask} />);
    expect(screen.getByTestId('task-stage-strip')).toBeInTheDocument();
    const ac = screen.getByTestId('task-acceptance-criteria');
    expect(ac).toHaveTextContent('Acceptance Criteria (2)');
    expect(ac).toHaveTextContent('Button renders');
    expect(ac).toHaveTextContent('Click fires handler');
  });

  it('renders pre-resolved ship-status chips only when provided', () => {
    const { rerender } = render(
      <ActiveTaskCard title="t" workType="task" sessions={[idleSession]} dbTask={dbTask} />,
    );
    expect(screen.queryByTestId('ship-status-chips')).toBeNull();
    rerender(
      <ActiveTaskCard
        title="t"
        workType="task"
        sessions={[idleSession]}
        dbTask={dbTask}
        shipStatus={{ main: true, stage: false, prod: false }}
      />,
    );
    expect(screen.getByTestId('ship-status-chips')).toBeInTheDocument();
  });

  it('opens the full task via onOpenTask when the number badge is clicked', () => {
    const onOpenTask = jest.fn();
    render(
      <ActiveTaskCard
        title="t"
        workType="task"
        sessions={[idleSession]}
        dbTask={dbTask}
        onOpenTask={onOpenTask}
      />,
    );
    fireEvent.click(screen.getByText('abc1234'));
    expect(onOpenTask).toHaveBeenCalledWith(dbTask);
  });

  it('offers Continue for an idle non-terminal task and fires the callback', () => {
    const onContinue = jest.fn();
    render(
      <ActiveTaskCard
        title="t"
        workType="task"
        sessions={[idleSession]}
        dbTask={dbTask}
        onContinue={onContinue}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continue task' }));
    expect(onContinue).toHaveBeenCalled();
  });
});
