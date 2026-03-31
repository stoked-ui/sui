import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { GithubContributor } from '../types/github';

const ContributorCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

interface GithubContributorsListProps {
  contributors: GithubContributor[];
  title: string;
}

export default function GithubContributorsList({
  contributors,
  title,
}: GithubContributorsListProps): React.JSX.Element | null {
  if (!contributors.length) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {contributors.map((contributor) => (
          <ContributorCard key={`${contributor.login}-${contributor.name}`}>
            <Avatar
              src={contributor.avatarUrl}
              alt={contributor.login}
              sx={{ width: 40, height: 40 }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600}>
                {contributor.login}
              </Typography>
              {contributor.name && contributor.name !== contributor.login ? (
                <Typography variant="caption" color="text.secondary">
                  {contributor.name}
                </Typography>
              ) : null}
            </Box>
            <Chip
              label={`${contributor.contributions} commit${contributor.contributions === 1 ? '' : 's'}`}
              size="small"
              variant="outlined"
            />
          </ContributorCard>
        ))}
      </Box>
    </Box>
  );
}
