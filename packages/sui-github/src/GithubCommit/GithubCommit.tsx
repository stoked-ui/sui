import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import PullRequestView from '../GithubEvents/EventTypes/PullRequest/PullRequestView';
import getCommitDetails from '../apiHandlers/getCommitDetails';
import GithubContributorsList from '../components/GithubContributorsList';
import fetchGithubViewData from '../components/fetchGithubViewData';
import { GithubCommitData } from '../types/github';

export interface GithubCommitProps {
  owner: string;
  repo: string;
  commitRef: string;
  apiUrl?: string;
  private?: boolean;
  data?: GithubCommitData;
}

function formatCommitDate(value: string) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleString();
}

async function loadCommitData({
  apiUrl,
  owner,
  repo,
  commitRef,
}: Pick<GithubCommitProps, 'apiUrl' | 'owner' | 'repo' | 'commitRef'>) {
  if (apiUrl) {
    return fetchGithubViewData<GithubCommitData>(apiUrl, { owner, repo, ref: commitRef });
  }

  return getCommitDetails({ owner, repo, ref: commitRef });
}

export default function GithubCommit({
  owner,
  repo,
  commitRef,
  apiUrl,
  private: privateMode = false,
  data,
}: GithubCommitProps): React.JSX.Element {
  const [commitData, setCommitData] = React.useState<GithubCommitData | null>(data || null);
  const [loading, setLoading] = React.useState<boolean>(!data && !privateMode);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (privateMode) {
      setCommitData(data || null);
      setLoading(false);
      setError(data ? null : 'Private mode requires pre-generated snapshot data.');
      return undefined;
    }

    if (data) {
      setCommitData(data);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let active = true;

    setLoading(true);
    setError(null);
    setCommitData(null);

    loadCommitData({ apiUrl, owner, repo, commitRef })
      .then((nextData) => {
        if (!active) {
          return;
        }

        setCommitData(nextData);
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }

        setError(nextError instanceof Error ? nextError.message : 'Failed to load commit data.');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [apiUrl, commitRef, data, owner, privateMode, repo]);

  const commitBody =
    commitData && commitData.message !== commitData.summary
      ? commitData.message.replace(commitData.summary, '').trim()
      : '';

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <Chip label={`${owner}/${repo}`} size="small" color="primary" variant="outlined" />
          <Chip label={commitData?.shortRef || commitRef} size="small" />
          {commitData ? (
            <Chip
              label={`${commitData.stats.changedFiles} file${commitData.stats.changedFiles === 1 ? '' : 's'} changed`}
              size="small"
              variant="outlined"
            />
          ) : null}
        </Box>
        <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
          {commitData?.url ? (
            <Link href={commitData.url} target="_blank" rel="noopener noreferrer" underline="hover">
              {commitData.summary}
            </Link>
          ) : (
            commitRef
          )}
        </Typography>
        {commitBody ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: 'pre-line', mb: 1 }}
          >
            {commitBody}
          </Typography>
        ) : null}
        {commitData?.committedAt ? (
          <Typography variant="body2" color="text.secondary">
            Committed {formatCommitDate(commitData.committedAt)}
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

      {commitData ? (
        <React.Fragment>
          <GithubContributorsList contributors={[commitData.contributor]} title="Contributor" />
          <PullRequestView
            title=""
            number={0}
            commits={commitData.commits}
            files={commitData.files}
          />
        </React.Fragment>
      ) : null}
    </Box>
  );
}
