import { render, screen } from '@testing-library/react';
import { LiveTimer } from '../LiveTimer';

describe('LiveTimer', () => {
  it('renders a fixed base offset when paused with no start time', () => {
    render(<LiveTimer startTime={null} baseMs={65000} paused locale="en-US" />);
    // 65s -> "1 min 5 sec"
    expect(screen.getByText(/1 min/)).toBeInTheDocument();
    expect(screen.getByText(/5 sec/)).toBeInTheDocument();
  });

  it('passes through a className', () => {
    const { container } = render(
      <LiveTimer startTime={null} baseMs={0} paused className="my-timer" locale="en-US" />,
    );
    expect(container.querySelector('span.my-timer')).toBeInTheDocument();
  });
});
