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
  files?: Array<{
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
}
  