import * as React from 'react';
import { FixedSizeList } from 'react-window';
import { useWindowSize } from 'react-use';

function YourComponent() {
  const { height: windowHeight } = useWindowSize();
  const listRef = React.useRef();
  const [scrollOffset, setScrollOffset] = React.useState(0);
  
  React.useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div style={{ height: windowHeight, overflow: 'visible' }}>
      <FixedSizeList
        ref={listRef}
        height={windowHeight}
        width={width}
        itemCount={items.length}
        itemSize={30}
        layout="vertical"
        overscanCount={5}
        initialScrollOffset={scrollOffset}
      >
        {({ index, style }) => (
          <div style={style}>
            {items[index]}
          </div>
        )}
      </FixedSizeList>
    </div>
  );
} 

