import * as React from 'react';
import clsx from 'clsx';
import { styled } from '@mui/system';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { debounce } from '@mui/material/utils';
import { alpha, styled as muiStyled, Theme } from '@mui/material/styles';
import { styled as joyStyled } from '@mui/joy/styles';
import { unstable_useId as useId } from '@mui/utils';
import { lazy } from 'react';

import Collapse from '@mui/material/Collapse';
import NoSsr from '@mui/material/NoSsr';
import HighlightedCode from './HighlightedCode';
import DemoSandbox from './DemoSandbox';
import ReactRunner from './ReactRunner';
import DemoEditor from './DemoEditor';
import CodeCopyButton from './CodeCopyButton';
import DemoCodeViewer from './DemoCodeViewer';
// We import this as a plain import instead of a React.lazy to avoid the need for Suspense
import DemoToolbarComponent from './DemoToolbar';
import DemoToolbarFallback from './DemoToolbarFallback';
import DemoToolbarRoot from './DemoToolbarRoot';

import { CODE_VARIANTS, CODE_STYLING } from './constants';
import { DemoComponentProps } from './types';

const LazyDemoToolbar = lazy(() => import('./DemoToolbar'));

/**
 * Removes leading spaces (indentation) present in the `.tsx` previews
 */
function dedentCode(code: string): string {
  const lines = code.split(/\r?\n/);
  if (lines[0] === '') {
    lines.shift();
  }
  const isIndentedWithTab = /^\t/.test(lines[0]);
  const indentation = isIndentedWithTab
    ? /^\t+/.exec(lines[0])![0].length
    : /^ +/.exec(lines[0])![0].length;

  return lines
    .map((line) => line.substring(indentation))
    .join('\n')
    .replace(/\n$/, '');
}

function Demo(props: DemoComponentProps): JSX.Element {
  // Implementation will come here
  return <div>Demo Component</div>;
}

export default Demo;

