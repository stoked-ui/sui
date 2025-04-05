/**
 * GridComponent is a styled grid layout component with two columns.
 * 
 * @param {object} props - The props for the GridComponent.
 * @param {number} props.rows - The number of rows in the grid layout.
 * 
 * @returns {JSX.Element} The styled grid layout component.
 * 
 * @example
 * <GridComponent rows={5} />
 */
function GridComponent({ rows = 5 }) {
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

/**
 * Test is a styled div component representing a grid layout.
 * 
 * @typedef {object} TestProps
 * @property {number} rows - The number of rows in the grid layout.
 */
const Test = styled('div')<{ rows: number }>(({ theme, rows }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 2fr',
  gridTemplateRows: `repeat(${rows}, 40px)`,
  height: '100vh',
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
    overflowX: 'auto',
  },
}));

/**
 * LeftColumn is a styled div component for the left column in the grid layout.
 */
const LeftColumn = styled('div')({
  padding: '16px',
  height: '40px',
});

/**
 * RightColumn is a styled div component for the right column in the grid layout.
 */
const RightColumn = styled('div')({
  padding: '16px',
  height: '40px',
  width: '2000px'
});

export default GridComponent;