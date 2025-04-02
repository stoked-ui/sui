import * as React from 'react';
import { FixedSizeGrid } from 'react-window';

// Replace:
// <Grid
//   width={width}
//   height={height}
//   columnCount={columnCount}
//   columnWidth={100}
//   rowCount={rowCount}
//   rowHeight={30}
//   cellRenderer={({ columnIndex, rowIndex, key, style }) => (
//     <div key={key} style={style}>
//       Cell {rowIndex}, {columnIndex}
//     </div>
//   )}
// />

// With:
<FixedSizeGrid
  width={width}
  height={height}
  columnCount={columnCount}
  columnWidth={100}
  rowCount={rowCount}
  rowHeight={30}
>
  {({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      Cell {rowIndex}, {columnIndex}
    </div>
  )}
</FixedSizeGrid> 

