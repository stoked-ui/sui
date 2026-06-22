import { render, screen } from '@testing-library/react';
import { PipelineShellCard } from '../PipelineShellCard';

describe('PipelineShellCard', () => {
  it('renders the title, project badge, and all five pipeline stages', () => {
    render(<PipelineShellCard title="Build the flywheel" projectNumber={42} />);
    const card = screen.getByTestId('pipeline-shell-card');
    expect(card).toBeInTheDocument();
    expect(screen.getByText('Build the flywheel')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    for (const name of ['Analysis', 'Planning', 'Implementation', 'Validation', 'Integration']) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('marks the current stage in-progress only when the session is engaged', () => {
    const { rerender } = render(
      <PipelineShellCard title="t" displayStatus="working" currentStage="planning" />,
    );
    const planningStep = screen.getByText('Planning').closest('.sui-psc__step');
    expect(planningStep).toHaveAttribute('data-status', 'in_progress');

    rerender(<PipelineShellCard title="t" displayStatus="idle" currentStage="planning" />);
    const planningStepIdle = screen.getByText('Planning').closest('.sui-psc__step');
    expect(planningStepIdle).toHaveAttribute('data-status', 'pending');
  });

  it('shows an idle-specific note when idle', () => {
    render(<PipelineShellCard title="t" displayStatus="idle" />);
    expect(screen.getByText(/idle and waiting for the next prompt/)).toBeInTheDocument();
  });
});
