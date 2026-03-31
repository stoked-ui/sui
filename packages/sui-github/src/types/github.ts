export interface EventDetails {
  id: string;
  date: string;
  repo: string;
  action: string;
  actionType: string;
  description: string;
  url: string;
  state: string;
  user: string;
  avatarUrl: string;
  number: number;
  merged: boolean;
  comments: number;
  commits: number;
  ref: string;
  commitsList: any[];
  payload?: any;
}

export interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: any;
}

export interface CachedData {
  events: GitHubEvent[];
  lastFetched: number;
  totalCount: number;
} 

export type GithubDiffLineType = 'addition' | 'deletion' | 'context';

export interface GithubDiffLine {
  type: GithubDiffLineType;
  content: string;
  lineNumber: number;
}

export type GithubFileChangeType = 'added' | 'modified' | 'deleted';

export interface GithubChangedFile {
  path: string;
  type: GithubFileChangeType;
  additions: number;
  deletions: number;
  diff: GithubDiffLine[];
}

export interface GithubContributor {
  login: string;
  name: string;
  avatarUrl: string;
  contributions: number;
}

export interface GithubCommitListItem {
  id: string;
  message: string;
  author: {
    name: string;
    login: string;
    avatar: string;
  };
  date: string;
  hash: string;
  url: string;
}

export interface GithubCommitStats {
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface GithubContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface GithubContributionsResponse {
  total: Record<string, number>;
  contributions: GithubContributionDay[];
  countLabel?: string;
}

export interface GithubCommitData {
  repo: string;
  ref: string;
  shortRef: string;
  url: string;
  summary: string;
  message: string;
  committedAt: string;
  contributor: GithubContributor;
  commits: GithubCommitListItem[];
  files: GithubChangedFile[];
  stats: GithubCommitStats;
}

export interface GithubBranchData {
  repo: string;
  baseRef: string;
  headRef: string;
  status: string;
  aheadBy: number;
  behindBy: number;
  totalCommits: number;
  url: string;
  contributors: GithubContributor[];
  commits: GithubCommitListItem[];
  files: GithubChangedFile[];
  stats: GithubCommitStats;
}


export interface PullRequestDetails {
  title: string;
  number: number;
  state: string;
  merged: boolean;
  mergeable: boolean;
  rebaseable: boolean;
  mergeable_state: string;
  merged_by?: {
    login: string;
    avatar_url: string;
  };
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  labels: Array<{
    name: string;
    color: string;
  }>;
  draft: boolean;
  head: {
    ref: string;
    sha: string;
    repo: {
      full_name: string;
    };
  };
  base: {
    ref: string;
    sha: string;
    repo: {
      full_name: string;
    };
  };
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  body: string;
  commits_list?: Array<{
    sha: string;
    commit: {
      message: string;
      author: {
        name: string;
        email: string;
        date: string;
      };
    };
    author: {
      login: string;
      avatar_url: string;
    };
  }>;
  files?: GithubChangedFile[];
}
