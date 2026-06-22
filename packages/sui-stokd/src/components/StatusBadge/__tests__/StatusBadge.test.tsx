import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders the status text and type', () => {
    render(<StatusBadge status="Working" type="success" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Working');
    expect(badge).toHaveAttribute('data-type', 'success');
  });

  it('omits the dot for neutral type', () => {
    const { container } = render(<StatusBadge status="Idle" type="neutral" />);
    expect(container.querySelector('.sui-status-badge__dot')).toBeNull();
  });

  it('renders a pulsing dot when pulse is set', () => {
    const { container } = render(<StatusBadge status="Working" type="success" pulse />);
    expect(container.querySelector('.sui-status-badge__dot--ping')).toBeInTheDocument();
  });
});
