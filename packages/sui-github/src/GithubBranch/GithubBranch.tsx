import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import PullRequestView from '../GithubEvents/EventTypes/PullRequest/PullRequestView';
import getBranchCompareDetails from '../apiHandlers/getBranchCompareDetails';
import GithubContributorsList from '../components/GithubContributorsList';
import fetchGithubViewData from '../components/fetchGithubViewData';
import { GithubBranchData, GithubFileHighlight } from '../types/github';

export interface GithubBranchProps {
  owner: string;
  repo: string;
  base: string;
  head: string;
  apiUrl?: string;
  private?: boolean;
  data?: GithubBranchData;
  highlights?: GithubFileHighlight[];
}

function getStatusColor(status: string): 'default' | 'success' | 'warning' | 'info' {
  switch (status) {
    case 'ahead':
    case 'identical':
      return 'success';
    case 'behind':
      return 'warning';
    case 'diverged':
      return 'info';
    default:
      return 'default';
  }
}

async function loadBranchData({
  apiUrl,
  owner,
  repo,
  base,
  head,
}: Pick<GithubBranchProps, 'apiUrl' | 'owner' | 'repo' | 'base' | 'head'>) {
  if (apiUrl) {
    return fetchGithubViewData<GithubBranchData>(apiUrl, { owner, repo, base, head });
  }

  return getBranchCompareDetails({ owner, repo, base, head });
}

export default function GithubBranch({
  owner,
  repo,
  base,
  head,
  apiUrl,
  private: privateMode = false,
  data,
  highlights,
}: GithubBranchProps): React.JSX.Element {
  const [branchData, setBranchData] = React.useState<GithubBranchData | null>(data || null);
  const [loading, setLoading] = React.useState<boolean>(!data && !privateMode);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (privateMode) {
      setBranchData(data || null);
      setLoading(false);
      setError(data ? null : 'Private mode requires pre-generated snapshot data.');
      return undefined;
    }

    if (data) {
      setBranchData(data);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let active = true;

    setLoading(true);
    setError(null);
    setBranchData(null);

    loadBranchData({ apiUrl, owner, repo, base, head })
      .then((nextData) => {
        if (!active) {
          return;
        }

        setBranchData(nextData);
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }

        setError(nextError instanceof Error ? nextError.message : 'Failed to load branch data.');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [apiUrl, base, data, head, owner, privateMode, repo]);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <Chip label={`${owner}/${repo}`} size="small" color="primary" variant="outlined" />
          <Chip label={head} size="small" />
          <Chip label={`base: ${base}`} size="small" variant="outlined" />
          {branchData ? (
            <Chip
              label={branchData.status}
              size="small"
              color={getStatusColor(branchData.status)}
            />
          ) : null}
        </Box>
        <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
          {branchData?.url ? (
            <Link href={branchData.url} target="_blank" rel="noopener noreferrer" underline="hover">
              {branchData.headRef}
            </Link>
          ) : (
            head
          )}
        </Typography>
        {branchData ? (
          <Typography variant="body2" color="text.secondary">
            Comparing against {branchData.baseRef}. {branchData.aheadBy} ahead, {branchData.behindBy}{' '}
            behind, {branchData.totalCommits} commit{branchData.totalCommits === 1 ? '' : 's'} in
            the comparison.
          </Typography>
        ) : null}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {error ? (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      ) : null}

      {branchData ? (
        <React.Fragment>
          <GithubContributorsList
            contributors={branchData.contributors}
            title="Contributors"
          />
          <PullRequestView
            title=""
            number={0}
            commits={branchData.commits}
            files={branchData.files}
            highlights={highlights}
          />
        </React.Fragment>
      ) : null}
    </Box>
  );
}
