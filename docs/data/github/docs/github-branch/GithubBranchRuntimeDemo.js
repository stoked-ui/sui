import * as React from 'react';
import { GithubBranch } from '@stoked-ui/github';

const owner = 'stoked-ui';
const repo = 'sui';
const base = 'main';
const head = 'bug/fixAutoDeploySite';

export default function GithubBranchRuntimeDemo() {
  return <GithubBranch owner={owner} repo={repo} base={base} head={head} />;
}
