import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import { EventDetails } from '../../types/github';

interface IssuesEventProps {
  event: EventDetails;
}

export default function IssuesEvent({ event }: IssuesEventProps): React.JSX.Element | null {
  if (!event?.date) {
    return null;
  }

  const issue = event.payload?.issue;
  if (!issue) {
    return null;
  }

  const issueTitle = issue.title || event.description;
  const issueUrl = issue.html_url || event.url;
  const issueState = issue.state || 'unknown';
  const issueAction = event.payload?.action || 'unknown';
  const issueNumber = issue.number || event.number;
  const issueUser = issue.user?.login || event.user;
  const issueComments = issue.comments || event.comments;
  const issueLabels = issue.labels || [];

  return (
    <Box sx={{ p: '16px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {event.date}
        </Typography>
        <Chip 
          label={`#${issueNumber}`} 
          size="small" 
          color="default"
        />
        <Chip 
          label={issueState} 
          size="small" 
          color={issueState === 'open' ? 'success' : 'error'}
        />
        <Chip 
          label={`${issueComments} comment${issueComments !== 1 ? 's' : ''}`}
          size="small"
          color="default"
        />
      </Box>

      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        <Link 
          href={issueUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none' }}
        >
          {issueTitle}
        </Link>
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: issueLabels.length > 0 ? 2 : 0 }}>
        <Typography variant="body2" color="text.secondary">
          {issueAction} by {issueUser}
        </Typography>
      </Box>

      {issueLabels.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {issueLabels.map((label: any) => (
            <Chip
              key={label.name}
              label={label.name}
              size="small"
              sx={{
                backgroundColor: `#${label.color}`,
                color: label.color === 'ffffff' ? 'text.primary' : '#fff'
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
} 