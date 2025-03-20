import * as React from 'react';
import { styled } from '@mui/system';
import HighlightedCode from '../HighlightedCode';

const DemoCodeViewer = styled(HighlightedCode)(() => ({
  '& pre': {
    margin: 0,
    maxHeight: 'min(68vh, 1000px)',
    display: 'flex',
    flexDirection: 'column',
  },
}));

export default DemoCodeViewer;
