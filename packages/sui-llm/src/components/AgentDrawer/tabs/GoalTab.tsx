import React from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import type { GoalItem } from '../../../types';

export interface GoalTabProps {
  goals: GoalItem[];
  newGoalTitle: string;
  onNewGoalTitleChange: (v: string) => void;
  onAddGoal?: () => void;
  className?: string;
}

const GoalTab: React.FC<GoalTabProps> = ({
  goals,
  newGoalTitle,
  onNewGoalTitleChange,
  onAddGoal,
  className,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'success';
      case 'Running':
        return 'info';
      case 'Failed':
        return 'error';
      case 'Planning':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Stack
      className={className}
      data-testid="goal-tab"
      spacing={4}
      sx={{
        p: 3,
        bgcolor: '#0b0c10',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 2,
      }}
    >
      {/* Form: Assign Long-Running Mission Goal */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          onAddGoal?.();
        }}
        sx={{
          p: 3,
          bgcolor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 3 }}>
          Assign Long-Running Mission Goal
        </Typography>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <TextField
            value={newGoalTitle}
            onChange={(e) => onNewGoalTitleChange(e.target.value)}
            placeholder="e.g. Scrape new tech postings..."
            size="small"
            data-testid="goal-title-input"
            sx={{
              flexGrow: 1,
              '& .MuiInputBase-root': {
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                color: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          />
          <Button
            type="submit"
            disabled={!newGoalTitle.trim()}
            variant="contained"
            data-testid="goal-add-button"
          >
            Execute Goal
          </Button>
        </Stack>
      </Box>

      {/* Section: Live Agent Missions */}
      <Box>
        <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 3 }}>
          Live Agent Missions
        </Typography>
        {goals.length === 0 ? (
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', p: 2 }}>
            No active goals.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {goals.map((goal) => (
              <Paper
                key={goal.id}
                data-testid={`goal-item-${goal.id}`}
                sx={{
                  p: 3,
                  bgcolor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 2,
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {goal.title}
                    </Typography>
                    <Chip
                      label={goal.status}
                      size="small"
                      color={getStatusColor(goal.status)}
                    />
                  </Stack>
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={goal.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mt: 1 }}
                    >
                      {goal.progress}% complete
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  >
                    Last updated: {goal.mtime}
                  </Typography>
                  {goal.logs && goal.logs.length > 0 && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        whiteSpace: 'pre-wrap',
                        overflow: 'auto',
                        maxHeight: 120,
                      }}
                      data-testid={`goal-logs-${goal.id}`}
                    >
                      {goal.logs.join('\n')}
                    </Box>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

export default GoalTab;