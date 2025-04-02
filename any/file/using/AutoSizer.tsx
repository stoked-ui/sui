import * as React from 'react';
import useMeasure from 'react-use-measure';

// Replace:
// <AutoSizer>
//   {({ width, height }) => (
//     <YourComponent width={width} height={height} />
//   )}
// </AutoSizer>

// With:
function YourComponent({children}: {children: React.ReactNode}) {
  const [measureRef, { width, height }] = useMeasure();
  
  return (
    <div ref={measureRef} style={{ width: '100%', height: '100%' }}>
      {width > 0 && height > 0 && children}
    </div>
  );
} 

