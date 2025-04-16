import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import CopyIcon from '@mui/icons-material/ContentCopy';
import CheckoutIcon from '@mui/icons-material/CallMade';

const CommitItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    '.commit-actions': {
      visibility: 'visible',
    },
  },
}));

const CommitActions = styled(Box)({
  visibility: 'hidden',
  display: 'flex',
  gap: '8px',
});

interface Commit {
  id: string;
  message: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  hash: string;
}

interface CommitsListProps {
  commits: Commit[];
  onCheckout?: (hash: string) => void;
}

export default function CommitsList({ commits, onCheckout }: CommitsListProps): React.JSX.Element {
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
  };

  return (
    <Box>
      {commits.map((commit) => (
        <CommitItem key={commit.id}>
          <Box sx={{ display: 'flex', width: '100%' }}>
            <Avatar
              src={commit.author.avatar}
              alt={commit.author.name}
              sx={{ width: 32, height: 32, mr: 2 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ mb: 0.5, wordBreak: 'break-word' }}>
                {commit.message}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {commit.author.name} committed {commit.date}
                </Typography>
                <CommitActions className="commit-actions">
                  <IconButton
                    size="small"
                    onClick={() => handleCopyHash(commit.hash)}
                    title="Copy commit SHA"
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onCheckout?.(commit.hash)}
                    title="Checkout commit"
                  >
                    <CheckoutIcon fontSize="small" />
                  </IconButton>
                </CommitActions>
              </Box>
            </Box>
          </Box>
        </CommitItem>
      ))}
    </Box>
  );
} 