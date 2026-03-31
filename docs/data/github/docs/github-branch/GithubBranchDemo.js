import * as React from 'react';
import { GithubBranch } from '@stoked-ui/github';
import branchSnapshot from '../../snapshots/github-branch-private.json';

const owner = 'stoked-ui';
const repo = 'sui';

export default function GithubBranchDemo() {
  return (
    <GithubBranch
      owner={owner}
      repo={repo}
      base={branchSnapshot.baseRef}
      head={branchSnapshot.headRef}
      private
      data={branchSnapshot}
    />
  );
}
