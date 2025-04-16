import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { EventDetails } from '../../types/github';

interface ProjectsV2ColumnEventProps {
  event: EventDetails;
}

export default function ProjectsV2ColumnEvent({ event }: ProjectsV2ColumnEventProps): React.JSX.Element | null {
  if (!event?.date) {
    return null;
  }

  const column = event.payload?.projects_v2_column;
  const action = event.payload?.action;
  if (!column) {
    return null;
  }

  const columnName = column.name || 'Untitled Column';
  const projectNumber = column.project_number;

  return (
    <Box sx={{ p: '16px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {event.date}
        </Typography>
        <Chip 
          label={`Project #${projectNumber}`}
          size="small"
          color="default"
        />
        <Chip 
          label="column"
          size="small"
          color="info"
        />
        <Chip 
          label={action}
          size="small"
          color={action === 'created' ? 'success' : action === 'deleted' ? 'error' : 'primary'}
        />
      </Box>

      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        {columnName}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Column {action} in project #{projectNumber}
        </Typography>
      </Box>
    </Box>
  );
} 