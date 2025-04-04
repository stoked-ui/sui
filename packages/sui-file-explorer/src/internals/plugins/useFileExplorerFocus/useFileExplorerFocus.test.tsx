import React from 'react';
import { render } from '@testing-library/react';
import FileExplorerComponent from './FileExplorerComponent';

describe('FileExplorerComponent', () => {
  it('renders correctly', async () => {
    const { getByText, queryByTitle } = render(<FileExplorerComponent />);
    expect(getByText('File Explorer')).toBeInTheDocument();
    expect(queryByTitle()).toBeNull();
  });
});