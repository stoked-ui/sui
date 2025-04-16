import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import { EventDetails } from '../../types/github';

interface CreateEventProps {
  event: EventDetails;
}

export default function CreateEvent({ event }: CreateEventProps): React.JSX.Element | null {
  if (!event?.date) {
    return null;
  }

  const refType = event.payload?.ref_type || 'unknown';
  const refName = event.payload?.ref || 'unknown';
  const repoUrl = `https://github.com/${event.repo}`;
  const description = event.payload?.description;

  return (
    <Box sx={{ p: '16px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {event.date}
        </Typography>
        <Chip 
          label={refType}
          size="small"
          color="success"
        />
      </Box>

      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        <Link 
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none' }}
        >
          Created {refType} {refName}
        </Link>
      </Typography>

      {description && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          in {event.repo}
        </Typography>
      </Box>
    </Box>
  );
} 