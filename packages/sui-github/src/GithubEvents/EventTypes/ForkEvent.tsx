import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import { EventDetails } from '../../types/github';

interface ForkEventProps {
  event: EventDetails;
}

export default function ForkEvent({ event }: ForkEventProps): React.JSX.Element | null {
  if (!event?.date) {
    return null;
  }

  const forkee = event.payload?.forkee;
  if (!forkee) {
    return null;
  }

  const forkUrl = forkee.html_url;
  const forkName = forkee.full_name;
  const originalRepo = event.repo;
  const description = forkee.description;

  return (
    <Box sx={{ p: '16px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {event.date}
        </Typography>
        <Chip 
          label="fork"
          size="small"
          color="info"
        />
      </Box>

      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        <Link 
          href={forkUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none' }}
        >
          {forkName}
        </Link>
      </Typography>

      {description && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Forked from {originalRepo}
        </Typography>
      </Box>
    </Box>
  );
} 