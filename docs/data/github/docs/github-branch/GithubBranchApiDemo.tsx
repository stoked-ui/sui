import * as React from 'react';
import { GithubBranch } from '@stoked-ui/github';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

const owner = 'stoked-ui';
const repo = 'sui';
const base = 'main';
const head = 'bug/fixAutoDeploySite';
const apiUrl = getApiUrl('/api/github/branch');

export default function GithubBranchApiDemo() {
  return <GithubBranch owner={owner} repo={repo} base={base} head={head} apiUrl={apiUrl} />;
}
