# @stoked-ui/llm

Stoked UI LLM agent UI components — host-agnostic React components for LLM agent menus, drawers, and chat surfaces.

## Installation

```bash
npm install @stoked-ui/llm
```

## Usage

```tsx
import { AgentMenu, AgentDrawer } from '@stoked-ui/llm';
import { DEFAULT_DRAWER_TABS } from '@stoked-ui/llm/tabs';

// Example usage with sample agents
const agents = [
  { id: 'hal', name: 'Hal', desc: 'Chief Operator', kind: 'hermes' as const },
  { id: 'claude', name: 'Claude', desc: 'Claude Code CLI', kind: 'cli' as const },
];

function Example() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  return (
    <>
      <AgentMenu
        agents={agents}
        selectedAgentId={selectedAgentId}
        onSelectAgent={(id) => {
          setSelectedAgentId(id);
          setDrawerOpen(true);
        }}
      />
      
      <AgentDrawer
        open={drawerOpen}
        agent={agents.find(a => a.id === selectedAgentId) || null}
        tabs={DEFAULT_DRAWER_TABS}
        activeTab="chat"
        onActiveTabChange={(tab) => console.log('Tab changed:', tab)}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
```

## Components

- **AgentMenu**: Horizontal or vertical menu for selecting agents
- **AgentDrawer**: Side/bottom drawer with tabs for agent interactions
- **ChatTab**: 1:1 interactive chat interface
- **TalkTab**: Voice communication channel
- **StudioTab**: Creative layout environment
- **SessionsTab**: Past conversation logs
- **WorkspaceTab**: Browse agent files
- **McpTab**: Configure server integrations
- **ManageTab**: Edit core profiles
- **GoalTab**: Assign long-running tasks

## License

MIT