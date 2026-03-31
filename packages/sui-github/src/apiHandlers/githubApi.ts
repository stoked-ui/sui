import {
  GithubChangedFile,
  GithubCommitListItem,
  GithubCommitStats,
  GithubContributor,
  GithubDiffLine,
  GithubFileChangeType,
} from '../types/github';

const GITHUB_API_BASE_URL = 'https://api.github.com';
const DEFAULT_DIFF_LINE_LIMIT = 24;

type GithubIdentity = {
  login: string;
  name: string;
  avatarUrl: string;
};

function getGithubHeaders() {
  const githubToken = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    'User-Agent': 'stoked-ui-github-components',
    Accept: 'application/vnd.github+json',
  };

  if (githubToken) {
    headers.Authorization = `token ${githubToken}`;
  }

  return headers;
}

export async function fetchGithubResource<T>(path: string): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE_URL}${path}`, {
    headers: getGithubHeaders(),
  });

  const rateLimit = {
    remaining: response.headers.get('x-ratelimit-remaining'),
    reset: response.headers.get('x-ratelimit-reset'),
  };

  if (!response.ok) {
    const body = await response.text();

    if (response.status === 403 && rateLimit.remaining === '0') {
      const resetDate = rateLimit.reset
        ? new Date(Number(rateLimit.reset) * 1000).toLocaleString()
        : 'later';
      throw new Error(`GitHub rate limit exceeded. Resets at ${resetDate}.`);
    }

    throw new Error(body || `GitHub API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function parseGithubDiff(
  patch: string | undefined,
  maxLines = DEFAULT_DIFF_LINE_LIMIT,
): GithubDiffLine[] {
  if (!patch) {
    return [];
  }

  const patchLines = patch.split('\n');
  const visibleLines = patchLines.slice(0, maxLines);
  const diffLines = visibleLines.map((line, index) => {
    let type: GithubDiffLine['type'] = 'context';

    if (line.startsWith('+')) {
      type = 'addition';
    } else if (line.startsWith('-')) {
      type = 'deletion';
    }

    return {
      type,
      content: line,
      lineNumber: index + 1,
    };
  });

  if (patchLines.length > maxLines) {
    diffLines.push({
      type: 'context',
      content: `... ${patchLines.length - maxLines} more diff lines`,
      lineNumber: diffLines.length + 1,
    });
  }

  return diffLines;
}

function toFileChangeType(status: string | undefined): GithubFileChangeType {
  switch (status) {
    case 'added':
      return 'added';
    case 'removed':
      return 'deleted';
    default:
      return 'modified';
  }
}

export function normalizeGithubFile(
  file: {
    filename?: string;
    path?: string;
    status?: string;
    additions?: number;
    deletions?: number;
    patch?: string;
    diff?: GithubDiffLine[];
  },
  maxDiffLines = DEFAULT_DIFF_LINE_LIMIT,
): GithubChangedFile {
  return {
    path: file.filename || file.path || 'unknown',
    type: toFileChangeType(file.status),
    additions: file.additions || 0,
    deletions: file.deletions || 0,
    diff: file.diff || parseGithubDiff(file.patch, maxDiffLines),
  };
}

function getGithubIdentity(commit: any): GithubIdentity {
  const apiAuthor = commit.author || commit.committer || {};
  const commitAuthor = commit.commit?.author || commit.commit?.committer || {};

  return {
    login:
      apiAuthor.login ||
      commitAuthor.name ||
      commitAuthor.email ||
      commit.sha ||
      'unknown',
    name:
      commitAuthor.name ||
      apiAuthor.login ||
      commitAuthor.email ||
      'Unknown author',
    avatarUrl: apiAuthor.avatar_url || '',
  };
}

export function normalizeGithubCommit(commit: any): GithubCommitListItem {
  const identity = getGithubIdentity(commit);

  return {
    id: commit.sha || commit.node_id || identity.login,
    message: commit.commit?.message || '',
    author: {
      name: identity.name,
      login: identity.login,
      avatar: identity.avatarUrl,
    },
    date: commit.commit?.author?.date || commit.commit?.committer?.date || '',
    hash: commit.sha || '',
    url: commit.html_url || '',
  };
}

export function buildGithubContributors(commits: any[]): GithubContributor[] {
  const contributors = new Map<string, GithubContributor>();

  commits.forEach((commit) => {
    const identity = getGithubIdentity(commit);
    const key = identity.login || identity.name;
    const current = contributors.get(key);

    if (current) {
      current.contributions += 1;
      if (!current.avatarUrl && identity.avatarUrl) {
        current.avatarUrl = identity.avatarUrl;
      }
      if (current.name === 'Unknown author' && identity.name) {
        current.name = identity.name;
      }
      return;
    }

    contributors.set(key, {
      login: identity.login,
      name: identity.name,
      avatarUrl: identity.avatarUrl,
      contributions: 1,
    });
  });

  return Array.from(contributors.values()).sort((a, b) => {
    if (b.contributions !== a.contributions) {
      return b.contributions - a.contributions;
    }

    return a.login.localeCompare(b.login);
  });
}

export function summarizeGithubStats(files: GithubChangedFile[]): GithubCommitStats {
  return files.reduce<GithubCommitStats>(
    (stats, file) => ({
      additions: stats.additions + file.additions,
      deletions: stats.deletions + file.deletions,
      changedFiles: stats.changedFiles + 1,
    }),
    {
      additions: 0,
      deletions: 0,
      changedFiles: 0,
    },
  );
}

export function getGithubMessageSummary(message: string) {
  return message.split('\n')[0]?.trim() || 'Untitled commit';
}

export function getGithubShortRef(ref: string, length = 7) {
  if (!ref) {
    return '';
  }

  return ref.length > length ? ref.slice(0, length) : ref;
}
