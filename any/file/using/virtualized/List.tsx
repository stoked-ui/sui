import * as React from 'react';
import { FixedSizeList } from 'react-window';

// Inside your component:
// Replace:
// <List
//   width={width}
//   height={height}
//   rowCount={items.length}
//   rowHeight={30}
//   rowRenderer={({ index, key, style }) => (
//     <div key={key} style={style}>
//       {items[index]}
//     </div>
//   )}
// />

// With:
<FixedSizeList
  width={width}
  height={height}
  itemCount={items.length}
  itemSize={30}
>
  {({ index, style }) => (
    <div style={style}>
      {items[index]}
    </div>
  )}
</FixedSizeList> 