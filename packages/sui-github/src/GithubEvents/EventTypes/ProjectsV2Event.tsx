import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import { EventDetails } from '../../types/github';

interface ProjectsV2EventProps {
  event: EventDetails;
}

export default function ProjectsV2Event({ event }: ProjectsV2EventProps): React.JSX.Element | null {
  if (!event?.date) {
    return null;
  }

  const project = event.payload?.projects_v2;
  const action = event.payload?.action;
  if (!project) {
    return null;
  }

  const projectTitle = project.title || 'Untitled Project';
  const projectUrl = project.html_url || `https://github.com/${event.repo}/projects`;
  const projectNumber = project.number;

  return (
    <Box sx={{ p: '16px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {event.date}
        </Typography>
        <Chip 
          label={`#${projectNumber}`}
          size="small"
          color="default"
        />
        <Chip 
          label={action}
          size="small"
          color={action === 'created' ? 'success' : action === 'deleted' ? 'error' : 'primary'}
        />
      </Box>

      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        <Link 
          href={projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none' }}
        >
          {projectTitle}
        </Link>
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Project {action} in {event.repo}
        </Typography>
      </Box>
    </Box>
  );
} 