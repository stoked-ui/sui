import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import { EventDetails } from '../../types/github';

interface PushEventProps {
  event: EventDetails;
}

export default function PushEvent({ event }: PushEventProps): React.JSX.Element | null {
  if (!event?.date) {
    return null;
  }

  const commitMessage = event.description || 'No commit message available';
  const commitUrl = event.url || `https://github.com/${event.repo}`;
  const branchName = event.ref?.replace('refs/heads/', '') || 'main';
  const commits = event.payload?.commits || [];
  const commitCount = commits.length;
  const firstCommit = commits[0];

  return (
    <Box sx={{ p: '16px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {event.date}
        </Typography>
        <Chip 
          label={branchName} 
          size="small" 
          color="default"
        />
        <Chip 
          label={`${commitCount} commit${commitCount !== 1 ? 's' : ''}`}
          size="small"
          color="primary"
        />
      </Box>

      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        <Link 
          href={commitUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none' }}
        >
          {commitMessage}
        </Link>
      </Typography>

      {commits.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Commits:
          </Typography>
          <Box component="ul" sx={{ 
            listStyle: 'none', 
            p: 0, 
            m: 0,
            '& li': {
              mb: 1,
              '&:last-child': {
                mb: 0
              }
            }
          }}>
            {commits.map((commit: any, index: number) => (
              <Box 
                component="li" 
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1
                }}
              >
                <Typography 
                  variant="body2" 
                  component="span"
                  sx={{ 
                    color: 'text.secondary',
                    minWidth: '7ch'
                  }}
                >
                  {commit.sha.substring(0, 7)}
                </Typography>
                <Typography variant="body2">
                  {commit.message}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
} 