import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import CommitsList from './CommitsList';
import FileChanges from './FileChanges';

// Custom styled components to match GitHub's UI
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    textTransform: 'none',
    minHeight: 48,
    padding: '0 16px',
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      color: theme.palette.text.primary,
    },
  },
}));

const StatsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pr-tabpanel-${index}`}
      aria-labelledby={`pr-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface PullRequestViewProps {
  title: string;
  number: number;
  commits: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      avatar: string;
    };
    date: string;
    hash: string;
  }>;
  files: Array<{
    path: string;
    type: 'added' | 'modified' | 'deleted';
    additions: number;
    deletions: number;
    diff: Array<{
      type: 'addition' | 'deletion' | 'context';
      content: string;
      lineNumber: number;
    }>;
  }>;
  onCheckout?: (hash?: string) => void;
}

export default function PullRequestView({
  title,
  number,
  commits,
  files,
  onCheckout,
}: PullRequestViewProps): React.JSX.Element {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const totalAdditions = files.reduce((sum, file) => sum + file.additions, 0);
  const totalDeletions = files.reduce((sum, file) => sum + file.deletions, 0);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Only render title if it's not empty (means we're not using PrHeader) */}
      {title && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            {title} #{number}
          </Typography>
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <StyledTabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Commits (${commits.length})`} id="pr-tab-0" />
          <Tab label={`Files changed (${files.length})`} id="pr-tab-1" />
        </StyledTabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <CommitsList commits={commits} onCheckout={onCheckout} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2 }}>
          <StatsBox>
            <Typography variant="body2" component="span">
              Showing {files.length} changed files with {totalAdditions} additions and {totalDeletions} deletions
            </Typography>
          </StatsBox>
        </Box>
        <FileChanges files={files} />
      </TabPanel>
    </Box>
  );
} 