import * as React from 'react';
import { GithubCommit } from '@stoked-ui/github';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

const owner = 'stoked-ui';
const repo = 'sui';
const commitRef = '5c90b548a6a5af958d7aa31f78a794874c007886';
const apiUrl = getApiUrl('/api/github/commit');

export default function GithubCommitApiDemo() {
  return <GithubCommit owner={owner} repo={repo} commitRef={commitRef} apiUrl={apiUrl} />;
}
