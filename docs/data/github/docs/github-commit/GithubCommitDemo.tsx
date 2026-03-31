import * as React from 'react';
import { GithubCommit, type GithubCommitData } from '@stoked-ui/github';
import commitSnapshot from '../../snapshots/github-commit-private.json';

const owner = 'stoked-ui';
const repo = 'sui';
const privateCommitSnapshot = commitSnapshot as GithubCommitData;

export default function GithubCommitDemo() {
  return (
    <GithubCommit
      owner={owner}
      repo={repo}
      commitRef={privateCommitSnapshot.ref}
      private
      data={privateCommitSnapshot}
    />
  );
}
