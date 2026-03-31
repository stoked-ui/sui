import { GithubCommitData } from '../types/github';
import {
  buildGithubContributors,
  fetchGithubResource,
  getGithubMessageSummary,
  getGithubShortRef,
  normalizeGithubCommit,
  normalizeGithubFile,
  summarizeGithubStats,
} from './githubApi';

type GetCommitDetailsParams = {
  owner: string;
  repo: string;
  ref: string;
};

export default async function getCommitDetails(
  params: GetCommitDetailsParams,
): Promise<GithubCommitData> {
  const { owner, repo, ref } = params;

  if (!owner || !repo || !ref) {
    throw new Error('Missing required parameters: owner, repo, ref');
  }

  const commit = await fetchGithubResource<any>(
    `/repos/${owner}/${repo}/commits/${encodeURIComponent(ref)}`,
  );

  const files = (commit.files || []).map((file: any) => normalizeGithubFile(file));
  const commits = [normalizeGithubCommit(commit)];
  const contributor =
    buildGithubContributors([commit])[0] || {
      login: commits[0].author.login,
      name: commits[0].author.name,
      avatarUrl: commits[0].author.avatar,
      contributions: 1,
    };

  return {
    repo: `${owner}/${repo}`,
    ref: commit.sha || ref,
    shortRef: getGithubShortRef(commit.sha || ref),
    url:
      commit.html_url ||
      `https://github.com/${owner}/${repo}/commit/${encodeURIComponent(commit.sha || ref)}`,
    summary: getGithubMessageSummary(commit.commit?.message || ''),
    message: commit.commit?.message || '',
    committedAt: commit.commit?.author?.date || commit.commit?.committer?.date || '',
    contributor,
    commits,
    files,
    stats: summarizeGithubStats(files),
  };
}
