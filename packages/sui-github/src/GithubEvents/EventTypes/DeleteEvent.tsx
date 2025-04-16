import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import { EventDetails } from '../../types/github';

interface DeleteEventProps {
  event: EventDetails;
}

export default function DeleteEvent({ event }: DeleteEventProps): React.JSX.Element | null {
  if (!event?.date) {
    return null;
  }

  const refType = event.payload?.ref_type || 'unknown';
  const refName = event.payload?.ref || 'unknown';
  const repoUrl = `https://github.com/${event.repo}`;

  return (
    <Box sx={{ p: '16px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {event.date}
        </Typography>
        <Chip 
          label={refType}
          size="small"
          color="error"
        />
      </Box>

      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        <Link 
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none' }}
        >
          Deleted {refType} {refName}
        </Link>
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          from {event.repo}
        </Typography>
      </Box>
    </Box>
  );
} 