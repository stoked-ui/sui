import { GithubBranchData } from '../types/github';
import {
  buildGithubContributors,
  fetchGithubResource,
  normalizeGithubCommit,
  normalizeGithubFile,
  summarizeGithubStats,
} from './githubApi';

type GetBranchCompareDetailsParams = {
  owner: string;
  repo: string;
  base: string;
  head: string;
};

export default async function getBranchCompareDetails(
  params: GetBranchCompareDetailsParams,
): Promise<GithubBranchData> {
  const { owner, repo, base, head } = params;

  if (!owner || !repo || !base || !head) {
    throw new Error('Missing required parameters: owner, repo, base, head');
  }

  const compare = await fetchGithubResource<any>(
    `/repos/${owner}/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`,
  );

  const commits = (compare.commits || []).map((commit: any) => normalizeGithubCommit(commit));
  const files = (compare.files || []).map((file: any) => normalizeGithubFile(file));

  return {
    repo: `${owner}/${repo}`,
    baseRef: base,
    headRef: head,
    status: compare.status || 'unknown',
    aheadBy: compare.ahead_by || 0,
    behindBy: compare.behind_by || 0,
    totalCommits: compare.total_commits || commits.length,
    url:
      compare.html_url ||
      `https://github.com/${owner}/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`,
    contributors: buildGithubContributors(compare.commits || []),
    commits,
    files,
    stats: summarizeGithubStats(files),
  };
}
