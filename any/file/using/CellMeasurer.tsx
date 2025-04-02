import * as React from 'react';
import { VariableSizeList } from 'react-window';

function YourComponent() {
  const listRef = React.useRef();
  const sizeMap = React.useRef({});
  const [itemHeights, setItemHeights] = React.useState({});
  
  const getItemSize = (index) => {
    return itemHeights[index] || 30; // default height
  };
  
  const setItemSize = (index, size) => {
    setItemHeights(prev => {
      const newSizes = {...prev, [index]: size};
      if (listRef.current) {
        listRef.current.resetAfterIndex(index);
      }
      return newSizes;
    });
  };
  
  return (
    <VariableSizeList
      ref={listRef}
      width={width}
      height={height}
      itemCount={items.length}
      itemSize={getItemSize}
    >
      {({ index, style }) => (
        <div 
          style={style}
          ref={el => {
            if (el && el.clientHeight !== sizeMap.current[index]) {
              sizeMap.current[index] = el.clientHeight;
              setItemSize(index, el.clientHeight);
            }
          }}
        >
          {items[index]}
        </div>
      )}
    </VariableSizeList>
  );
} 

