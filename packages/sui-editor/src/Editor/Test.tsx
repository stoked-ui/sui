/**
 * Styled Test component.
 *
 * @description A styled div element used as the main container for the grid.
 */
import * as React from 'react';
import { styled } from '@mui/material/styles';

const Test = styled('div')<{ rows: number }>(({ theme, rows }) => ({
  /**
   * Display style set to grid for both columns.
   */
  display: 'grid',
  gridTemplateColumns: '1fr 2fr', // Two columns: left column takes 1 fraction, right column takes 2 fractions
  /**
   * Dynamic height of each row based on the number of rows prop.
   */
  gridTemplateRows: `repeat(${rows}, 40px)`, 
  /**
   * Full viewport height for the test component.
   */
  height: '100vh', 
  '& > div': {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'stretch',
    alignItems: 'stretch',
  },
  /**
   * Background color and border style applied to the leftmost div element.
   */
  '& > div:first-of-type': {
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  /**
   * Overflow style applied to the rightmost div element for horizontal scrolling.
   */
  '& > div:last-of-type': {
    backgroundColor: theme.palette.background.default,
    overflowX: 'auto', // Horizontal scroll for the right column
  },
}));

/**
 * Styled LeftColumn component.
 *
 * @description A styled div element used as a container for the left column content.
 */
const LeftColumn = styled('div')({
  padding: '16px',
  height: '40px',
});

/**
 * Styled RightColumn component.
 *
 * @description A styled div element used as a container for the right column content.
 */
const RightColumn = styled('div')({
  padding: '16px',
  height: '40px',
  width: '2000px'
});

function GridComponent({ rows = 5 }) { // Default number of rows is 5
  /**
   * Renders the Test component with dynamic rows prop.
   *
   * @param {number} rows - Number of rows in the grid (default: 5).
   */
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