import type { DrawerTab, AgentMeta, GroupedAgents } from './types';

export const DEFAULT_DRAWER_TABS: DrawerTab[] = [
  { id: 'chat', label: 'Chat', desc: '1:1 Interactive chat' },
  { id: 'talk', label: 'Talk', desc: 'Voice communication channel' },
  { id: 'studio', label: 'Studio', desc: 'Creative layout environment' },
  { id: 'sessions', label: 'Sessions', desc: 'Past conversation logs' },
  { id: 'workspace', label: 'Workspace', desc: 'Browse agent files' },
  { id: 'mcp', label: 'MCP', desc: 'Configure server integrations' },
  { id: 'manage', label: 'Manage', desc: 'Edit core profiles' },
  { id: 'goal', label: 'Goal Mode', desc: 'Assign long-running tasks' },
];

export function normalizeAgentId(id: string): string {
  return id.toLowerCase().trim();
}

export function groupAgents(agents: AgentMeta[]): GroupedAgents {
  return {
    hermes: agents.filter(a => a.kind === 'hermes'),
    cli: agents.filter(a => a.kind === 'cli'),
  };
}

export type { GroupedAgents } from './types';