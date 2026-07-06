import React, { useEffect } from 'react';
import {
  Drawer as MuiDrawer,
  Box,
  Typography,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Select,
  MenuItem,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import type { AgentMeta, DrawerOrientation, DrawerTabId, ContextMeterState, ModelOption, DrawerTab } from '../../types';
import { DEFAULT_DRAWER_TABS } from '../../tabs';

export interface AgentDrawerProps {
  open: boolean;
  orientation?: DrawerOrientation;
  agent: AgentMeta | null;
  tabs?: DrawerTab[];
  activeTab: DrawerTabId;
  onActiveTabChange?: (id: DrawerTabId) => void;
  onClose?: () => void;
  onActivePanelChange?: (open: boolean) => void;
  contextScope?: string;
  contextMeter?: ContextMeterState;
  models?: ModelOption[];
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  onNewSession?: () => void;
  newSessionPending?: boolean;
  headerExtra?: React.ReactNode;
  children?: React.ReactNode;
}

const AgentDrawer: React.FC<AgentDrawerProps> = ({
  open,
  orientation = 'right',
  agent,
  tabs = DEFAULT_DRAWER_TABS,
  activeTab,
  onActiveTabChange,
  onClose,
  onActivePanelChange,
  contextScope = 'hq',
  contextMeter,
  models,
  selectedModel,
  onModelChange,
  onNewSession,
  newSessionPending,
  headerExtra,
  children,
}) => {
  useEffect(() => {
    if (onActivePanelChange) {
      onActivePanelChange(open && !!agent);
    }
  }, [open, agent, onActivePanelChange]);

  const anchor = orientation === 'bottom' ? 'bottom' : 'right';
  const drawerWidth = orientation === 'bottom' ? '100%' : 'clamp(300px, 90vw, 900px)';
  const drawerHeight = orientation === 'bottom' ? '85vh' : '100%';

  const getContextPercent = () => {
    if (!contextMeter?.usedTokens || !contextMeter?.windowTokens) return 0;
    return Math.round((contextMeter.usedTokens / contextMeter.windowTokens) * 100);
  };

  if (!open || !agent) {
    return null;
  }

  return (
    <MuiDrawer
      data-testid="agent-drawer"
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: '#0d1015',
          color: '#ffffff',
          width: drawerWidth,
          height: drawerHeight,
          maxHeight: drawerHeight,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: orientation === 'right' ? '1px solid rgba(255, 255, 255, 0.1)' : undefined,
          borderTop: orientation === 'bottom' ? '1px solid rgba(255, 255, 255, 0.1)' : undefined,
          borderRadius: orientation === 'bottom' ? '16px 16px 0 0' : undefined,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge
            color={agent.online ? 'success' : 'default'}
            variant="dot"
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Avatar
              sx={{
                bgcolor: agent.color || 'primary.main',
                width: 40,
                height: 40,
              }}
            >
              {agent.iconUrl ? (
                <img
                  src={agent.iconUrl}
                  alt={agent.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                />
              ) : (
                agent.name.charAt(0).toUpperCase()
              )}
            </Avatar>
          </Badge>

          <Box>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {agent.name}
              <Box
                component="span"
                sx={{
                  px: 1,
                  py: 0.5,
                  fontSize: '0.75rem',
                  borderRadius: '4px',
                  backgroundColor: agent.kind === 'hermes' ? 'primary.dark' : 'secondary.dark',
                }}
              >
                {agent.kind === 'hermes' ? 'Hermes' : 'CLI'}
              </Box>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {agent.desc}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {contextMeter && (
            <Box
              data-testid="agent-drawer-context-meter"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <LinearProgress
                variant="determinate"
                value={getContextPercent()}
                sx={{ width: 60 }}
              />
              <Typography variant="caption">
                {getContextPercent()}%
                {contextMeter.transcriptBytes > 0 && (
                  <span> • {Math.round(contextMeter.transcriptBytes / 1024)}kB</span>
                )}
              </Typography>
            </Box>
          )}

          {agent.kind === 'cli' && models && onModelChange && (
            <Select
              data-testid="agent-drawer-model-select"
              size="small"
              value={selectedModel || models[0]?.id || ''}
              onChange={(e) => onModelChange(e.target.value)}
              sx={{
                minWidth: 120,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
              }}
            >
              {models.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.label}
                </MenuItem>
              ))}
            </Select>
          )}

          {onNewSession && (
            <Button
              data-testid="agent-drawer-new-session"
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onNewSession}
              disabled={newSessionPending}
            >
              {newSessionPending ? 'Starting...' : 'New Session'}
            </Button>
          )}

          {headerExtra}

          <IconButton
            data-testid="agent-drawer-close"
            onClick={onClose}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => onActiveTabChange?.(value as DrawerTabId)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              color: 'text.secondary',
              '&.Mui-selected': { color: 'primary.main' },
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              label={tab.label}
              value={tab.id}
              sx={{ textTransform: 'none' }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
        }}
      >
        {children}
      </Box>
    </MuiDrawer>
  );
};

export default AgentDrawer;