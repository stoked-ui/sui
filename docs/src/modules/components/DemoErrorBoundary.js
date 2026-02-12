import * as React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';

/**
 * Based on https://github.com/sindresorhus/new-github-issue-url/blob/061fa0ddb7d51f3b96d3a0f6a6bebb196f105a7b/index.js
 * with node 8 + IE11 support i.e. not using URL (URLSearchParams.set replaced with Map.set)
 */
function newGitHubIssueUrl(options) {
  const url = `${process.env.SOURCE_CODE_REPO}/issues/new`;

  const query = Object.keys(options)
    .map((type) => {
      const value = options[type];
      return `${type}=${encodeURIComponent(String(value))}`;
    })
    .join('&');

  return `${url}?${query}`;
}
