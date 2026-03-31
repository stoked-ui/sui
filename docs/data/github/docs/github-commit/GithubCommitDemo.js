import * as React from 'react';
import { GithubCommit } from '@stoked-ui/github';
import commitSnapshot from '../../snapshots/github-commit-private.json';

const owner = 'stoked-ui';
const repo = 'sui';

export default function GithubCommitDemo() {
  return (
    <GithubCommit
      owner={owner}
      repo={repo}
      commitRef={commitSnapshot.ref}
      private
      data={commitSnapshot}
    />
  );
}
