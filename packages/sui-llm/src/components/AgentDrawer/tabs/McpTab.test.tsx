import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import McpTab from './McpTab';
import type { McpServer } from '../../../types';

const servers: McpServer[] = [
  { name: 'Google', status: 'Connected', url: 'http://x:1' },
  { name: 'Github', status: 'Idle', url: 'http://x:2' },
];

describe('McpTab', () => {
  test('renders servers list', () => {
    const onNewNameChange = jest.fn();
    const onNewUrlChange = jest.fn();

    render(
      <McpTab
        servers={servers}
        newName=""
        newUrl=""
        onNewNameChange={onNewNameChange}
        onNewUrlChange={onNewUrlChange}
      />
    );

    expect(screen.getByTestId('mcp-tab')).toBeInTheDocument();
    expect(screen.getByTestId('mcp-server-Google')).toBeInTheDocument();
    expect(screen.getByTestId('mcp-server-Github')).toBeInTheDocument();
  });

  test('add button disabled when inputs empty', () => {
    const onNewNameChange = jest.fn();
    const onNewUrlChange = jest.fn();

    render(
      <McpTab
        servers={servers}
        newName=""
        newUrl=""
        onNewNameChange={onNewNameChange}
        onNewUrlChange={onNewUrlChange}
      />
    );

    const addButton = screen.getByTestId('mcp-add-btn');
    expect(addButton).toBeDisabled();
  });

  test('input changes call onChange handlers', () => {
    const onNewNameChange = jest.fn();
    const onNewUrlChange = jest.fn();

    render(
      <McpTab
        servers={servers}
        newName=""
        newUrl=""
        onNewNameChange={onNewNameChange}
        onNewUrlChange={onNewUrlChange}
      />
    );

    // Find inputs by their placeholder text
    const nameInput = screen.getByPlaceholderText('e.g. Memory MCP');
    const urlInput = screen.getByPlaceholderText('e.g. http://localhost:8505');

    fireEvent.change(nameInput, { target: { value: 'X' } });
    expect(onNewNameChange).toHaveBeenCalledWith('X');

    fireEvent.change(urlInput, { target: { value: 'Y' } });
    expect(onNewUrlChange).toHaveBeenCalledWith('Y');
  });
});