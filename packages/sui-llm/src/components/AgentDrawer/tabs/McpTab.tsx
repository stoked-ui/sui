import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  TextField,
  Button,
  Chip,
  Grid,
} from '@mui/material';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import type { McpServer } from '../../../types';

export interface McpTabProps {
  servers: McpServer[];
  newName: string;
  newUrl: string;
  onNewNameChange: (v: string) => void;
  onNewUrlChange: (v: string) => void;
  onAddServer?: () => void;
  className?: string;
}

const McpTab: React.FC<McpTabProps> = ({
  servers,
  newName,
  newUrl,
  onNewNameChange,
  onNewUrlChange,
  onAddServer,
  className,
}) => {
  return (
    <Stack
      className={className}
      data-testid="mcp-tab"
      spacing={4}
      sx={{
        p: 3,
        bgcolor: '#0b0c10',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 2,
      }}
    >
      {/* Section 1: Active MCP Connections */}
      <Box>
        <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 3 }}>
          Active MCP Connections
        </Typography>
        {servers.length === 0 ? (
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', p: 2 }}>
            No MCP servers connected.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {servers.map((srv) => (
              <Grid item xs={12} sm={6} key={srv.name}>
                <Paper
                  data-testid={`mcp-server-${srv.name}`}
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <SettingsInputComponentIcon
                      sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    />
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {srv.name}
                    </Typography>
                  </Stack>
                  <Typography
                    fontFamily="monospace"
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}
                  >
                    {srv.url}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={srv.status}
                      size="small"
                      color={srv.status === 'Connected' ? 'success' : 'default'}
                      sx={{
                        '& .MuiChip-icon': {
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor:
                            srv.status === 'Connected' ? '#2ecc71' : 'rgba(255,255,255,0.3)',
                        },
                      }}
                      icon={<span />}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Section 2: Register New MCP Connection */}
      <Paper
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          onAddServer?.();
        }}
        sx={{
          p: 3,
          bgcolor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 3 }}>
          Register New MCP Connection
        </Typography>
        <Stack spacing={2}>
          <TextField
            value={newName}
            onChange={(e) => onNewNameChange(e.target.value)}
            placeholder="e.g. Memory MCP"
            label="Server Name"
            size="small"
            data-testid="mcp-name-input"
            sx={{
              '& .MuiInputBase-root': {
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                color: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          />
          <TextField
            value={newUrl}
            onChange={(e) => onNewUrlChange(e.target.value)}
            placeholder="e.g. http://localhost:8505"
            label="Server URL"
            size="small"
            data-testid="mcp-url-input"
            sx={{
              '& .MuiInputBase-root': {
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                color: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          />
          <Button
            type="submit"
            disabled={!newName.trim() || !newUrl.trim()}
            data-testid="mcp-add-btn"
            variant="contained"
            sx={{ alignSelf: 'flex-start', mt: 1 }}
          >
            Establish Connection
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default McpTab;