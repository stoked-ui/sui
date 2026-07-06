import React from 'react';
import {
  Box,
  Chip,
  Divider,
  Stack,
  styled
} from '@mui/material';
import type { AgentMeta, MenuOrientation } from '../../types';
import { groupAgents } from '../../tabs';

export interface AgentMenuProps {
  agents: AgentMeta[];
  orientation?: MenuOrientation;
  selectedAgentId?: string;
  onSelectAgent?: (id: string) => void;
  groups?: boolean;
  statusIndicator?: React.ReactNode;
  className?: string;
  renderAgentIcon?: (agent: AgentMeta) => React.ReactNode;
}

const AgentChip = styled(Chip)(({ theme }) => ({
  height: 36,
  borderRadius: 18,
  paddingLeft: 8,
  paddingRight: 8,
  '&.MuiChip-selected': {
    backgroundColor: theme.palette.primary.dark,
    borderColor: theme.palette.primary.main,
  },
}));

const AgentStack = styled(Stack)<{ orientation: MenuOrientation }>(({ orientation }) => ({
  flexDirection: orientation === 'vertical' ? 'column' : 'row',
  flexWrap: 'wrap',
  gap: 8,
}));

const AgentMenu: React.FC<AgentMenuProps> = ({
  agents,
  orientation = 'horizontal',
  selectedAgentId,
  onSelectAgent,
  groups = true,
  statusIndicator,
  className,
  renderAgentIcon,
}) => {
  const grouped = groups ? groupAgents(agents) : { hermes: agents, cli: [] };

  const renderAgentChips = (agentList: AgentMeta[]) =>
    agentList.map((agent) => {
      const selected = selectedAgentId === agent.id;
      const icon = renderAgentIcon ? renderAgentIcon(agent) : (
        agent.iconUrl ? (
          <Box
            component="img"
            src={agent.iconUrl}
            alt={agent.name}
            sx={{ width: 20, height: 20, borderRadius: '50%' }}
          />
        ) : undefined
      );

      return (
        <AgentChip
          key={agent.id}
          data-testid={`agent-chip-${agent.id}`}
          data-selected={selected ? 'true' : undefined}
          label={agent.name}
          icon={icon as React.ReactElement | undefined}
          size="small"
          color={selected ? 'primary' : 'default'}
          variant={selected ? 'outlined' : 'filled'}
          onClick={() => onSelectAgent?.(agent.id)}
          sx={{
            borderColor: selected ? 'cyan' : 'transparent',
            ...(agent.online && {
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                backgroundColor: '#4caf50',
                borderRadius: '50%',
              },
            }),
          }}
        />
      );
    });

  return (
    <Box
      data-testid="agent-menu"
      className={className}
      sx={{
        p: 1,
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        alignItems: 'center',
      }}
    >
      <AgentStack orientation={orientation}>
        {groups ? (
          <>
            {renderAgentChips(grouped.hermes)}
            {grouped.hermes.length > 0 && grouped.cli.length > 0 && (
              <Divider
                orientation={orientation === 'vertical' ? 'horizontal' : 'vertical'}
                flexItem
                sx={{
                  mx: orientation === 'vertical' ? 0 : 2,
                  my: orientation === 'vertical' ? 2 : 0,
                }}
              />
            )}
            {renderAgentChips(grouped.cli)}
          </>
        ) : (
          renderAgentChips(agents)
        )}
      </AgentStack>

      {statusIndicator && (
        <Box sx={{
          ml: orientation === 'horizontal' ? 2 : 0,
          mt: orientation === 'vertical' ? 1 : 0,
        }}>
          {statusIndicator}
        </Box>
      )}
    </Box>
  );
};

export default AgentMenu;