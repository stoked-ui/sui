import { DEFAULT_DRAWER_TABS, groupAgents, normalizeAgentId } from '../tabs';
import type { AgentMeta } from '../types';

describe('tabs utilities', () => {
  test('DEFAULT_DRAWER_TABS has 8 entries', () => {
    expect(DEFAULT_DRAWER_TABS).toHaveLength(8);
  });

  test('DEFAULT_DRAWER_TABS has correct ids', () => {
    const ids = DEFAULT_DRAWER_TABS.map(tab => tab.id);
    expect(ids).toEqual([
      'chat',
      'talk',
      'studio',
      'sessions',
      'workspace',
      'mcp',
      'manage',
      'goal',
    ]);
  });

  test('groupAgents splits hermes and cli', () => {
    const agents: AgentMeta[] = [
      { id: 'hal', name: 'Hal', desc: 'Chief', kind: 'hermes' },
      { id: 'sam', name: 'Sam', desc: 'Researcher', kind: 'hermes' },
      { id: 'claude', name: 'Claude', desc: 'Claude CLI', kind: 'cli' },
      { id: 'gemini', name: 'Gemini', desc: 'Gemini CLI', kind: 'cli' },
    ];

    const grouped = groupAgents(agents);
    expect(grouped.hermes).toHaveLength(2);
    expect(grouped.cli).toHaveLength(2);
    expect(grouped.hermes[0].id).toBe('hal');
    expect(grouped.cli[0].id).toBe('claude');
  });

  test('normalizeAgentId lowercases and trims', () => {
    expect(normalizeAgentId(' HAL ')).toBe('hal');
    expect(normalizeAgentId('Claude')).toBe('claude');
    expect(normalizeAgentId('Gemini ')).toBe('gemini');
  });
});