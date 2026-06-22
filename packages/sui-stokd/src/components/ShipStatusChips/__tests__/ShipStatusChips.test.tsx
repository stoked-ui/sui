import { render, screen } from '@testing-library/react';
import { ShipStatusChips } from '../ShipStatusChips';

describe('ShipStatusChips', () => {
  it('always renders all three environment chips', () => {
    render(<ShipStatusChips status={{ main: false, stage: false, prod: false }} />);
    expect(screen.getByTestId('ship-status-chip-main')).toBeInTheDocument();
    expect(screen.getByTestId('ship-status-chip-stage')).toBeInTheDocument();
    expect(screen.getByTestId('ship-status-chip-prod')).toBeInTheDocument();
  });

  it('marks achieved environments and leaves unachieved ones pending', () => {
    render(<ShipStatusChips status={{ main: true, stage: false, prod: false }} />);
    expect(screen.getByTestId('ship-status-chip-main')).toHaveAttribute('data-state', 'achieved');
    expect(screen.getByTestId('ship-status-chip-stage')).toHaveAttribute('data-state', 'pending');
    expect(screen.getByTestId('ship-status-chip-prod')).toHaveAttribute('data-state', 'pending');
  });

  it('uses a provenance-derived hover title', () => {
    render(<ShipStatusChips status={{ main: true, stage: false, prod: false }} />);
    expect(screen.getByTestId('ship-status-chip-main')).toHaveAttribute('title', 'Shipped to main');
    expect(screen.getByTestId('ship-status-chip-prod')).toHaveAttribute('title', 'Not yet on prod');
  });
});
