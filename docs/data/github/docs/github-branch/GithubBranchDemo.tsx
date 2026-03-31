import * as React from 'react';
import { GithubBranch, type GithubBranchData } from '@stoked-ui/github';
import branchSnapshot from '../../snapshots/github-branch-private.json';

const owner = 'stoked-ui';
const repo = 'sui';
const privateBranchSnapshot = branchSnapshot as GithubBranchData;

export default function GithubBranchDemo() {
  return (
    <GithubBranch
      owner={owner}
      repo={repo}
      base={privateBranchSnapshot.baseRef}
      head={privateBranchSnapshot.headRef}
      private
      data={privateBranchSnapshot}
    />
  );
}
