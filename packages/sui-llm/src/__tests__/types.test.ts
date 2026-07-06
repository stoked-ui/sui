import type {
  AgentMeta,
  ChatMessage,
  DrawerTab,
  GoalItem,
  WorkspaceFile,
} from '../types';

describe('Type definitions', () => {
  test('AgentMeta can be instantiated', () => {
    const agent: AgentMeta = {
      id: 'hal',
      name: 'Hal',
      desc: 'Chief Operator',
      kind: 'hermes',
      color: '#00aaff',
      iconUrl: '/icons/hal.svg',
      online: true,
    };
    expect(agent.id).toBe('hal');
    expect(agent.kind).toBe('hermes');
  });

  test('ChatMessage can be instantiated', () => {
    const message: ChatMessage = {
      id: 'msg-1',
      role: 'user',
      content: 'Hello',
      timestamp: '2024-01-01T00:00:00Z',
      agentId: 'hal',
      agentName: 'Hal',
      failed: false,
    };
    expect(message.role).toBe('user');
    expect(message.content).toBe('Hello');
  });

  test('DrawerTab can be instantiated', () => {
    const tab: DrawerTab = {
      id: 'chat',
      label: 'Chat',
      desc: 'Interactive chat',
    };
    expect(tab.id).toBe('chat');
    expect(tab.label).toBe('Chat');
  });

  test('GoalItem can be instantiated', () => {
    const goal: GoalItem = {
      id: 'goal-1',
      title: 'Implement feature',
      status: 'Running',
      progress: 50,
      logs: ['Step 1: Started', 'Step 2: In progress'],
      mtime: '2024-01-01T00:00:00Z',
    };
    expect(goal.status).toBe('Running');
    expect(goal.progress).toBe(50);
  });

  test('WorkspaceFile can be instantiated', () => {
    const file: WorkspaceFile = {
      name: 'README.md',
      isDirectory: false,
      size: 1024,
      mtime: '2024-01-01T00:00:00Z',
      path: '/docs/README.md',
    };
    expect(file.name).toBe('README.md');
    expect(file.isDirectory).toBe(false);
  });
});