import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import { EventDetails } from '../../types/github';

interface ProjectsV2ItemEventProps {
  event: EventDetails;
}

export default function ProjectsV2ItemEvent({ event }: ProjectsV2ItemEventProps): React.JSX.Element | null {
  if (!event?.date) {
    return null;
  }

  const item = event.payload?.projects_v2_item;
  const action = event.payload?.action;
  if (!item) {
    return null;
  }

  const itemTitle = item.title || 'Untitled Item';
  const itemUrl = item.html_url;
  const itemType = item.content_type?.toLowerCase() || 'item';
  const projectNumber = item.project_number;

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
          label={itemType}
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
        {itemUrl ? (
          <Link 
            href={itemUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ textDecoration: 'none' }}
          >
            {itemTitle}
          </Link>
        ) : (
          itemTitle
        )}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {itemType} {action} in project #{projectNumber}
        </Typography>
      </Box>
    </Box>
  );
} 