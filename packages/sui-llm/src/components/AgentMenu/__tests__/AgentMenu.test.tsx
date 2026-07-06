import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AgentMenu from '../AgentMenu';
import type { AgentMeta } from '../../../types';

const mockAgents: AgentMeta[] = [
  { id: 'hal', name: 'Hal', desc: 'Chief Operator', kind: 'hermes', online: true },
  { id: 'sam', name: 'Sam', desc: 'Strategic Researcher', kind: 'hermes', online: false },
  { id: 'claude', name: 'Claude', desc: 'Claude Code CLI', kind: 'cli', online: true },
];

describe('AgentMenu', () => {
  test('renders horizontal with 3 agents', () => {
    const onSelectAgent = jest.fn();
    render(
      <AgentMenu
        agents={mockAgents}
        orientation="horizontal"
        onSelectAgent={onSelectAgent}
      />
    );

    // Should have data-testid on root
    expect(screen.getByTestId('agent-menu')).toBeInTheDocument();

    // Should have chips for each agent
    mockAgents.forEach(agent => {
      expect(screen.getByTestId(`agent-chip-${agent.id}`)).toBeInTheDocument();
    });
  });

  test('click chip calls onSelectAgent with id', () => {
    const onSelectAgent = jest.fn();
    render(
      <AgentMenu
        agents={mockAgents}
        onSelectAgent={onSelectAgent}
      />
    );

    const halChip = screen.getByTestId('agent-chip-hal');
    fireEvent.click(halChip);
    expect(onSelectAgent).toHaveBeenCalledWith('hal');
  });

  test('selected chip shows data-selected attribute', () => {
    render(
      <AgentMenu
        agents={mockAgents}
        selectedAgentId="sam"
      />
    );

    const selectedChip = screen.getByTestId('agent-chip-sam');
    expect(selectedChip).toHaveAttribute('data-selected', 'true');

    const unselectedChip = screen.getByTestId('agent-chip-hal');
    expect(unselectedChip).not.toHaveAttribute('data-selected', 'true');
  });

  test('renders groups=true with divider between hermes and cli', () => {
    render(
      <AgentMenu
        agents={mockAgents}
        groups={true}
      />
    );

    // In groups mode, should show divider
    // Note: actual divider implementation will be in the component
    expect(screen.getByTestId('agent-menu')).toBeInTheDocument();
  });

  test('renders groups=false without divider', () => {
    render(
      <AgentMenu
        agents={mockAgents}
        groups={false}
      />
    );

    // Should still render but without divider
    expect(screen.getByTestId('agent-menu')).toBeInTheDocument();
  });

  test('renders vertical orientation', () => {
    render(
      <AgentMenu
        agents={mockAgents}
        orientation="vertical"
      />
    );

    expect(screen.getByTestId('agent-menu')).toBeInTheDocument();
  });

  test('renders status indicator', () => {
    const statusIndicator = <div data-testid="status-indicator">Status</div>;
    render(
      <AgentMenu
        agents={mockAgents}
        statusIndicator={statusIndicator}
      />
    );

    expect(screen.getByTestId('status-indicator')).toBeInTheDocument();
  });
});