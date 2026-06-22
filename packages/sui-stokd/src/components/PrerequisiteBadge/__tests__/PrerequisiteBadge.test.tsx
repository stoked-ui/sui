import { render, screen } from '@testing-library/react';
import { PrerequisiteBadge } from '../PrerequisiteBadge';

describe('PrerequisiteBadge', () => {
  it('renders nothing when there are no prerequisites', () => {
    const { container } = render(<PrerequisiteBadge prerequisites={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows a blocked pill while a prerequisite is unsatisfied', () => {
    render(
      <PrerequisiteBadge
        prerequisites={[
          { hash: 'abc', hashShort: 'abc', title: 'Build types', status: 'in_progress', satisfied: false },
        ]}
      />,
    );
    const badge = screen.getByTestId('prereq-badge');
    expect(badge).toHaveAttribute('data-blocked', 'true');
    expect(badge).toHaveTextContent('Blocked — waiting on 1 prerequisite');
    expect(badge).toHaveAttribute('title', expect.stringContaining('Build types'));
  });

  it('shows a met pill once all prerequisites are satisfied', () => {
    render(
      <PrerequisiteBadge
        prerequisites={[{ hash: 'abc', status: 'completed', satisfied: true }]}
      />,
    );
    const badge = screen.getByTestId('prereq-badge');
    expect(badge).toHaveAttribute('data-blocked', 'false');
    expect(badge).toHaveTextContent('Prerequisites met');
  });
});
