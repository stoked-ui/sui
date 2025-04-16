import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { EventDetails } from '../../types/github';

interface ProjectsV2FieldEventProps {
  event: EventDetails;
}

export default function ProjectsV2FieldEvent({ event }: ProjectsV2FieldEventProps): React.JSX.Element | null {
  if (!event?.date) {
    return null;
  }

  const field = event.payload?.projects_v2_field;
  const action = event.payload?.action;
  if (!field) {
    return null;
  }

  const fieldName = field.name || 'Untitled Field';
  const projectNumber = field.project_number;
  const fieldType = field.data_type || 'Unknown Type';

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
          label="field"
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
        {fieldName}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Field type: {fieldType}
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Field {action} in project #{projectNumber}
      </Typography>
    </Box>
  );
} 