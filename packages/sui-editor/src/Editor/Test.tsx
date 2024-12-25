import * as React from 'react';
import { styled } from '@mui/material/styles';

const Test = styled('div')<{ rows: number }>(({ theme, rows }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 2fr', // Two columns: left column takes 1 fraction, right column takes 2 fractions
  gridTemplateRows: `repeat(${rows}, 40px)`, // Each row will have a height of 40px
  height: '100vh', // Full viewport height
  '& > div': {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'stretch',
    alignItems: 'stretch',
  },
  '& > div:first-of-type': {
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  '& > div:last-of-type': {
    backgroundColor: theme.palette.background.default,
    overflowX: 'auto', // Horizontal scroll for the right column
  },
}));

const LeftColumn = styled('div')({
  padding: '16px',
  height: '40px',
});

const RightColumn = styled('div')({
  padding: '16px',
  height: '40px',
  width: '2000px'
});

function GridComponent({ rows = 5 }) { // Default number of rows is 5
  return (
    <Test rows={rows}>
      <LeftColumn>
        Left Column
      </LeftColumn>
      <RightColumn>
        Right Column
      </RightColumn>
    </Test>
  );
}

export default GridComponent;
