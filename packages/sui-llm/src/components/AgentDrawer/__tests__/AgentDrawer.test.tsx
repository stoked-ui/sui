import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AgentDrawer from '../AgentDrawer';
import type { AgentMeta } from '../../../types';
import { DEFAULT_DRAWER_TABS } from '../../../tabs';

const mockAgent: AgentMeta = {
  id: 'hal',
  name: 'Hal',
  desc: 'Chief Operator',
  kind: 'hermes',
  online: true,
};

const mockModels = [
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'gpt-4', label: 'GPT-4' },
];

describe('AgentDrawer', () => {
  test('renders closed when open=false', () => {
    render(
      <AgentDrawer
        open={false}
        agent={mockAgent}
        tabs={DEFAULT_DRAWER_TABS}
        activeTab="chat"
      />
    );

    // When drawer is closed, queryByTestId should return null or not be visible
    const drawer = screen.queryByTestId('agent-drawer');
    expect(drawer).not.toBeInTheDocument();
  });

  test('renders open with agent header', () => {
    const onClose = jest.fn();
    render(
      <AgentDrawer
        open={true}
        agent={mockAgent}
        tabs={DEFAULT_DRAWER_TABS}
        activeTab="chat"
        onClose={onClose}
      />
    );

    expect(screen.getByTestId('agent-drawer')).toBeInTheDocument();

    // Should have agent name
    expect(screen.getByText('Hal')).toBeInTheDocument();

    // Should have tabs
    DEFAULT_DRAWER_TABS.forEach(tab => {
      expect(screen.getByText(tab.label)).toBeInTheDocument();
    });
  });

  test('click close button calls onClose', () => {
    const onClose = jest.fn();
    render(
      <AgentDrawer
        open={true}
        agent={mockAgent}
        tabs={DEFAULT_DRAWER_TABS}
        activeTab="chat"
        onClose={onClose}
      />
    );

    const closeButton = screen.getByTestId('agent-drawer-close');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  test('click tab calls onActiveTabChange', () => {
    const onActiveTabChange = jest.fn();
    render(
      <AgentDrawer
        open={true}
        agent={mockAgent}
        tabs={DEFAULT_DRAWER_TABS}
        activeTab="chat"
        onActiveTabChange={onActiveTabChange}
      />
    );

    const talkTab = screen.getByText('Talk');
    fireEvent.click(talkTab);
    expect(onActiveTabChange).toHaveBeenCalledWith('talk');
  });

  test('click new session button calls onNewSession', () => {
    const onNewSession = jest.fn();
    render(
      <AgentDrawer
        open={true}
        agent={mockAgent}
        tabs={DEFAULT_DRAWER_TABS}
        activeTab="chat"
        onNewSession={onNewSession}
      />
    );

    const newSessionButton = screen.getByTestId('agent-drawer-new-session');
    fireEvent.click(newSessionButton);
    expect(onNewSession).toHaveBeenCalled();
  });

  test('renders model selector for cli agent', () => {
    const cliAgent: AgentMeta = {
      ...mockAgent,
      kind: 'cli',
    };

    const onModelChange = jest.fn();
    render(
      <AgentDrawer
        open={true}
        agent={cliAgent}
        tabs={DEFAULT_DRAWER_TABS}
        activeTab="chat"
        models={mockModels}
        selectedModel="claude-3-5-sonnet"
        onModelChange={onModelChange}
      />
    );

    const modelSelect = screen.getByTestId('agent-drawer-model-select');
    expect(modelSelect).toBeInTheDocument();
  });

  test('renders orientation=bottom', () => {
    render(
      <AgentDrawer
        open={true}
        agent={mockAgent}
        tabs={DEFAULT_DRAWER_TABS}
        activeTab="chat"
        orientation="bottom"
      />
    );

    expect(screen.getByTestId('agent-drawer')).toBeInTheDocument();
  });

  test('renders context meter', () => {
    const contextMeter = {
      usedTokens: 1500,
      windowTokens: 4000,
      transcriptBytes: 2048,
    };

    render(
      <AgentDrawer
        open={true}
        agent={mockAgent}
        tabs={DEFAULT_DRAWER_TABS}
        activeTab="chat"
        contextMeter={contextMeter}
      />
    );

    const contextMeterElement = screen.getByTestId('agent-drawer-context-meter');
    expect(contextMeterElement).toBeInTheDocument();
  });

  test('renders header extra content', () => {
    const headerExtra = <div data-testid="extra-content">Extra</div>;
    render(
      <AgentDrawer
        open={true}
        agent={mockAgent}
        tabs={DEFAULT_DRAWER_TABS}
        activeTab="chat"
        headerExtra={headerExtra}
      />
    );

    expect(screen.getByTestId('extra-content')).toBeInTheDocument();
  });
});