import {useEffect, useState} from 'react';

const useResize = (elementRef) => {
  const [size, setSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: elementRef ? elementRef.current.offsetWidth : window.innerWidth,
        height: elementRef ? elementRef.current.offsetHeight : window.innerHeight,
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
