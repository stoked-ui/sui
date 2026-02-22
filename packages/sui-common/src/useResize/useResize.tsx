import React, {useEffect, useState} from 'react';

const useResize = (elementRef: React.RefObject<HTMLElement> | null) => {
  const [size, setSize] = useState<{ width: number | undefined; height: number | undefined }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: elementRef?.current ? elementRef.current.offsetWidth : window.innerWidth,
        height: elementRef?.current ? elementRef.current.offsetHeight : window.innerHeight,
      });
    };

    if (elementRef && elementRef.current) {
         handleResize();
    } else if (!elementRef) {
        handleResize();
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [elementRef]);

  return size;
};

export default useResize;
