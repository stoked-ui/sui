import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ManageTab from './ManageTab';

describe('ManageTab', () => {
  test('renders manage tab with select and text field', () => {
    const onSelectFile = jest.fn();
    const onFileContentChange = jest.fn();

    render(
      <ManageTab
        selectedFile="SOUL.md"
        onSelectFile={onSelectFile}
        fileContent="hi"
        onFileContentChange={onFileContentChange}
        fileOptions={[{ value: 'SOUL.md', label: 'SOUL.md (X)' }]}
      />
    );

    expect(screen.getByTestId('manage-tab')).toBeInTheDocument();
    expect(screen.getByTestId('manage-file-select')).toBeInTheDocument();
    expect(screen.getByTestId('manage-file-content')).toBeInTheDocument();
  });

  test('text change calls onFileContentChange', () => {
    const onSelectFile = jest.fn();
    const onFileContentChange = jest.fn();

    render(
      <ManageTab
        selectedFile="SOUL.md"
        onSelectFile={onSelectFile}
        fileContent="hi"
        onFileContentChange={onFileContentChange}
        fileOptions={[{ value: 'SOUL.md', label: 'SOUL.md (X)' }]}
      />
    );

    // Get the textarea by its role as textbox
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'new content' } });
    expect(onFileContentChange).toHaveBeenCalledWith('new content');
  });

  test('click save button calls onSave', () => {
    const onSelectFile = jest.fn();
    const onFileContentChange = jest.fn();
    const onSave = jest.fn();

    render(
      <ManageTab
        selectedFile="SOUL.md"
        onSelectFile={onSelectFile}
        fileContent="hi"
        onFileContentChange={onFileContentChange}
        onSave={onSave}
        fileOptions={[{ value: 'SOUL.md', label: 'SOUL.md (X)' }]}
      />
    );

    const saveButton = screen.getByTestId('manage-save');
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalled();
  });
});