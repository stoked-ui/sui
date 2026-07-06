import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WorkspaceTab from './WorkspaceTab';
import type { WorkspaceFile } from '../../../types';

const files: WorkspaceFile[] = [
  { name: 'a.txt', isDirectory: false, size: 10, mtime: '2024-01-01', path: '/x/a.txt' },
  { name: 'dir', isDirectory: true, size: 0, mtime: '2024-01-01', path: '/x/dir' },
];

describe('WorkspaceTab', () => {
  test('renders files list', () => {
    render(<WorkspaceTab files={files} />);

    expect(screen.getByTestId('workspace-tab')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-file-a.txt')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-file-dir')).toBeInTheDocument();
  });

  test('click non-directory file calls onSelectFile', () => {
    const onSelectFile = jest.fn();

    render(<WorkspaceTab files={files} onSelectFile={onSelectFile} />);

    const fileItem = screen.getByTestId('workspace-file-a.txt');
    fireEvent.click(fileItem);
    expect(onSelectFile).toHaveBeenCalledWith(files[0]);
  });

  test('renders file content when selectedFile is set', () => {
    const onBack = jest.fn();

    render(
      <WorkspaceTab
        files={files}
        selectedFile={files[0]}
        selectedFileContent="hello"
        onBack={onBack}
      />
    );

    expect(screen.getByTestId('workspace-file-content')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-back')).toBeInTheDocument();

    const backButton = screen.getByTestId('workspace-back');
    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalled();
  });
});