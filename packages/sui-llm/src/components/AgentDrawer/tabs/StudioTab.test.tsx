import React from 'react';
import { render, screen } from '@testing-library/react';
import StudioTab from './StudioTab';

describe('StudioTab', () => {
  test('renders studio tab with title', () => {
    render(<StudioTab />);
    expect(screen.getByTestId('studio-tab')).toBeInTheDocument();
    expect(screen.getByText('Agent Studio')).toBeInTheDocument();
  });

  test('renders Chip components with offline/standby labels', () => {
    render(<StudioTab />);
    expect(screen.getByText('Node Grid: Offline')).toBeInTheDocument();
    expect(screen.getByText('Layout Canvas: Standby')).toBeInTheDocument();
  });
});